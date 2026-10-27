import type {
  ClientContact,
  DemoState,
  Professional,
  Proposal,
  Requirement,
  Payment,
  Report,
} from '../types/domain';
import { canContact, publishChecks, servesCity } from '../lib/rules';
import { FEE_BANDS, CONNECT_PACKS } from '../config/catalog';
import { blankProfessional, seedProviders } from './seed';
import { initialsOf } from '../lib/format';

export type DemoAction =
  | { type: 'hydrate'; state: DemoState }
  | { type: 'profile'; profile: Professional }
  | { type: 'view'; enquiryId: string }
  | {
      type: 'moderate';
      providerId: string;
      status: 'suspended' | 'unpublished';
      reason: string;
      date: string;
    }
  | { type: 'contact'; requirement: Requirement; providerId: string; id: string; date: string }
  | { type: 'proposal'; proposal: Proposal; date: string }
  | {
      type: 'decide';
      enquiryId: string;
      decision: 'accepted' | 'declined_by_client' | 'declined_by_provider';
      date: string;
    }
  | { type: 'payment'; payment: Payment }
  | { type: 'verifyPayment'; id: string; approve: boolean; reason: string; date: string }
  | { type: 'signup'; phone: string; email: string; date: string }
  | { type: 'login'; role: 'client'; client: ClientContact }
  | { type: 'login'; role: 'professional' | 'admin' }
  | { type: 'logout'; role: 'client' | 'professional' | 'admin' }
  | { type: 'toggleSave'; providerId: string }
  | { type: 'report'; report: Report }
  | { type: 'profileView'; providerId: string; date: string }
  | { type: 'closeRequirement'; requirementId: string; date: string };

/** In-browser demo transitions only. Production equivalents must be atomic API transactions. */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'view':
      return {
        ...state,
        enquiries: state.enquiries.map((e) =>
          e.id === action.enquiryId && e.providerId === state.ownId && e.status === 'sent'
            ? { ...e, status: 'viewed' }
            : e,
        ),
      };
    case 'moderate': {
      if (!action.reason.trim()) return state;
      const affected =
        action.status === 'suspended'
          ? state.enquiries.filter(
              (e) =>
                e.providerId === action.providerId &&
                ['sent', 'viewed', 'proposal_sent'].includes(e.status),
            )
          : [];
      const refunded = affected
        .filter((e) => e.providerId === state.ownId)
        .flatMap((e) => state.proposals.filter((p) => p.enquiryId === e.id));
      return {
        ...state,
        providers: state.providers.map((p) =>
          p.id === action.providerId ? { ...p, status: action.status } : p,
        ),
        enquiries: state.enquiries.map((e) =>
          affected.some((a) => a.id === e.id) ? { ...e, status: 'unavailable' } : e,
        ),
        balance: state.balance + refunded.reduce((sum, p) => sum + p.cost, 0),
        ledger: [
          ...refunded.map((p) => ({
            id: `suspension-${p.id}`,
            label: 'Open proposal closed · suspension refund',
            amount: p.cost,
            date: action.date,
          })),
          ...state.ledger,
        ],
      };
    }
    case 'profile': {
      const profile = { ...action.profile };
      profile.initials = initialsOf(profile.studio || profile.name);
      if (profile.status === 'published' && publishChecks(profile).some((check) => !check.done))
        profile.status = 'unpublished';
      return {
        ...state,
        providers: state.providers.map((p) => (p.id === profile.id ? profile : p)),
      };
    }
    case 'contact': {
      if (canContact(state, action.requirement.id, action.providerId)) return state;
      const provider = state.providers.find((p) => p.id === action.providerId);
      if (provider?.status !== 'published' || !servesCity(provider, action.requirement.city))
        return state;
      const recent = state.enquiries.filter(
        (e) => Date.parse(action.date) - Date.parse(e.sentAt) < 86_400_000,
      );
      if (recent.length >= 10) return state;
      return {
        ...state,
        requirements: state.requirements.some((r) => r.id === action.requirement.id)
          ? state.requirements
          : [action.requirement, ...state.requirements],
        enquiries: [
          ...state.enquiries,
          {
            id: action.id,
            requirementId: action.requirement.id,
            providerId: action.providerId,
            status: 'sent',
            sentAt: action.date,
          },
        ],
      };
    }
    case 'proposal': {
      const enquiry = state.enquiries.find((e) => e.id === action.proposal.enquiryId);
      const cost = FEE_BANDS.find((b) => b.id === action.proposal.band)?.cost;
      if (
        !enquiry ||
        enquiry.providerId !== state.ownId ||
        state.providers.find((p) => p.id === state.ownId)?.status === 'suspended' ||
        !['sent', 'viewed'].includes(enquiry.status) ||
        !cost ||
        state.balance < cost ||
        state.proposals.some((p) => p.enquiryId === enquiry.id)
      )
        return state;
      return {
        ...state,
        balance: state.balance - cost,
        proposals: [...state.proposals, { ...action.proposal, cost }],
        enquiries: state.enquiries.map((e) =>
          e.id === enquiry.id ? { ...e, status: 'proposal_sent' } : e,
        ),
        ledger: [
          { id: action.proposal.id, label: 'Proposal sent', amount: -cost, date: action.date },
          ...state.ledger,
        ],
      };
    }
    case 'decide': {
      const enquiry = state.enquiries.find((e) => e.id === action.enquiryId);
      if (
        !enquiry ||
        (action.decision === 'declined_by_provider'
          ? !['sent', 'viewed'].includes(enquiry.status)
          : enquiry.status !== 'proposal_sent')
      )
        return state;
      // Accepting one proposal tells everyone else on the same project that the client chose someone.
      const declined =
        action.decision === 'accepted'
          ? state.enquiries.filter(
              (e) =>
                e.requirementId === enquiry.requirementId &&
                e.id !== enquiry.id &&
                e.status === 'proposal_sent',
            )
          : action.decision === 'declined_by_client'
            ? [enquiry]
            : [];
      const refunds = declined
        .filter((e) => e.providerId === state.ownId)
        .map((e) => ({
          enquiryId: e.id,
          amount: Math.ceil((state.proposals.find((p) => p.enquiryId === e.id)?.cost ?? 0) / 2),
        }))
        .filter((r) => r.amount > 0);
      return {
        ...state,
        enquiries: state.enquiries.map((e) =>
          e.id === enquiry.id
            ? { ...e, status: action.decision }
            : declined.some((d) => d.id === e.id)
              ? { ...e, status: 'declined_by_client' }
              : e,
        ),
        balance: state.balance + refunds.reduce((sum, r) => sum + r.amount, 0),
        ledger: refunds.length
          ? [
              ...refunds.map((r) => ({
                id: `refund-${r.enquiryId}`,
                label: 'Client declined · 50% returned',
                amount: r.amount,
                date: action.date,
              })),
              ...state.ledger,
            ]
          : state.ledger,
      };
    }
    case 'closeRequirement': {
      const requirement = state.requirements.find((r) => r.id === action.requirementId);
      if (!requirement || requirement.closedAt) return state;
      const closing = state.enquiries.filter(
        (e) =>
          e.requirementId === requirement.id &&
          ['sent', 'viewed', 'proposal_sent'].includes(e.status),
      );
      // A professional who already paid for a proposal gets it back in full when the client withdraws.
      const refunds = closing
        .filter((e) => e.providerId === state.ownId && e.status === 'proposal_sent')
        .flatMap((e) => state.proposals.filter((p) => p.enquiryId === e.id));
      return {
        ...state,
        requirements: state.requirements.map((r) =>
          r.id === requirement.id ? { ...r, closedAt: action.date } : r,
        ),
        enquiries: state.enquiries.map((e) =>
          closing.some((c) => c.id === e.id) ? { ...e, status: 'withdrawn' } : e,
        ),
        balance: state.balance + refunds.reduce((sum, p) => sum + p.cost, 0),
        ledger: [
          ...refunds.map((p) => ({
            id: `withdrawn-${p.id}`,
            label: 'Client closed the enquiry · refunded',
            amount: p.cost,
            date: action.date,
          })),
          ...state.ledger,
        ],
      };
    }
    case 'signup': {
      // A new number is a new practice: an empty draft of its own. The sample studios stay
      // published for everyone, so search counts and profile pages match the server render.
      const ownId = `own-${Date.parse(action.date) || 0}`;
      const previous = seedProviders.some((p) => p.id === state.ownId) ? null : state.ownId;
      return {
        ...state,
        ownId,
        providers: [...state.providers.filter((p) => p.id !== previous), blankProfessional(ownId)],
        payments: state.payments.filter((p) => p.providerId !== previous),
        contacts: {
          ...state.contacts,
          [ownId]: { phone: action.phone, email: action.email },
        },
        views: { ...state.views, [ownId]: [] },
        balance: 200,
        ledger: [
          {
            id: `grant-${action.date}`,
            label: 'Launch joining grant',
            amount: 200,
            date: action.date,
          },
        ],
        session: { ...state.session, professional: true },
      };
    }
    case 'login':
      return {
        ...state,
        session:
          action.role === 'client'
            ? { ...state.session, client: action.client }
            : { ...state.session, [action.role]: true },
      };
    case 'logout':
      return {
        ...state,
        session:
          action.role === 'client'
            ? { ...state.session, client: null }
            : { ...state.session, [action.role]: false },
      };
    case 'toggleSave':
      return {
        ...state,
        saved: state.saved.includes(action.providerId)
          ? state.saved.filter((id) => id !== action.providerId)
          : [...state.saved, action.providerId],
      };
    case 'report':
      if (!action.report.reason.trim()) return state;
      return { ...state, reports: [action.report, ...state.reports] };
    case 'profileView':
      return {
        ...state,
        views: {
          ...state.views,
          [action.providerId]: [...(state.views[action.providerId] || []), action.date].slice(-500),
        },
      };
    case 'payment':
      if (
        !CONNECT_PACKS.some(
          (p) => p.connects === action.payment.pack && p.price === action.payment.amount,
        ) ||
        action.payment.status !== 'pending' ||
        !/^[a-z0-9]{6,40}$/i.test(action.payment.reference) ||
        action.payment.providerId !== state.ownId
      )
        return state;
      if (
        state.payments.some(
          (p) => p.reference.toLowerCase() === action.payment.reference.toLowerCase(),
        )
      )
        return state;
      return { ...state, payments: [action.payment, ...state.payments] };
    case 'verifyPayment': {
      const payment = state.payments.find((p) => p.id === action.id);
      if (!payment || payment.status !== 'pending' || (!action.approve && !action.reason.trim()))
        return state;
      const credit = action.approve && payment.providerId === state.ownId ? payment.pack : 0;
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === payment.id
            ? { ...p, status: action.approve ? 'verified' : 'rejected', reason: action.reason }
            : p,
        ),
        balance: state.balance + credit,
        ledger: credit
          ? [
              {
                id: `purchase-${payment.id}`,
                label: 'Connect pack · payment verified',
                amount: credit,
                date: action.date,
              },
              ...state.ledger,
            ]
          : state.ledger,
      };
    }
  }
}
