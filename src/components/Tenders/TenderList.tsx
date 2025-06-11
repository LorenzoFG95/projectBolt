import React from 'react';
import { OCDSTender } from '../../types/ocds';
import { TenderCard } from './TenderCard';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface TenderListProps {
  tenders: OCDSTender[];
  loading: boolean;
}

export const TenderList: React.FC<TenderListProps> = ({ tenders, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna gara trovata</h3>
        <p className="text-gray-500">
          Prova a modificare i filtri di ricerca per trovare le gare d'appalto che stai cercando.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {tenders.map((tender) => (
        <TenderCard key={tender.id} tender={tender} />
      ))}
    </div>
  );
};