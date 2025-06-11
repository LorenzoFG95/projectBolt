#!/usr/bin/env python3
"""
json_to_portale_appalti.py

Script di importazione dei file JSON provenienti dal Portale Appalti
nel database MySQL normalizzato definito in portale_appalti_schema2.sql.

* Richiede Python 3.9+
* Richiede i pacchetti: mysql‑connector‑python, python‑dateutil

Esempio d’uso:
    export DB_HOST=localhost
    export DB_USER=appalti
    export DB_PASSWORD=mypassword
    export DB_NAME=portale_appalti

    # Cartella con tanti *.json
    python json_to_portale_appalti.py --input ./dump/2025‑06‑05

    # File unico con array JSON
    python json_to_portale_appalti.py --input ./dump/2025‑06‑05.json
"""
import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import mysql.connector
from dateutil import parser as dtparser

# ------------------------------------------------------------
# Configurazione logging
# ------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------
# Mapping di comodo -> valori lookup DB
# ------------------------------------------------------------
NATURA_MAP = {
    "Servizi": "services",
    "Forniture": "goods",
    "Lavori": "works",
}

CRITERIO_MAP = {
    "Prezzo": "price",
    "Qualità": "quality",
    # Aggiungi qui eventuali altri criteri presenti nei JSON
}

# ------------------------------------------------------------
# Helpers DB
# ------------------------------------------------------------

def get_connection():
    """Apre la connessione usando variabili d’ambiente."""
    cfg = {
        "host": os.environ.get("DB_HOST", "127.0.0.1"),
        "port": int(os.environ.get("DB_PORT", "3306")),
        "user": os.environ.get("DB_USER", "root"),
        "password": os.environ.get("DB_PASSWORD", "nuova_password_sicura"),
        "database": os.environ.get("DB_NAME", "portale_appalti"),
        "charset": "utf8mb4",
        "autocommit": False,
    }
    return mysql.connector.connect(**cfg)


def fetch_id(cursor, table: str, key_col: str, key_val: str, create_if_missing: bool = False, **extra_cols) -> Optional[int]:
    """Ritorna l’ID intero di una lookup; opzionalmente la crea se manca."""
    sql = f"SELECT id FROM {table} WHERE {key_col} = %s"
    cursor.execute(sql, (key_val,))
    row = cursor.fetchone()
    if row:
        return row[0]
    if not create_if_missing:
        return None
    cols = [key_col, *extra_cols.keys()]
    placeholders = ["%s"] * len(cols)
    sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
    cursor.execute(sql, (key_val, *extra_cols.values()))
    return cursor.lastrowid


def parse_datetime(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        return dtparser.isoparse(value)
    except Exception as exc:
        logger.warning("Impossibile parse datetime '%s': %s", value, exc)
        return None

# ------------------------------------------------------------
# Import logic
# ------------------------------------------------------------

def process_notice(cur, data: Dict[str, Any]):
    """Processa un singolo avviso e relative sezioni."""
    avviso_id = data.get("idAvviso")
    id_appalto = data.get("idAppalto")  # OCID/company unique id

    # ----------------------------------------------------
    # Ente appaltante (solo 1 in SEZ. A)
    # ----------------------------------------------------
    ente_info = (
        data["template"][0]["template"]["sections"][0]["fields"]["soggetti_sa"][0]
    )
    cf_ente = ente_info.get("codice_fiscale")
    denom_ente = ente_info.get("denominazione_amministrazione")
    ente_id = fetch_id(
        cur,
        "ente_appaltante",
        "codice_fiscale",
        cf_ente,
        create_if_missing=True,
        denominazione=denom_ente,  # Rimuovi il parametro 'descrizione'
    )

    # ----------------------------------------------------
    # Gara
    # ----------------------------------------------------
    descrizione_gara = data["template"][0]["template"]["metadata"]["descrizione"]
    data_pub = parse_datetime(data.get("dataPubblicazione"))

    sql_gara = (
        "INSERT INTO gara (ocid, ente_appaltante_id, descrizione, data_pubblicazione) "
        "VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)"
    )
    cur.execute(sql_gara, (id_appalto, ente_id, descrizione_gara, data_pub))
    gara_id = cur.lastrowid

    # ----------------------------------------------------
    # Avviso
    # ----------------------------------------------------
    data_scad = parse_datetime(data.get("dataScadenza"))
    data_pcp = parse_datetime(data["template"][0]["avviso"][0].get("dataPCP"))
    cur.execute(
        """
        INSERT INTO avviso_gara (id, gara_id, id_appalto, codice_scheda, data_pubblicazione, data_scadenza, data_pcp)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE gara_id=VALUES(gara_id)
        """,
        (
            avviso_id,
            gara_id,
            id_appalto,
            data.get("codiceScheda"),
            data_pub,
            data_scad,
            data_pcp,
        ),
    )
    
    # ----------------------------------------------------
    # Bando dettaglio (aggiunto per tipo_procedura_aggiudicazione)
    # ----------------------------------------------------
    # Cerca il campo tipo_procedura_aggiudicazione nella sezione B
    tipo_procedura = None
    for section in data["template"][0]["template"]["sections"]:
        if section["name"] == "SEZ. B - Dati Generali" and "fields" in section:
            tipo_procedura = section["fields"].get("tipo_procedura_aggiudicazione")
            break
    
    # Se trovato, inserisci nella tabella bando_dettaglio
    if tipo_procedura:
        cur.execute(
            """
            INSERT INTO bando_dettaglio (gara_id, tipo_scelta_contraente)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE tipo_scelta_contraente = VALUES(tipo_scelta_contraente)
            """,
            (gara_id, tipo_procedura)
        )

    # ----------------------------------------------------
    # Lotti
    # ----------------------------------------------------
    items = (
        data["template"][0]["template"]["sections"][2]["items"]
    )
    for lot in items:
        if lot.get("tipo_oggetto") != "lotto":
            continue
        natura_code = NATURA_MAP.get(lot.get("natura_principale"))
        natura_id = fetch_id(
            cur,
            "natura_principale",
            "codice",
            natura_code,
        )
        criterio_code = CRITERIO_MAP.get(lot.get("criteri_aggiudicazione"))
        criterio_id = fetch_id(cur, "criterio_aggiudicazione", "codice", criterio_code)
        termine = parse_datetime(lot.get("termine_ricezione"))
        cur.execute(
            """
            INSERT INTO lotto (
              gara_id, cig, descrizione, natura_principale_id, valore,
              criterio_aggiudicazione_id, termine_ricezione, accordo_quadro,
              sistema_dinamico_acq, asta_elettronica, luogo_istat
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
            """,
            (
                gara_id,
                lot.get("cig"),
                lot.get("descrizione"),
                natura_id,
                lot.get("valore_complessivo_stimato"),
                criterio_id,
                termine,
                lot.get("accordo_quadro"),
                lot.get("sistema_dinamico_acquisizione"),
                1 if lot.get("asta_elettronica", "false").lower() == "true" else 0,
                lot.get("luogo_istat")[:10] if lot.get("luogo_istat") else None,  # Limita a 10 caratteri
            ),
        )

    logger.info("Importata gara %s (%s) con %d lotti", descrizione_gara[:60], id_appalto, len(items))


# ------------------------------------------------------------
# CLI
# ------------------------------------------------------------

def iter_json_objects(path: Path):
    """Yield dicts from file o directory."""
    if path.is_dir():
        for file in sorted(path.glob("*.json")):
            with file.open("r", encoding="utf-8") as fp:
                yield json.load(fp)
    else:
        # File unico: può essere obj singolo o array
        with path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
            if isinstance(data, list):
                yield from data
            else:
                yield data


def main():
    parser = argparse.ArgumentParser(description="Import JSON Portale Appalti nel DB MySQL")
    parser.add_argument("--input", required=True, help="Percorso a file .json o directory")
    args = parser.parse_args()

    path = Path(args.input)
    if not path.exists():
        logger.error("Percorso %s non trovato", path)
        sys.exit(1)

    conn = get_connection()
    cur = conn.cursor()

    try:
        for obj in iter_json_objects(path):
            process_notice(cur, obj)
        conn.commit()
    except Exception as exc:
        logger.exception("Errore durante l’import: %s", exc)
        conn.rollback()
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
