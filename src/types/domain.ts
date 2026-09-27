export type ProfessionalType =
  | 'Architect'
  | 'Interior Designer'
  | 'Architect & Interior Designer'
  | 'Other Design Professional';
export type ProfileStatus = 'published' | 'draft' | 'unpublished' | 'suspended';
export interface Service {
  id: string;
  category: string;
  description: string;
  priceType: 'starting_from' | 'fixed' | 'contact_for_pricing';
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
}
export type EnquiryStatus =
  | 'sent'
  | 'viewed'
  | 'proposal_sent'
  | 'accepted'
  | 'declined_by_provider'
  | 'declined_by_client'
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
  version: 1;
  providers: Professional[];
  requirements: Requirement[];
  enquiries: Enquiry[];
  proposals: Proposal[];
  balance: number;
  ledger: LedgerEntry[];
  payments: Payment[];
}
export interface SearchFilters {
  city: string;
  type: string;
  service: string;
  experience: string;
}
