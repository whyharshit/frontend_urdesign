export const CITIES = ['Ahmedabad', 'Bengaluru', 'Mumbai', 'Pune', 'Surat', 'Vadodara'];
export const PROFESSIONAL_TYPES = [
  'Architect',
  'Interior Designer',
  'Architect & Interior Designer',
  'Other Design Professional',
] as const;
export const SERVICES = [
  'Architectural Design',
  'Planning & Layout',
  '3D Visualization',
  'Working Drawings',
  'Renovation',
  'Architectural Consultation',
  'Residential Interior Design',
  'Commercial Interior Design',
  'Space Planning',
  '3D Interior Visualization',
  'Furniture/Layout Design',
  'Interior Renovation/Redesign',
  'Interior Consultation',
  'Landscape Design',
  'Sustainable Design Consultation',
  'Other Design Services',
];
export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Hospitality',
  'Retail',
  'Institutional',
  'Landscape',
  'Other',
];
// Seed configuration only. Production values must be fetched from /payments/packs and server configuration.
export const FEE_BANDS = [
  { id: 'A', label: 'Under ₹15,000', cost: 50 },
  { id: 'B', label: '₹15,000–₹40,000', cost: 150 },
  { id: 'C', label: '₹40,000–₹75,000', cost: 300 },
  { id: 'D', label: '₹75,000–₹1,00,000', cost: 500 },
  { id: 'E', label: 'Over ₹1,00,000', cost: 900 },
];
export const CONNECT_PACKS = [
  { connects: 50, price: 59 },
  { connects: 100, price: 99 },
  { connects: 300, price: 249, popular: true },
  { connects: 500, price: 399 },
  { connects: 1000, price: 749 },
];
export const INTRODUCTION_NOTICE =
  'Accepting is an introduction, not a contract. UrDesigner holds no money, promises no outcome and takes no part in the project once the two of you are talking.';
export const CONTACT_WARNING =
  "Contact details are shared automatically when the client accepts. You don't need to include them here.";
export const OWN_PROVIDER_ID = 'p1';
