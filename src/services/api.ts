import { OCDSTender, TenderFilters, PaginatedResponse, FilterOptions } from '../types/ocds';

// Modifica questa riga
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  async getTenders(
    page: number = 1,
    limit: number = 10,
    filters: TenderFilters = {}
  ): Promise<PaginatedResponse<OCDSTender>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await fetch(`${API_BASE_URL}/tenders?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenders');
    }
    return response.json();
  }

  async getTenderById(id: string): Promise<OCDSTender> {
    const response = await fetch(`${API_BASE_URL}/tenders/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tender');
    }
    return response.json();
  }

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${API_BASE_URL}/tenders/filters/options`);
    if (!response.ok) {
      throw new Error('Failed to fetch filter options');
    }
    return response.json();
  }
}

export const apiService = new ApiService();