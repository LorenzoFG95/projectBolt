import React, { useState, useEffect } from 'react';
import { TenderFilters, PaginatedResponse, OCDSTender } from '../types/ocds';
import { apiService } from '../services/api';
import { FilterPanel } from '../components/Filters/FilterPanel';
import { TenderList } from '../components/Tenders/TenderList';
import { Pagination } from '../components/Common/Pagination';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const [tenders, setTenders] = useState<OCDSTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TenderFilters>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const loadTenders = async (page: number = 1, newFilters: TenderFilters = filters) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<OCDSTender> = await apiService.getTenders(page, 10, newFilters);
      setTenders(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const handleFiltersChange = (newFilters: TenderFilters) => {
    setFilters(newFilters);
    loadTenders(1, newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    loadTenders(1, emptyFilters);
  };

  const handlePageChange = (page: number) => {
    loadTenders(page);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Gare d'Appalto</h1>
        <p className="text-gray-600">
          Esplora e filtra le gare d'appalto pubbliche in formato OCDS
        </p>
      </div>

      <div className="space-y-6">
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Caricamento...</span>
              </div>
            ) : (
              `Trovate ${pagination.totalItems} gare d'appalto`
            )}
          </div>
        </div>

        <TenderList tenders={tenders} loading={loading} />

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
};