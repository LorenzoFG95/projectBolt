import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, User, Calendar, Euro, FileText, Download, ExternalLink, Info, Clock, Users } from 'lucide-react';
import { OCDSTender } from '../types/ocds';
import { apiService } from '../services/api';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusLabel, getProcurementMethodLabel, getCategoryLabel } from '../utils/formatters';
import { Badge } from '../components/Common/Badge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';

export const TenderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<OCDSTender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTender = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const tenderData = await apiService.getTenderById(id);
        setTender(tenderData);
      } catch (err) {
        setError('Errore nel caricamento della gara d\'appalto');
        console.error('Error loading tender:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTender();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Info className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gara non trovata</h3>
          <p className="text-gray-500 mb-4">{error || 'La gara d\'appalto richiesta non è stata trovata.'}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna alla dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-lg font-bold text-blue-600">{tender.cig}</span>
                <Badge className={getStatusColor(tender.status)} size="md">
                  {getStatusLabel(tender.status)}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h1>
              <p className="text-gray-600">{tender.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Euro className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Valore</p>
                <p className="font-semibold text-gray-900">{formatCurrency(tender.value.amount, tender.value.currency)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pubblicazione</p>
                <p className="font-semibold text-gray-900">{formatDate(tender.dates.published)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scadenza</p>
                <p className="font-semibold text-gray-900">{formatDate(tender.dates.tenderPeriod.endDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Partecipanti</p>
                <p className="font-semibold text-gray-900">{tender.numberOfTenderers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Stazione Appaltante</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">{tender.buyer.name}</h3>
                  <p className="text-sm text-gray-500">ID: {tender.buyer.identifier}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Contatto</h4>
                    <p className="text-sm text-gray-600">{tender.buyer.contactPoint.name}</p>
                    <p className="text-sm text-blue-600">{tender.buyer.contactPoint.email}</p>
                    {tender.buyer.contactPoint.telephone && (
                      <p className="text-sm text-gray-600">{tender.buyer.contactPoint.telephone}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Indirizzo</h4>
                    <div className="text-sm text-gray-600">
                      <p>{tender.buyer.address.streetAddress}</p>
                      <p>{tender.buyer.address.postalCode} {tender.buyer.address.locality}</p>
                      <p>{tender.buyer.address.region}, {tender.buyer.address.countryName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers */}
          {tender.suppliers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Fornitori</h2>
                </div>
                
                <div className="space-y-4">
                  {tender.suppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <p className="text-sm text-gray-500">ID: {supplier.identifier}</p>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Indirizzo</h4>
                        <div className="text-sm text-gray-600">
                          <p>{supplier.address.streetAddress}</p>
                          <p>{supplier.address.postalCode} {supplier.address.locality}</p>
                          <p>{supplier.address.region}, {supplier.address.countryName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Documenti</h2>
              </div>
              
              <div className="space-y-3">
                {tender.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-500">{document.description}</p>
                      <p className="text-xs text-gray-400">
                        Pubblicato: {formatDateTime(document.datePublished)} | Lingua: {document.language.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" size="sm">{document.documentType}</Badge>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classification */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Classificazione</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Codice CPV</h3>
                  <p className="text-sm text-gray-900 font-mono">{tender.cpv.code}</p>
                  <p className="text-sm text-gray-600">{tender.cpv.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Categoria</h3>
                  <Badge variant="primary" size="md">{getCategoryLabel(tender.mainProcurementCategory)}</Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Procedura</h3>
                  <Badge variant="default" size="md">{getProcurementMethodLabel(tender.procurementMethod)}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pubblicazione</p>
                    <p className="text-sm text-gray-600">{formatDateTime(tender.dates.published)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Inizio Gara</p>
                    <p className="text-sm text-gray-600">{formatDateTime(tender.dates.tenderPeriod.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Scadenza Gara</p>
                    <p className="text-sm text-gray-600">{formatDateTime(tender.dates.tenderPeriod.endDate)}</p>
                  </div>
                </div>
                
                {tender.dates.awardDate && (
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Aggiudicazione</p>
                      <p className="text-sm text-gray-600">{formatDateTime(tender.dates.awardDate)}</p>
                    </div>
                  </div>
                )}
                
                {tender.dates.contractDate && (
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Contratto</p>
                      <p className="text-sm text-gray-600">{formatDateTime(tender.dates.contractDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Aggiuntive</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Criteri di Aggiudicazione</h3>
                  <p className="text-sm text-gray-600">{tender.awardCriteria}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Modalità di Invio</h3>
                  <p className="text-sm text-gray-600">{tender.submissionMethodDetails}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Periodo Chiarimenti</h3>
                  <p className="text-sm text-gray-600">
                    Dal {formatDate(tender.enquiryPeriod.startDate)} al {formatDate(tender.enquiryPeriod.endDate)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Chiarimenti Ricevuti</span>
                  <Badge variant={tender.hasEnquiries ? 'success' : 'default'} size="sm">
                    {tender.hasEnquiries ? 'Sì' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};