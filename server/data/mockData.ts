import { OCDSTender } from '../types/ocds.js';

export const generateMockTenders = (): OCDSTender[] => {
  const statuses: OCDSTender['status'][] = ['planning', 'tender', 'award', 'contract', 'implementation', 'complete'];
  const procurementMethods: OCDSTender['procurementMethod'][] = ['open', 'selective', 'limited', 'direct'];
  const categories: OCDSTender['mainProcurementCategory'][] = ['goods', 'services', 'works'];
  
  const authorities = [
    { name: 'Ministero della Salute', id: 'MS001', identifier: 'IT-MS-001' },
    { name: 'Regione Lombardia', id: 'RL001', identifier: 'IT-RL-001' },
    { name: 'Comune di Milano', id: 'CM001', identifier: 'IT-CM-001' },
    { name: 'ANAS S.p.A.', id: 'AN001', identifier: 'IT-AN-001' },
    { name: 'Università di Roma', id: 'UR001', identifier: 'IT-UR-001' },
    { name: 'ASL Napoli', id: 'ASL001', identifier: 'IT-ASL-001' },
    { name: 'Ferrovie dello Stato', id: 'FS001', identifier: 'IT-FS-001' },
    { name: 'Ministero dell\'Istruzione', id: 'MI001', identifier: 'IT-MI-001' }
  ];

  const suppliers = [
    { name: 'TechSolutions S.r.l.', id: 'TECH001', identifier: 'IT-TECH-001' },
    { name: 'Costruzioni Italia S.p.A.', id: 'COST001', identifier: 'IT-COST-001' },
    { name: 'Medical Supplies Group', id: 'MED001', identifier: 'IT-MED-001' },
    { name: 'Informatica Avanzata', id: 'INFO001', identifier: 'IT-INFO-001' },
    { name: 'Servizi Integrati S.r.l.', id: 'SERV001', identifier: 'IT-SERV-001' },
    { name: 'Green Energy Solutions', id: 'GREEN001', identifier: 'IT-GREEN-001' },
    { name: 'Logistica Express', id: 'LOG001', identifier: 'IT-LOG-001' },
    { name: 'Consulting Partners', id: 'CONS001', identifier: 'IT-CONS-001' }
  ];

  const cpvCodes = [
    { code: '45000000-7', description: 'Construction work' },
    { code: '33000000-0', description: 'Medical equipments, pharmaceuticals and personal care products' },
    { code: '48000000-8', description: 'Software package and information systems' },
    { code: '79000000-4', description: 'Business services: law, marketing, consulting, recruitment, printing and security' },
    { code: '50000000-5', description: 'Repair and maintenance services' },
    { code: '72000000-5', description: 'IT services: consulting, software development, Internet and support' },
    { code: '71000000-8', description: 'Architectural, construction, engineering and inspection services' },
    { code: '60000000-8', description: 'Transport services (excl. Waste transport)' }
  ];

  const tenders: OCDSTender[] = [];

  for (let i = 1; i <= 50; i++) {
    const authority = authorities[Math.floor(Math.random() * authorities.length)];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const cpv = cpvCodes[Math.floor(Math.random() * cpvCodes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const method = procurementMethods[Math.floor(Math.random() * procurementMethods.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const publishedDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const tenderStart = new Date(publishedDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const tenderEnd = new Date(tenderStart.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    tenders.push({
      id: `tender-${i.toString().padStart(3, '0')}`,
      cig: `CIG${i.toString().padStart(8, '0')}`,
      title: `${category === 'works' ? 'Lavori di' : category === 'goods' ? 'Fornitura di' : 'Servizi di'} ${cpv.description.toLowerCase()}`,
      description: `Procedura ${method} per ${cpv.description.toLowerCase()}. Importo stimato: €${(Math.random() * 1000000 + 50000).toFixed(0)}`,
      status,
      buyer: {
        id: authority.id,
        name: authority.name,
        identifier: authority.identifier,
        contactPoint: {
          name: `Responsabile Acquisti ${authority.name}`,
          email: `acquisti@${authority.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.gov.it`
        },
        address: {
          streetAddress: `Via ${authority.name} ${Math.floor(Math.random() * 100) + 1}`,
          locality: ['Roma', 'Milano', 'Napoli', 'Torino', 'Bologna'][Math.floor(Math.random() * 5)],
          region: ['Lazio', 'Lombardia', 'Campania', 'Piemonte', 'Emilia-Romagna'][Math.floor(Math.random() * 5)],
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          countryName: 'Italy'
        }
      },
      suppliers: [{
        id: supplier.id,
        name: supplier.name,
        identifier: supplier.identifier,
        address: {
          streetAddress: `Via ${supplier.name} ${Math.floor(Math.random() * 200) + 1}`,
          locality: ['Roma', 'Milano', 'Napoli', 'Torino', 'Bologna'][Math.floor(Math.random() * 5)],
          region: ['Lazio', 'Lombardia', 'Campania', 'Piemonte', 'Emilia-Romagna'][Math.floor(Math.random() * 5)],
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          countryName: 'Italy'
        }
      }],
      value: {
        amount: Math.floor(Math.random() * 2000000) + 50000,
        currency: 'EUR'
      },
      dates: {
        published: publishedDate.toISOString(),
        tenderPeriod: {
          startDate: tenderStart.toISOString(),
          endDate: tenderEnd.toISOString()
        },
        awardDate: status !== 'planning' && status !== 'tender' ? new Date(tenderEnd.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        contractDate: status === 'contract' || status === 'implementation' || status === 'complete' ? new Date(tenderEnd.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : undefined
      },
      cpv: {
        code: cpv.code,
        description: cpv.description
      },
      classification: {
        scheme: 'CPV',
        id: cpv.code,
        description: cpv.description
      },
      documents: [
        {
          id: `doc-${i}-1`,
          documentType: 'tenderNotice',
          title: 'Bando di gara',
          description: 'Documentazione completa del bando di gara',
          url: `https://example.com/documents/tender-${i}-notice.pdf`,
          datePublished: publishedDate.toISOString(),
          language: 'it'
        },
        {
          id: `doc-${i}-2`,
          documentType: 'technicalSpecifications',
          title: 'Capitolato tecnico',
          description: 'Specifiche tecniche dettagliate',
          url: `https://example.com/documents/tender-${i}-specs.pdf`,
          datePublished: publishedDate.toISOString(),
          language: 'it'
        }
      ],
      procurementMethod: method,
      mainProcurementCategory: category,
      eligibilityCriteria: 'Requisiti di qualificazione secondo il Codice degli Appalti',
      awardCriteria: 'Offerta economicamente più vantaggiosa',
      submissionMethod: ['electronicSubmission'],
      submissionMethodDetails: 'Invio telematico tramite piattaforma digitale',
      tenderPeriod: {
        startDate: tenderStart.toISOString(),
        endDate: tenderEnd.toISOString()
      },
      enquiryPeriod: {
        startDate: tenderStart.toISOString(),
        endDate: new Date(tenderEnd.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      hasEnquiries: Math.random() > 0.5,
      numberOfTenderers: Math.floor(Math.random() * 15) + 1
    });
  }

  return tenders;
};