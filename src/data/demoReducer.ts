import type { DemoState, Professional, Proposal, Requirement, Payment } from '../types/domain';
import { canContact, publishChecks } from '../lib/rules';
import { OWN_PROVIDER_ID, FEE_BANDS, CONNECT_PACKS } from '../config/catalog';

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
  | { type: 'verifyPayment'; id: string; approve: boolean; reason: string; date: string };

/** In-browser demo transitions only. Production equivalents must be atomic API transactions. */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'view':
      return {
        ...state,
        enquiries: state.enquiries.map((e) =>
          e.id === action.enquiryId && e.providerId === OWN_PROVIDER_ID && e.status === 'sent'
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
        .filter((e) => e.providerId === OWN_PROVIDER_ID)
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
      if (profile.status === 'published' && publishChecks(profile).some((check) => !check.done))
        profile.status = 'unpublished';
      return {
        ...state,
        providers: state.providers.map((p) => (p.id === profile.id ? profile : p)),
      };
    }
    case 'contact': {
      if (canContact(state, action.requirement.id, action.providerId)) return state;
      if (!state.providers.some((p) => p.id === action.providerId && p.status === 'published'))
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
        enquiry.providerId !== OWN_PROVIDER_ID ||
        state.providers.find((p) => p.id === OWN_PROVIDER_ID)?.status === 'suspended' ||
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
      const proposal = state.proposals.find((p) => p.enquiryId === enquiry.id);
      const refund =
        action.decision === 'declined_by_client' && enquiry.providerId === OWN_PROVIDER_ID
          ? Math.ceil((proposal?.cost ?? 0) / 2)
          : 0;
      return {
        ...state,
        enquiries: state.enquiries.map((e) =>
          e.id === enquiry.id ? { ...e, status: action.decision } : e,
        ),
        balance: state.balance + refund,
        ledger: refund
          ? [
              {
                id: `refund-${enquiry.id}`,
                label: 'Client declined · 50% returned',
                amount: refund,
                date: action.date,
              },
              ...state.ledger,
            ]
          : state.ledger,
      };
    }
    case 'payment':
      if (
        !CONNECT_PACKS.some(
          (p) => p.connects === action.payment.pack && p.price === action.payment.amount,
        ) ||
        action.payment.status !== 'pending' ||
        !/^[a-z0-9]{6,40}$/i.test(action.payment.reference) ||
        action.payment.providerId !== OWN_PROVIDER_ID
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
      const credit = action.approve && payment.providerId === OWN_PROVIDER_ID ? payment.pack : 0;
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
