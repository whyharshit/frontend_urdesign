export type ProfessionalType =
  | 'Architect'
  | 'Interior Designer'
  | 'Architect & Interior Designer'
  | 'Landscape Architect'
  | 'Lighting Designer'
  | 'Other Design Professional';
export type ProfileStatus = 'published' | 'draft' | 'unpublished' | 'suspended';
export interface Service {
  id: string;
  category: string;
  description: string;
  priceType: 'starting_from' | 'fixed' | 'per_sqft' | 'percent' | 'contact_for_pricing';
  price?: number;
}
export interface Project {
  id: string;
  title: string;
  type: string;
  location: string;
  year: number;
  area: string;
  description: string;
  images: string[];
  status: 'Completed' | 'Ongoing' | 'Concept';
}
// Public DTO deliberately has no phone, email, website or social-link values.
export interface Professional {
  id: string;
  slug: string;
  name: string;
  studio: string;
  type: ProfessionalType;
  city: string;
  years: number;
  qualification: string;
  bio: string;
  initials: string;
  color: string;
  services: Service[];
  projects: Project[];
  languages: string[];
  status: ProfileStatus;
  mobileVerified: boolean;
  completeness: number;
  lastActive: string;
  /** Data-URL or path of an uploaded logo / photo. Initials are shown without one. */
  photo?: string;
  cover?: string;
  /** Self-declared Council of Architecture number. Shown as "provided", never "verified". */
  coaNumber?: string;
  links?: string[];
  workCities?: string[];
  /** The public URL may be customised once. */
  slugEdited?: boolean;
}
export type EnquiryStatus =
  | 'sent'
  | 'viewed'
  | 'proposal_sent'
  | 'accepted'
  | 'declined_by_provider'
  | 'declined_by_client'
  | 'withdrawn'
  | 'unavailable';
export interface Requirement {
  id: string;
  title: string;
  projectType: string;
  city: string;
  service: string;
  description: string;
  budget: string;
  timeline: string;
  size: string;
  createdAt: string;
  closedAt?: string;
  /** Private client contact, released to a professional only after acceptance. */
  client?: ClientContact;
}
export interface ClientContact {
  name: string;
  email: string;
  phone: string;
}
export interface Session {
  client: ClientContact | null;
  professional: boolean;
  admin: boolean;
}
export interface Report {
  id: string;
  providerId: string;
  reason: string;
  details: string;
  date: string;
}
export interface Enquiry {
  id: string;
  requirementId: string;
  providerId: string;
  status: EnquiryStatus;
  sentAt: string;
}
export interface Proposal {
  id: string;
  enquiryId: string;
  scope: string;
  deliverables: string[];
  band: string;
  timeline: string;
  fee: string;
  cost: number;
  flagged: boolean;
}
export interface LedgerEntry {
  id: string;
  label: string;
  amount: number;
  date: string;
}
export interface Payment {
  id: string;
  providerId: string;
  pack: number;
  amount: number;
  reference: string;
  date: string;
  status: 'pending' | 'verified' | 'rejected';
  reason?: string;
}
export interface DemoState {
  version: 3;
  /** The signed-in professional's own practice: the sample studio until someone signs up. */
  ownId: string;
  providers: Professional[];
  requirements: Requirement[];
  enquiries: Enquiry[];
  proposals: Proposal[];
  balance: number;
  ledger: LedgerEntry[];
  payments: Payment[];
  session: Session;
  saved: string[];
  reports: Report[];
  /** Profile-view timestamps per professional id. */
  views: Record<string, string[]>;
  /** Private contact details per professional id, released after acceptance. */
  contacts: Record<string, { phone: string; email: string }>;
}
export interface SearchFilters {
  city: string;
  type: string;
  service: string;
  experience: string;
  q: string;
  projectType: string;
  sort: string;
}
