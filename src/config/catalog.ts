/** The cities UR DESIGNER covers at launch. Search, enquiries and profiles all use this list. */
export const CITIES = ['Ahmedabad', 'Mumbai', 'Bengaluru'];
export const PROFESSIONAL_TYPES = [
  'Architect',
  'Interior Designer',
  'Architect & Interior Designer',
  'Landscape Architect',
  'Lighting Designer',
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
  { id: 'B', label: '₹15,000 to ₹40,000', cost: 150 },
  { id: 'C', label: '₹40,000 to ₹75,000', cost: 300 },
  { id: 'D', label: '₹75,000 to ₹1,00,000', cost: 500 },
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
  'Accepting is an introduction, not a contract. UR DESIGNER holds no money, promises no outcome and takes no part in the project once the two of you are talking.';
export const CONTACT_WARNING =
  "Contact details are shared automatically when the client accepts. You don't need to include them here.";
export const OWN_PROVIDER_ID = 'p1';
/** Total project spend (construction / furnishing), not the design fee. */
export const BUDGETS = [
  'Under ₹5 lakh',
  '₹5 to 10 lakh',
  '₹10 to 20 lakh',
  '₹20 to 50 lakh',
  'Over ₹50 lakh',
];
export const AREA_UNITS = ['sq ft', 'sq m'] as const;
export const TIMELINE_UNITS = ['days', 'weeks', 'months'] as const;
export const REPORT_REASONS = [
  'Fake or impersonated profile',
  'Work shown is not theirs',
  'Abusive or offensive content',
  'Asked for payment outside UR DESIGNER',
  'Something else',
];
/** Demo-only helpers ("Demo guide", preview banners) appear only on staging builds. */
export const IS_STAGING = import.meta.env.DEV || import.meta.env.VITE_STAGING === 'true';
/** Frontend-only admin gate. Real admin auth must be enforced by the backend. */
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@urdesigner.in';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'UrDesigner@2026';

/** A proposal waits this long for the client before its connects return in full. */
export const PROPOSAL_VALID_DAYS = 14;
/** Public address used in canonical links, link previews and the sitemap. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://frontend-urdesign.vercel.app'
).replace(/\/+$/, '');
