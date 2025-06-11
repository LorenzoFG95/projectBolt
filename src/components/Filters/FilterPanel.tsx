import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Euro, Building, User, Code, Activity } from 'lucide-react';
import { TenderFilters, FilterOptions } from '../../types/ocds';
import { apiService } from '../../services/api';

interface FilterPanelProps {
  filters: TenderFilters;
  onFiltersChange: (filters: TenderFilters) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await apiService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof TenderFilters, value: string | number | undefined) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof TenderFilters] !== undefined && 
    filters[key as keyof TenderFilters] !== ''
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca gare d'appalto..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancella</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-md transition-colors ${
                isExpanded || hasActiveFilters
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtri</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                  {Object.keys(filters).filter(key => filters[key as keyof TenderFilters]).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Contracting Authority */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4" />
                <span>Stazione Appaltante</span>
              </label>
              <select
                value={filters.contractingAuthority || ''}
                onChange={(e) => handleFilterChange('contractingAuthority', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">Tutte</option>
                {filterOptions?.authorities.map((authority) => (
                  <option key={authority} value={authority}>
                    {authority}
                  </option>
                ))}
              </select>
            </div>

            {/* Contractor */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>Fornitore</span>
              </label>
              <select
                value={filters.contractor || ''}
                onChange={(e) => handleFilterChange('contractor', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">Tutti</option>
                {filterOptions?.contractors.map((contractor) => (
                  <option key={contractor} value={contractor}>
                    {contractor}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Activity className="w-4 h-4" />
                <span>Stato</span>
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">Tutti</option>
                {filterOptions?.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* CPV Code */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Code className="w-4 h-4" />
                <span>Codice CPV</span>
              </label>
              <select
                value={filters.cpvCode || ''}
                onChange={(e) => handleFilterChange('cpvCode', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">Tutti</option>
                {filterOptions?.cpvCodes.map((cpv) => (
                  <option key={cpv} value={cpv.split(' - ')[0]}>
                    {cpv}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Data Da</span>
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Data A</span>
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Min Value */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4" />
                <span>Valore Min (€)</span>
              </label>
              <input
                type="number"
                value={filters.minValue || ''}
                onChange={(e) => handleFilterChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="0"
              />
            </div>

            {/* Max Value */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4" />
                <span>Valore Max (€)</span>
              </label>
              <input
                type="number"
                value={filters.maxValue || ''}
                onChange={(e) => handleFilterChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="1000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};