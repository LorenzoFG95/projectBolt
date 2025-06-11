export interface OCDSTender {
  id: string;
  cig: string;
  title: string;
  description: string;
  status: 'planning' | 'tender' | 'award' | 'contract' | 'implementation' | 'complete';
  buyer: {
    id: string;
    name: string;
    identifier: string;
    contactPoint: {
      name: string;
      email: string;
      telephone?: string;
    };
    address: {
      streetAddress: string;
      locality: string;
      region: string;
      postalCode: string;
      countryName: string;
    };
  };
  suppliers: Array<{
    id: string;
    name: string;
    identifier: string;
    address: {
      streetAddress: string;
      locality: string;
      region: string;
      postalCode: string;
      countryName: string;
    };
  }>;
  value: {
    amount: number;
    currency: string;
  };
  dates: {
    published: string;
    tenderPeriod: {
      startDate: string;
      endDate: string;
    };
    awardDate?: string;
    contractDate?: string;
  };
  cpv: {
    code: string;
    description: string;
  };
  classification: {
    scheme: string;
    id: string;
    description: string;
  };
  documents: Array<{
    id: string;
    documentType: string;
    title: string;
    description: string;
    url: string;
    datePublished: string;
    language: string;
  }>;
  procurementMethod: 'open' | 'selective' | 'limited' | 'direct';
  mainProcurementCategory: 'goods' | 'services' | 'works';
  eligibilityCriteria: string;
  awardCriteria: string;
  submissionMethod: string[];
  submissionMethodDetails: string;
  tenderPeriod: {
    startDate: string;
    endDate: string;
  };
  enquiryPeriod: {
    startDate: string;
    endDate: string;
  };
  hasEnquiries: boolean;
  numberOfTenderers: number;
}

export interface TenderFilters {
  search?: string;
  contractingAuthority?: string;
  contractor?: string;
  cpvCode?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minValue?: number;
  maxValue?: number;
  procurementMethod?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface FilterOptions {
  authorities: string[];
  contractors: string[];
  cpvCodes: string[];
  statuses: string[];
  methods: string[];
  categories: string[];
}