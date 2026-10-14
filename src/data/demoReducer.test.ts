import { describe, expect, it } from 'vitest';
import { createSeedState } from './seed';
import { demoReducer } from './demoReducer';
import {
  filterProfessionals,
  publishChecks,
  canContact,
  hasContactDetails,
  bandForFee,
} from '../lib/rules';
import {
  areaLabel,
  capitaliseWords,
  experienceLabel,
  joinMeasure,
  plural,
  servicePrice,
} from '../lib/format';
import type { Proposal, Payment } from '../types/domain';

const date = '2026-09-27T12:00:00Z';
const proposal: Proposal = {
  id: 'new-proposal',
  enquiryId: 'e1',
  scope: 'A thoughtful design proposal with an appropriate scope.',
  deliverables: ['A complete space plan'],
  band: 'B',
  timeline: '4 weeks',
  fee: '₹20,000',
  cost: 150,
  flagged: false,
};
const payment: Payment = {
  id: 'payment-1',
  providerId: 'p1',
  pack: 300,
  amount: 249,
  reference: 'DEMO123456',
  date,
  status: 'pending',
};

describe('proposal and wallet integrity', () => {
  it('spends once, returns half on decline once, and reconciles the ledger', () => {
    let state = createSeedState();
    state = demoReducer(state, { type: 'proposal', proposal, date });
    expect(state.balance).toBe(50);
    expect(demoReducer(state, { type: 'proposal', proposal, date })).toBe(state);
    state = demoReducer(state, {
      type: 'decide',
      enquiryId: 'e1',
      decision: 'declined_by_client',
      date,
    });
    expect(state.balance).toBe(125);
    expect(
      demoReducer(state, { type: 'decide', enquiryId: 'e1', decision: 'declined_by_client', date }),
    ).toBe(state);
    expect(state.ledger.reduce((total, row) => total + row.amount, 0)).toBe(state.balance);
  });
  it('does not overspend the launch grant and prices from configuration', () => {
    const state = createSeedState();
    expect(
      demoReducer(state, { type: 'proposal', proposal: { ...proposal, band: 'C', cost: 1 }, date }),
    ).toBe(state);
    const sent = demoReducer(state, { type: 'proposal', proposal: { ...proposal, cost: 1 }, date });
    expect(sent.balance).toBe(50);
    expect(sent.proposals.at(-1)?.cost).toBe(150);
  });
  it('requires pending review and unique references before crediting exactly once', () => {
    let state = demoReducer(createSeedState(), { type: 'payment', payment });
    expect(state.balance).toBe(200);
    expect(
      demoReducer(state, {
        type: 'payment',
        payment: { ...payment, id: 'duplicate', reference: 'demo123456' },
      }),
    ).toBe(state);
    state = demoReducer(state, {
      type: 'verifyPayment',
      id: payment.id,
      approve: true,
      reason: '',
      date,
    });
    expect(state.balance).toBe(500);
    expect(
      demoReducer(state, {
        type: 'verifyPayment',
        id: payment.id,
        approve: true,
        reason: '',
        date,
      }),
    ).toBe(state);
    expect(state.ledger.reduce((sum, row) => sum + row.amount, 0)).toBe(500);
  });
  it('rejects payments only with a reason and never credits them', () => {
    const state = demoReducer(createSeedState(), { type: 'payment', payment });
    expect(
      demoReducer(state, {
        type: 'verifyPayment',
        id: payment.id,
        approve: false,
        reason: '',
        date,
      }),
    ).toBe(state);
    const rejected = demoReducer(state, {
      type: 'verifyPayment',
      id: payment.id,
      approve: false,
      reason: 'Reference not found',
      date,
    });
    expect(rejected.balance).toBe(200);
    expect(rejected.payments[0].status).toBe('rejected');
  });
  it('preserves open proposals on unpublish, but refunds and closes them on suspension', () => {
    let state = demoReducer(createSeedState(), { type: 'proposal', proposal, date });
    state = demoReducer(state, {
      type: 'moderate',
      providerId: 'p1',
      status: 'unpublished',
      reason: 'Review requested',
      date,
    });
    expect(state.balance).toBe(50);
    expect(state.enquiries.find((e) => e.id === 'e1')?.status).toBe('proposal_sent');
    state = demoReducer(state, {
      type: 'moderate',
      providerId: 'p1',
      status: 'suspended',
      reason: 'Moderation concern',
      date,
    });
    expect(state.balance).toBe(200);
    expect(state.enquiries.find((e) => e.id === 'e1')?.status).toBe('unavailable');
    const twice = demoReducer(state, {
      type: 'moderate',
      providerId: 'p1',
      status: 'suspended',
      reason: 'Again',
      date,
    });
    expect(twice.balance).toBe(200);
  });
});

describe('discovery and publishing', () => {
  it('matches a combined discipline without including unrelated professionals', () => {
    const result = filterProfessionals(createSeedState().providers, {
      type: 'architect',
      city: 'ahmedabad',
    });
    expect(result.map((p) => p.id)).toEqual(['p1']);
    expect(
      filterProfessionals(createSeedState().providers, { type: 'other-design-professional' }).map(
        (p) => p.id,
      ),
    ).toEqual(['p6']);
  });
  it('requires six publishing conditions and automatically unpublishes incomplete work', () => {
    const state = createSeedState();
    expect(publishChecks(state.providers[0])).toHaveLength(6);
    const result = demoReducer(state, {
      type: 'profile',
      profile: { ...state.providers[0], projects: [] },
    });
    expect(result.providers[0].status).toBe('unpublished');
    expect(filterProfessionals(result.providers, {}).some((p) => p.id === 'p1')).toBe(false);
  });
  it('blocks duplicate and sixth sends even when called directly', () => {
    let state = createSeedState();
    const requirement = { ...state.requirements[0], id: 'fresh' };
    for (const providerId of ['p1', 'p2', 'p3', 'p4', 'p5'])
      state = demoReducer(state, {
        type: 'contact',
        requirement,
        providerId,
        id: `fresh-${providerId}`,
        date,
      });
    expect(canContact(state, requirement.id, 'p1')).toMatch(/already/);
    expect(canContact(state, requirement.id, 'p6')).toMatch(/maximum of 5/);
    expect(
      demoReducer(state, { type: 'contact', requirement, providerId: 'p6', id: 'sixth', date }),
    ).toBe(state);
  });
  it('detects contacts without mistaking ordinary project dimensions', () => {
    expect(hasContactDetails('Reach me at studio@example.com')).toBe(true);
    expect(hasContactDetails('Call +91 98765 43210')).toBe(true);
    expect(hasContactDetails('A 2,400 sq ft home on Plot 42, Sector 9')).toBe(false);
  });
});

describe('feedback round: accounts, closing, accepting and formatting', () => {
  it('starts a new professional from an empty draft, not the sample studio', () => {
    const state = demoReducer(createSeedState(), {
      type: 'signup',
      phone: '9000000001',
      email: 'new@studio.in',
      date,
    });
    const own = state.providers.find((p) => p.id === 'p1')!;
    expect(own.name).toBe('');
    expect(own.status).toBe('draft');
    expect(state.enquiries.some((e) => e.providerId === 'p1')).toBe(false);
    expect(state.balance).toBe(200);
    expect(state.session.professional).toBe(true);
  });
  it('accepting one proposal declines the others on the same project', () => {
    let state = demoReducer(createSeedState(), { type: 'proposal', proposal, date });
    state = demoReducer(state, { type: 'decide', enquiryId: 'e2', decision: 'accepted', date });
    expect(state.enquiries.find((e) => e.id === 'e2')?.status).toBe('accepted');
    expect(state.enquiries.find((e) => e.id === 'e1')?.status).toBe('declined_by_client');
    expect(state.balance).toBe(125);
  });
  it('closing an enquiry withdraws open ones and refunds a sent proposal in full', () => {
    let state = demoReducer(createSeedState(), { type: 'proposal', proposal, date });
    state = demoReducer(state, { type: 'closeRequirement', requirementId: 'r1', date });
    expect(state.requirements.find((r) => r.id === 'r1')?.closedAt).toBe(date);
    expect(state.enquiries.filter((e) => e.requirementId === 'r1').map((e) => e.status)).toEqual([
      'withdrawn',
      'withdrawn',
    ]);
    expect(state.balance).toBe(200);
    expect(demoReducer(state, { type: 'closeRequirement', requirementId: 'r1', date })).toBe(state);
  });
  it('derives the connect band from the quoted design fee', () => {
    expect(bandForFee(12000).id).toBe('A');
    expect(bandForFee(30000).id).toBe('B');
    expect(bandForFee(65000).id).toBe('C');
    expect(bandForFee(250000).id).toBe('E');
  });
  it('searches by name and filters by project type, sorting by recent activity', () => {
    const providers = createSeedState().providers;
    expect(filterProfessionals(providers, { q: 'aangan' }).map((p) => p.id)).toEqual(['p1']);
    expect(filterProfessionals(providers, { projectType: 'commercial' }).map((p) => p.id)).toEqual([
      'p5',
    ]);
    expect(filterProfessionals(providers, {}).map((p) => p.id)).toEqual([
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
    ]);
    expect(filterProfessionals(providers, { city: 'vadodara' }).map((p) => p.id)).toEqual([
      'p1',
      'p6',
    ]);
  });
  it('formats experience, plurals, names and units for people', () => {
    expect(experienceLabel(0)).toBe('New practice');
    expect(experienceLabel(1)).toBe('1 year experience');
    expect(plural(1, 'professional')).toBe('1 professional');
    expect(plural(3, 'professional')).toBe('3 professionals');
    expect(capitaliseWords('aarav meht')).toBe('Aarav Meht');
    expect(areaLabel('1200')).toBe('1200 sq ft');
    expect(joinMeasure('5', 'weeks')).toBe('5 weeks');
    expect(joinMeasure('1', 'months')).toBe('1 month');
    expect(servicePrice({ priceType: 'percent', price: 8 })).toBe('8% of project cost');
    expect(servicePrice({ priceType: 'per_sqft', price: 120 })).toBe('₹120 per sq ft');
  });
});
