import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Building, Euro, FileText, ExternalLink } from 'lucide-react';
import { OCDSTender } from '../../types/ocds';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import { Badge } from '../Common/Badge';

interface TenderCardProps {
  tender: OCDSTender;
}

export const TenderCard: React.FC<TenderCardProps> = ({ tender }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-blue-600">{tender.cig}</span>
              <Badge className={getStatusColor(tender.status)}>
                {getStatusLabel(tender.status)}
              </Badge>
            </div>
            <Link 
              to={`/tenders/${tender.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
            >
              {tender.title}
            </Link>
          </div>
          <Link
            to={`/tenders/${tender.id}`}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {tender.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Building className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{tender.buyer.name}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Euro className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{formatCurrency(tender.value.amount, tender.value.currency)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Pubblicato: {formatDate(tender.dates.published)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>CPV: {tender.cpv.code}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Badge variant="default" size="sm">
              {tender.mainProcurementCategory === 'goods' && 'Beni'}
              {tender.mainProcurementCategory === 'services' && 'Servizi'}
              {tender.mainProcurementCategory === 'works' && 'Lavori'}
            </Badge>
            <Badge variant="primary" size="sm">
              {tender.procurementMethod === 'open' && 'Procedura Aperta'}
              {tender.procurementMethod === 'selective' && 'Procedura Selettiva'}
              {tender.procurementMethod === 'limited' && 'Procedura Limitata'}
              {tender.procurementMethod === 'direct' && 'Affidamento Diretto'}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-500">
            Scade: {formatDate(tender.dates.tenderPeriod.endDate)}
          </div>
        </div>
      </div>
    </div>
  );
};