import { OCDSTender, TenderFilters, PaginatedResponse } from '../types/ocds.js';
import { pool } from '../config/database.js';

class TenderService {
  async getTenders(
    page: number = 1,
    limit: number = 10,
    filters: TenderFilters = {}
  ): Promise<PaginatedResponse<OCDSTender>> {
    try {
      // Costruzione della query base
      let query = `
        SELECT 
          g.id, g.ocid, g.cig, g.descrizione AS title, g.data_pubblicazione,
          g.importo_totale, g.valuta,
          e.id AS ente_id, e.denominazione AS ente_nome, e.codice_fiscale AS ente_cf,
          sp.codice AS status,
          np.codice AS categoria,
          l.id AS lotto_id, l.cig AS lotto_cig, l.descrizione AS lotto_desc,
          l.valore AS lotto_valore, l.termine_ricezione,
          cpv.codice AS cpv_code, cpv.descrizione AS cpv_desc,
          ca.codice AS criterio_codice
        FROM gara g
        LEFT JOIN ente_appaltante e ON g.ente_appaltante_id = e.id
        LEFT JOIN stato_procedura sp ON g.stato_procedura_id = sp.id
        LEFT JOIN natura_principale np ON g.natura_principale_id = np.id
        LEFT JOIN lotto l ON l.gara_id = g.id
        LEFT JOIN categoria_cpv cpv ON l.cpv_id = cpv.id
        LEFT JOIN criterio_aggiudicazione ca ON g.criterio_aggiudicazione_id = ca.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      
      // Applicazione dei filtri
      if (filters.search) {
        query += ` AND (g.descrizione LIKE ? OR g.cig LIKE ? OR e.denominazione LIKE ?)`;
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (filters.contractingAuthority) {
        query += ` AND e.denominazione LIKE ?`;
        queryParams.push(`%${filters.contractingAuthority}%`);
      }
      
      if (filters.cpvCode) {
        query += ` AND (cpv.codice LIKE ? OR cpv.descrizione LIKE ?)`;
        queryParams.push(`%${filters.cpvCode}%`, `%${filters.cpvCode}%`);
      }
      
      if (filters.status) {
        query += ` AND sp.codice = ?`;
        queryParams.push(filters.status);
      }
      
      if (filters.dateFrom) {
        query += ` AND g.data_pubblicazione >= ?`;
        queryParams.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ` AND g.data_pubblicazione <= ?`;
        queryParams.push(filters.dateTo);
      }
      
      if (filters.minValue) {
        query += ` AND g.importo_totale >= ?`;
        queryParams.push(filters.minValue);
      }
      
      if (filters.maxValue) {
        query += ` AND g.importo_totale <= ?`;
        queryParams.push(filters.maxValue);
      }
      
      if (filters.category) {
        query += ` AND np.codice = ?`;
        queryParams.push(filters.category);
      }
      
      // Query per contare il totale dei risultati
      // Costruisci una query di conteggio separata
      let countQuery = `
        SELECT COUNT(DISTINCT g.id) as total
        FROM gara g
        LEFT JOIN ente_appaltante e ON g.ente_appaltante_id = e.id
        LEFT JOIN stato_procedura sp ON g.stato_procedura_id = sp.id
        LEFT JOIN natura_principale np ON g.natura_principale_id = np.id
        LEFT JOIN lotto l ON l.gara_id = g.id
        LEFT JOIN categoria_cpv cpv ON l.cpv_id = cpv.id
        LEFT JOIN criterio_aggiudicazione ca ON g.criterio_aggiudicazione_id = ca.id
        WHERE 1=1
      `;
      
      // Applica gli stessi filtri alla query di conteggio
      // (Copia qui le stesse condizioni di filtro che hai applicato alla query principale)
      if (filters.search) {
        countQuery += ` AND (g.descrizione LIKE ? OR g.cig LIKE ? OR e.denominazione LIKE ?)`;
        // Non aggiungere i parametri qui, li useremo gli stessi della query principale
      }
      
      // Applica gli altri filtri allo stesso modo...
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2)); // Rimuovi i parametri di LIMIT e OFFSET
      const totalItems = (countResult as any)[0].total;
      
      // Aggiunta dell'ordinamento e paginazione
      query += ` ORDER BY g.data_pubblicazione DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, (page - 1) * limit);
      
      console.log('Query SQL:', query);
      // Esecuzione della query principale
      console.log('Esecuzione query con parametri:', queryParams);
      const [rows] = await pool.query(query, queryParams);
      console.log('Risultati query:', rows);
      
      // Trasformazione dei risultati nel formato OCDSTender
      const tenders = await this.mapRowsToTenders(rows as any[]);
      
      return {
        data: tenders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Errore nel recupero delle gare:', error);
      throw error;
    }
  }

  async getTenderById(id: string): Promise<OCDSTender | null> {
    try {
      let query = `
        SELECT 
          gara.id, gara.ocid, gara.cig, gara.descrizione AS title, gara.data_pubblicazione,
          gara.importo_totale, gara.valuta,
          e.id AS ente_id, e.denominazione AS ente_nome, e.codice_fiscale AS ente_cf,
          sp.codice AS status,
          np.codice AS categoria,
          l.id AS lotto_id, l.cig AS lotto_cig, l.descrizione AS lotto_desc,
          l.valore AS lotto_valore, l.termine_ricezione,
          cpv.codice AS cpv_code, cpv.descrizione AS cpv_desc,
          ca.codice AS criterio_codice
        FROM gara
        LEFT JOIN ente_appaltante e ON gara.ente_appaltante_id = e.id
        LEFT JOIN stato_procedura sp ON gara.stato_procedura_id = sp.id
        LEFT JOIN natura_principale np ON gara.natura_principale_id = np.id
        LEFT JOIN lotto l ON l.gara_id = gara.id
        LEFT JOIN categoria_cpv cpv ON l.cpv_id = cpv.id
        LEFT JOIN criterio_aggiudicazione ca ON gara.criterio_aggiudicazione_id = ca.id
        WHERE 1=1
      `;
      
      const [rows] = await pool.query(query, [id]);
      
      if (!rows || (rows as any[]).length === 0) {
        return null;
      }
      
      const tenders = await this.mapRowsToTenders(rows as any[]);
      return tenders[0];
    } catch (error) {
      console.error('Errore nel recupero della gara:', error);
      throw error;
    }
  }

  async getFilterOptions() {
    try {
      // Query per ottenere le opzioni di filtro
      const [authorities] = await pool.query('SELECT DISTINCT denominazione FROM ente_appaltante ORDER BY denominazione');
      const [statuses] = await pool.query('SELECT codice FROM stato_procedura ORDER BY codice');
      const [categories] = await pool.query('SELECT codice FROM natura_principale ORDER BY codice');
      const [cpvCodes] = await pool.query('SELECT CONCAT(codice, " - ", descrizione) AS cpv FROM categoria_cpv ORDER BY codice');
      
      // Query per ottenere i partecipanti (fornitori)
      const [contractors] = await pool.query('SELECT DISTINCT denominazione FROM partecipante WHERE flag_aggiudicatario = 1 ORDER BY denominazione');
      
      return {
        authorities: (authorities as any[]).map(a => a.denominazione),
        contractors: (contractors as any[]).map(c => c.denominazione),
        cpvCodes: (cpvCodes as any[]).map(c => c.cpv),
        statuses: (statuses as any[]).map(s => s.codice),
        methods: ['open', 'selective', 'limited', 'direct'], // Valori predefiniti se non disponibili nel DB
        categories: (categories as any[]).map(c => c.codice)
      };
    } catch (error) {
      console.error('Errore nel recupero delle opzioni di filtro:', error);
      throw error;
    }
  }

  // Funzione helper per mappare i risultati del database al formato OCDSTender
  private async mapRowsToTenders(rows: any[]): Promise<OCDSTender[]> {
    // Raggruppa le righe per ID gara
    const tenderMap = new Map<string, any>();
    
    for (const row of rows) {
      if (!tenderMap.has(row.id)) {
        tenderMap.set(row.id, {
          id: row.id,
          cig: row.cig || '',
          title: row.title || '',
          description: row.title || '', // Utilizziamo lo stesso campo se non c'è una descrizione separata
          status: row.status || 'planning',
          buyer: {
            id: row.ente_id || '',
            name: row.ente_nome || '',
            identifier: row.ente_cf || '',
            contactPoint: {
              name: `Responsabile ${row.ente_nome || ''}`,
              email: `info@${row.ente_nome?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'example'}.it`
            },
            address: {
              streetAddress: '',
              locality: '',
              region: '',
              postalCode: '',
              countryName: 'Italy'
            }
          },
          suppliers: [],
          value: {
            amount: row.importo_totale || 0,
            currency: row.valuta || 'EUR'
          },
          dates: {
            published: row.data_pubblicazione ? new Date(row.data_pubblicazione).toISOString() : new Date().toISOString(),
            tenderPeriod: {
              startDate: row.data_pubblicazione ? new Date(row.data_pubblicazione).toISOString() : new Date().toISOString(),
              endDate: row.termine_ricezione ? new Date(row.termine_ricezione).toISOString() : new Date().toISOString()
            }
          },
          cpv: {
            code: row.cpv_code || '',
            description: row.cpv_desc || ''
          },
          classification: {
            scheme: 'CPV',
            id: row.cpv_code || '',
            description: row.cpv_desc || ''
          },
          documents: [],
          procurementMethod: 'open', // Valore predefinito
          mainProcurementCategory: row.categoria || 'services',
          eligibilityCriteria: 'Requisiti di qualificazione secondo il Codice degli Appalti',
          awardCriteria: row.criterio_codice === 'price' ? 'Prezzo più basso' : 'Offerta economicamente più vantaggiosa',
          submissionMethod: ['electronicSubmission'],
          submissionMethodDetails: 'Invio telematico tramite piattaforma digitale',
          tenderPeriod: {
            startDate: row.data_pubblicazione ? new Date(row.data_pubblicazione).toISOString() : new Date().toISOString(),
            endDate: row.termine_ricezione ? new Date(row.termine_ricezione).toISOString() : new Date().toISOString()
          },
          enquiryPeriod: {
            startDate: row.data_pubblicazione ? new Date(row.data_pubblicazione).toISOString() : new Date().toISOString(),
            endDate: row.termine_ricezione ? new Date(row.termine_ricezione).toISOString() : new Date().toISOString()
          },
          hasEnquiries: false,
          numberOfTenderers: 0
        });
      }
    }
    
    // Per ogni gara, recupera i fornitori (partecipanti aggiudicatari)
    for (const [id, tender] of tenderMap) {
      const [suppliers] = await pool.query(
        'SELECT id, codice_fiscale, denominazione FROM partecipante WHERE gara_id = ? AND flag_aggiudicatario = 1',
        [id]
      );
      
      tender.suppliers = (suppliers as any[]).map(s => ({
        id: s.id.toString(),
        name: s.denominazione || '',
        identifier: s.codice_fiscale || '',
        address: {
          streetAddress: '',
          locality: '',
          region: '',
          postalCode: '',
          countryName: 'Italy'
        }
      }));
      
      // Se non ci sono fornitori, aggiungiamo un fornitore vuoto
      if (tender.suppliers.length === 0) {
        tender.suppliers.push({
          id: '0',
          name: 'Non assegnato',
          identifier: '',
          address: {
            streetAddress: '',
            locality: '',
            region: '',
            postalCode: '',
            countryName: 'Italy'
          }
        });
      }
      
      // Recupera il numero di partecipanti
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM partecipante WHERE gara_id = ?',
        [id]
      );
      
      tender.numberOfTenderers = (countResult as any[])[0]?.count || 0;
    }
    
    return Array.from(tenderMap.values());
  }
}

export const tenderService = new TenderService();