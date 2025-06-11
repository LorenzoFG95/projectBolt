import express from 'express';
import { tenderService } from '../services/tenderService.js';
import { TenderFilters } from '../types/ocds.js';

const router = express.Router();

// GET /api/tenders - Get paginated list of tenders with filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters: TenderFilters = {
      search: req.query.search as string,
      contractingAuthority: req.query.contractingAuthority as string,
      contractor: req.query.contractor as string,
      cpvCode: req.query.cpvCode as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      minValue: req.query.minValue ? parseFloat(req.query.minValue as string) : undefined,
      maxValue: req.query.maxValue ? parseFloat(req.query.maxValue as string) : undefined,
      procurementMethod: req.query.procurementMethod as string,
      category: req.query.category as string
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof TenderFilters] === undefined || filters[key as keyof TenderFilters] === '') {
        delete filters[key as keyof TenderFilters];
      }
    });

    const result = await tenderService.getTenders(page, limit, filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tenders/:id - Get specific tender by ID
router.get('/:id', async (req, res) => {
  try {
    const tender = await tenderService.getTenderById(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    
    res.json(tender);
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tenders/filters/options - Get available filter options
router.get('/filters/options', async (req, res) => {
  try {
    const options = await tenderService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;