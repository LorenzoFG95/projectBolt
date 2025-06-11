
-- =========================================================
--  Schema: portale_appalti (MySQL 8+)
--  Descrizione: tabelle normalizzate per Avvisi, Gare, OCDS
--  e tracciato ANAC “schede CIG”, SENZA colonne JSON raw.
--  Creato: 2025‑06‑09
-- =========================================================

-- Assicurati di lanciare prima:
--   CREATE DATABASE IF NOT EXISTS portale_appalti CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--   USE portale_appalti;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/* ---------------------------------------------------------
   Lookup tables
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS natura_principale (
  id              INT            NOT NULL AUTO_INCREMENT,
  codice          VARCHAR(20)    NOT NULL UNIQUE,
  descrizione     VARCHAR(100)   NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS criterio_aggiudicazione (
  id              INT            NOT NULL AUTO_INCREMENT,
  codice          VARCHAR(10)    NOT NULL UNIQUE,
  descrizione     VARCHAR(100)   NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stato_procedura (
  id              INT            NOT NULL AUTO_INCREMENT,
  codice          VARCHAR(20)    NOT NULL UNIQUE,
  descrizione     VARCHAR(100)   NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tipo_avviso (
  id              INT            NOT NULL AUTO_INCREMENT,
  codice          VARCHAR(30)    NOT NULL UNIQUE,
  descrizione     VARCHAR(100),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Dizionari tecnico‑normativi
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS categoria_cpv (
  id              INT            NOT NULL AUTO_INCREMENT,
  codice          VARCHAR(10)    NOT NULL UNIQUE,
  descrizione     VARCHAR(255)   NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nuts (
  codice          VARCHAR(5)     NOT NULL,
  descrizione     VARCHAR(255)   NOT NULL,
  livello         SMALLINT,
  PRIMARY KEY (codice)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Anagrafica enti
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS ente_appaltante (
  id                       INT             NOT NULL AUTO_INCREMENT,
  codice_ausa              VARCHAR(20)     UNIQUE,
  codice_fiscale           VARCHAR(16)     UNIQUE,
  partita_iva              VARCHAR(20),
  denominazione            VARCHAR(255)    NOT NULL,
  regione                  VARCHAR(100),
  citta                    VARCHAR(100),
  indirizzo                TEXT,
  istat_comune             VARCHAR(9),
  sezione_regionale        VARCHAR(150),
  PRIMARY KEY (id),
  KEY idx_ente_cf (codice_fiscale),
  KEY idx_ente_ausa (codice_ausa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Gara (procedura di affidamento)
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS gara (
  id                         BIGINT         NOT NULL AUTO_INCREMENT,
  ocid                       VARCHAR(50)    UNIQUE,
  cig                        VARCHAR(20),
  cup                        VARCHAR(20),
  ente_appaltante_id         INT,
  natura_principale_id       INT,
  criterio_aggiudicazione_id INT,
  stato_procedura_id         INT,
  descrizione                TEXT,
  data_pubblicazione         DATETIME,
  scadenza_offerta           DATETIME,
  importo_totale             DECIMAL(18,2),
  importo_sicurezza          DECIMAL(18,2),
  valuta                     CHAR(3),
  PRIMARY KEY (id),
  KEY idx_gara_ente   (ente_appaltante_id),
  KEY idx_gara_cig    (cig),
  CONSTRAINT fk_gara_ente     FOREIGN KEY (ente_appaltante_id)       REFERENCES ente_appaltante(id),
  CONSTRAINT fk_gara_nat      FOREIGN KEY (natura_principale_id)     REFERENCES natura_principale(id),
  CONSTRAINT fk_gara_criterio FOREIGN KEY (criterio_aggiudicazione_id)REFERENCES criterio_aggiudicazione(id),
  CONSTRAINT fk_gara_stato    FOREIGN KEY (stato_procedura_id)       REFERENCES stato_procedura(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Avvisi e comunicazioni
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS avviso_gara (
  id                    CHAR(36)      NOT NULL,
  gara_id               BIGINT        NOT NULL,
  id_appalto            CHAR(36),
  tipo_avviso_id        INT,
  codice_scheda         VARCHAR(20),
  data_pubblicazione    DATETIME,
  data_scadenza         DATETIME,
  data_pcp              DATETIME,
  attivo                TINYINT(1)    DEFAULT 1,
  nuovo_avviso          CHAR(36),
  PRIMARY KEY (id),
  KEY idx_avviso_gara   (gara_id),
  CONSTRAINT fk_avviso_gara  FOREIGN KEY (gara_id)      REFERENCES gara(id),
  CONSTRAINT fk_avviso_tipo  FOREIGN KEY (tipo_avviso_id)REFERENCES tipo_avviso(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Lotto
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS lotto (
  id                         BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                    BIGINT        NOT NULL,
  codice_lot                 VARCHAR(50),
  cig                        VARCHAR(20),
  descrizione                TEXT,
  natura_principale_id       INT,
  valore                     DECIMAL(18,2),
  valuta                     CHAR(3),
  status                     VARCHAR(20),
  criterio_aggiudicazione_id INT,
  cpv_id                     INT,
  nuts_code                  VARCHAR(5),
  termine_ricezione          DATETIME,
  accordo_quadro             VARCHAR(100),
  sistema_dinamico_acq       VARCHAR(150),
  asta_elettronica           TINYINT(1),
  luogo_istat                VARCHAR(10),
  PRIMARY KEY (id),
  KEY idx_lotto_gara (gara_id),
  KEY idx_lotto_cpv  (cpv_id),
  KEY idx_lotto_nuts (nuts_code),
  CONSTRAINT fk_lotto_gara     FOREIGN KEY (gara_id)               REFERENCES gara(id),
  CONSTRAINT fk_lotto_nat      FOREIGN KEY (natura_principale_id)  REFERENCES natura_principale(id),
  CONSTRAINT fk_lotto_criterio FOREIGN KEY (criterio_aggiudicazione_id) REFERENCES criterio_aggiudicazione(id),
  CONSTRAINT fk_lotto_cpv      FOREIGN KEY (cpv_id)                REFERENCES categoria_cpv(id),
  CONSTRAINT fk_lotto_nuts     FOREIGN KEY (nuts_code)             REFERENCES nuts(codice)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Pivot per CPV/NUTS multipli */

CREATE TABLE IF NOT EXISTS lotto_cpv (
  lotto_id    BIGINT     NOT NULL,
  cpv_id      INT        NOT NULL,
  PRIMARY KEY (lotto_id, cpv_id),
  CONSTRAINT fk_lcpv_lotto FOREIGN KEY (lotto_id) REFERENCES lotto(id) ON DELETE CASCADE,
  CONSTRAINT fk_lcpv_cpv   FOREIGN KEY (cpv_id)   REFERENCES categoria_cpv(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lotto_nuts (
  lotto_id    BIGINT     NOT NULL,
  nuts_code   VARCHAR(5) NOT NULL,
  PRIMARY KEY (lotto_id, nuts_code),
  CONSTRAINT fk_lnuts_lotto FOREIGN KEY (lotto_id)  REFERENCES lotto(id) ON DELETE CASCADE,
  CONSTRAINT fk_lnuts_nuts  FOREIGN KEY (nuts_code) REFERENCES nuts(codice)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Items (OCDS)
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS item (
  id            VARCHAR(50)  NOT NULL,
  lot_id        BIGINT       NOT NULL,
  description   TEXT,
  cpv_id        INT,
  amount        DECIMAL(18,2),
  currency      CHAR(3),
  PRIMARY KEY (id),
  KEY idx_item_lot (lot_id),
  CONSTRAINT fk_item_lot FOREIGN KEY (lot_id) REFERENCES lotto(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_cpv FOREIGN KEY (cpv_id) REFERENCES categoria_cpv(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Award & Contract (OCDS)
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS award (
  id             VARCHAR(50)  NOT NULL,
  gara_id        BIGINT       NOT NULL,
  status         VARCHAR(20),
  date_awarded   DATE,
  amount         DECIMAL(18,2),
  currency       CHAR(3),
  PRIMARY KEY (id),
  KEY idx_award_gara (gara_id),
  CONSTRAINT fk_award_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contract (
  id             VARCHAR(50)  NOT NULL,
  award_id       VARCHAR(50)  NOT NULL,
  start_date     DATE,
  end_date       DATE,
  amount         DECIMAL(18,2),
  currency       CHAR(3),
  status         VARCHAR(20),
  PRIMARY KEY (id),
  KEY idx_contract_award (award_id),
  CONSTRAINT fk_contract_award FOREIGN KEY (award_id) REFERENCES award(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Ciclo di vita CIG / ANAC
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS bando_dettaglio (
  id                       BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                  BIGINT        NOT NULL,
  data_scadenza_offerta    DATETIME,
  importo_lotto            DECIMAL(18,2),
  importo_sicurezza        DECIMAL(18,2),
  tipo_scelta_contraente   VARCHAR(100),
  flag_urgenza             TINYINT(1),
  PRIMARY KEY (id),
  KEY idx_bd_gara (gara_id),
  CONSTRAINT fk_bd_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aggiudicazione_gara (
  id                         BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                    BIGINT        NOT NULL,
  status                     VARCHAR(20),
  date_aggiudicazione        DATETIME,
  criterio_aggiudicazione_id INT,
  importo_aggiudicazione     DECIMAL(18,2),
  minimo_ribasso             DECIMAL(8,2),
  massimo_ribasso            DECIMAL(8,2),
  soglia_anomalia            DECIMAL(8,2),
  numero_invitate            INT,
  numero_offerte             INT,
  numero_offerte_ammissibili INT,
  numero_offerte_escluse     INT,
  ribasso_aggiudicazione     DECIMAL(8,2),
  PRIMARY KEY (id),
  KEY idx_aggiud_gara (gara_id),
  CONSTRAINT fk_aggiud_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE,
  CONSTRAINT fk_aggiud_criterio FOREIGN KEY (criterio_aggiudicazione_id) REFERENCES criterio_aggiudicazione(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avvio_contratto (
  id                      BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                 BIGINT        NOT NULL,
  award_id                VARCHAR(50),
  data_stipula            DATE,
  data_esecutivita        DATE,
  data_inizio_effettiva   DATE,
  data_termine_contrattuale DATE,
  consegna_sotto_riserva  TINYINT(1),
  consegna_frazionata     TINYINT(1),
  PRIMARY KEY (id),
  KEY idx_avvio_gara (gara_id),
  CONSTRAINT fk_avvio_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stato_avanzamento (
  id                       BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                  BIGINT        NOT NULL,
  progressivo_sal          INT,
  denominazione_sal        VARCHAR(120),
  data_emissione_sal       DATE,
  data_cert_pagamento      DATE,
  importo_sal              DECIMAL(18,2),
  importo_cert_pagamento   DECIMAL(18,2),
  flag_ritardo             TINYINT(1),
  giorni_scostamento       INT,
  giorni_proroga           INT,
  PRIMARY KEY (id),
  KEY idx_sal_gara (gara_id),
  CONSTRAINT fk_sal_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS variante (
  id                   BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id              BIGINT        NOT NULL,
  id_variante          VARCHAR(50),
  data_approvazione    DATE,
  data_atto_aggiuntivo DATE,
  giorni_proroga       INT,
  motivo_variante      VARCHAR(255),
  importo_variante     DECIMAL(18,2),
  PRIMARY KEY (id),
  KEY idx_var_gara (gara_id),
  CONSTRAINT fk_var_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collaudo (
  id                         BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                    BIGINT        NOT NULL,
  data_nomina                DATE,
  data_inizio_operazioni     DATE,
  data_regolare_esecuzione   DATE,
  data_coll_stat             DATE,
  data_cert_collaudo         DATE,
  esito                      VARCHAR(100),
  importo_contenz_risolto    DECIMAL(18,2),
  riserve_definite           DECIMAL(18,2),
  riserve_avanzate           DECIMAL(18,2),
  PRIMARY KEY (id),
  KEY idx_col_gara (gara_id),
  CONSTRAINT fk_col_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sospensione (
  id                  BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id             BIGINT        NOT NULL,
  data_sospensione    DATE,
  data_ripresa        DATE,
  codice_motivo       VARCHAR(20),
  descrizione_motivo  VARCHAR(255),
  PRIMARY KEY (id),
  KEY idx_sosp_gara (gara_id),
  CONSTRAINT fk_sosp_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fine_contratto (
  id                           BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                      BIGINT        NOT NULL,
  data_conclusione_anticipata  DATE,
  motivo_interruzione_anticipata VARCHAR(255),
  motivo_risoluzione           VARCHAR(255),
  data_ultimazione             DATE,
  importo_somme_liquidate      DECIMAL(18,2),
  giorni_proroga               INT,
  PRIMARY KEY (id),
  KEY idx_fc_gara (gara_id),
  CONSTRAINT fk_fc_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fonti_finanziamento (
  id                                           BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                                      BIGINT        NOT NULL,
  fondi_bilancio_sa                            DECIMAL(18,2),
  fondi_bilancio_competente                    DECIMAL(18,2),
  entrate_vincolata_pubblica_comunitaria       DECIMAL(18,2),
  entrate_vincolata_pubblica_naz_reg           DECIMAL(18,2),
  entrate_vincolata_pubblica_naz_altri         DECIMAL(18,2),
  entrate_vincolata_privati                    DECIMAL(18,2),
  entrate_vincolata_pubblica_naz_centrale      DECIMAL(18,2),
  entrate_vincolata_pubblica_naz_locale        DECIMAL(18,2),
  mutuo                                        DECIMAL(18,2),
  trasferimento_immobili                       DECIMAL(18,2),
  apporto_capitali_privati                     DECIMAL(18,2),
  sfruttamento_economico                       DECIMAL(18,2),
  altro                                        DECIMAL(18,2),
  PRIMARY KEY (id),
  KEY idx_ff_gara (gara_id),
  CONSTRAINT fk_ff_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ---------------------------------------------------------
   Partecipanti & Subappalti (opzionali)
--------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS partecipante (
  id                 BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id            BIGINT        NOT NULL,
  codice_fiscale     VARCHAR(16),
  denominazione      VARCHAR(255),
  tipo_soggetto      VARCHAR(50),
  ruolo              VARCHAR(100),
  flag_aggiudicatario TINYINT(1),
  PRIMARY KEY (id),
  KEY idx_part_gara (gara_id),
  CONSTRAINT fk_part_gara FOREIGN KEY (gara_id) REFERENCES gara(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subappalto (
  id                     BIGINT        NOT NULL AUTO_INCREMENT,
  gara_id                BIGINT        NOT NULL,
  subappaltatore_cf      VARCHAR(16),
  ragione_sociale        VARCHAR(255),
  oggetto                TEXT,
  cpv_id                 INT,
  importo_presunto       DECIMAL(18,2),
  importo_effettivo      DECIMAL(18,2),
  data_autorizzazione    DATE,
  PRIMARY KEY (id),
  KEY idx_sub_gara (gara_id),
  CONSTRAINT fk_sub_gara FOREIGN KEY (gara_id) REFERENCES gara(id)  ON DELETE CASCADE,
  CONSTRAINT fk_sub_cpv  FOREIGN KEY (cpv_id)  REFERENCES categoria_cpv(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

/* ---------------------------------------------------------
   Popola lookup di base (facoltativo)
--------------------------------------------------------- */

INSERT IGNORE INTO natura_principale (codice,descrizione) VALUES
 ('works','Lavori'),
 ('goods','Forniture'),
 ('services','Servizi');

INSERT IGNORE INTO stato_procedura (codice,descrizione) VALUES
 ('planning','Programmazione'),
 ('active','In corso'),
 ('complete','Conclusa'),
 ('cancelled','Annullata'),
 ('unsuccessful','Senza esito');

