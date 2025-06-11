import { OCDSTender, TenderFilters, PaginatedResponse } from '../types/ocds.js';
import { generateMockTenders } from '../data/mockData.js';

class TenderService {
  private tenders: OCDSTender[];

  constructor() {
    this.tenders = generateMockTenders();
  }

  async getTenders(
    page: number = 1,
    limit: number = 10,
    filters: TenderFilters = {}
  ): Promise<PaginatedResponse<OCDSTender>> {
    let filteredTenders = [...this.tenders];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTenders = filteredTenders.filter(tender =>
        tender.title.toLowerCase().includes(searchTerm) ||
        tender.description.toLowerCase().includes(searchTerm) ||
        tender.cig.toLowerCase().includes(searchTerm) ||
        tender.buyer.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.contractingAuthority) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.buyer.name.toLowerCase().includes(filters.contractingAuthority!.toLowerCase())
      );
    }

    if (filters.contractor) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.suppliers.some(supplier =>
          supplier.name.toLowerCase().includes(filters.contractor!.toLowerCase())
        )
      );
    }

    if (filters.cpvCode) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.cpv.code.includes(filters.cpvCode!) ||
        tender.cpv.description.toLowerCase().includes(filters.cpvCode!.toLowerCase())
      );
    }

    if (filters.status) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.status === filters.status
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredTenders = filteredTenders.filter(tender =>
        new Date(tender.dates.published) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredTenders = filteredTenders.filter(tender =>
        new Date(tender.dates.published) <= toDate
      );
    }

    if (filters.minValue) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.value.amount >= filters.minValue!
      );
    }

    if (filters.maxValue) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.value.amount <= filters.maxValue!
      );
    }

    if (filters.procurementMethod) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.procurementMethod === filters.procurementMethod
      );
    }

    if (filters.category) {
      filteredTenders = filteredTenders.filter(tender =>
        tender.mainProcurementCategory === filters.category
      );
    }

    // Sort by publication date (newest first)
    filteredTenders.sort((a, b) => 
      new Date(b.dates.published).getTime() - new Date(a.dates.published).getTime()
    );

    // Pagination
    const totalItems = filteredTenders.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredTenders.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
  }

  async getTenderById(id: string): Promise<OCDSTender | null> {
    return this.tenders.find(tender => tender.id === id) || null;
  }

  async getFilterOptions() {
    const authorities = [...new Set(this.tenders.map(t => t.buyer.name))].sort();
    const contractors = [...new Set(this.tenders.flatMap(t => t.suppliers.map(s => s.name)))].sort();
    const cpvCodes = [...new Set(this.tenders.map(t => `${t.cpv.code} - ${t.cpv.description}`))].sort();
    const statuses = [...new Set(this.tenders.map(t => t.status))].sort();
    const methods = [...new Set(this.tenders.map(t => t.procurementMethod))].sort();
    const categories = [...new Set(this.tenders.map(t => t.mainProcurementCategory))].sort();

    return {
      authorities,
      contractors,
      cpvCodes,
      statuses,
      methods,
      categories
    };
  }
}

export const tenderService = new TenderService();