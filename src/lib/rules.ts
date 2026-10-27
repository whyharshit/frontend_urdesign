import type { DemoState, Professional, SearchFilters } from '../types/domain';
import { FEE_BANDS } from '../config/catalog';
import { slugify } from './format';

/** Residential / Commercial: from the projects shown and the services offered. */
export function worksOn(p: Professional, projectType: string) {
  const type = projectType.toLowerCase();
  return (
    p.projects.some((project) => project.type.toLowerCase() === type) ||
    p.services.some((s) => s.category.toLowerCase().startsWith(type))
  );
}
/** Cities a professional takes work in: where they're based plus any they've added. */
export const citiesOf = (p: Professional) => [p.city, ...(p.workCities || [])].filter(Boolean);
export const servesCity = (p: Professional, city: string) =>
  citiesOf(p).some((c) => slugify(c) === slugify(city));

export function filterProfessionals(providers: Professional[], filters: Partial<SearchFilters>) {
  return providers
    .filter((p) => {
      if (p.status !== 'published') return false;
      if (filters.city && !servesCity(p, filters.city)) return false;
      if (filters.q) {
        const q = filters.q.trim().toLowerCase();
        if (q && !`${p.name} ${p.studio}`.toLowerCase().includes(q)) return false;
      }
      if (filters.projectType && !worksOn(p, filters.projectType)) return false;
      if (
        filters.type &&
        slugify(p.type) !== filters.type &&
        !(
          p.type === 'Architect & Interior Designer' &&
          ['architect', 'interior-designer'].includes(filters.type)
        )
      )
        return false;
      if (filters.service && !p.services.some((s) => slugify(s.category) === filters.service))
        return false;
      if (filters.experience) {
        const ranges: Record<string, [number, number]> = {
          '0-2': [0, 2],
          '3-5': [3, 5],
          '6-10': [6, 10],
          '10+': [10, 60],
        };
        const range = ranges[filters.experience];
        if (range && (p.years < range[0] || p.years > range[1])) return false;
      }
      return true;
    })
    .sort((a, b) => b.lastActive.localeCompare(a.lastActive) || b.completeness - a.completeness);
}

/** The connect band follows the design fee, so nobody can pick the cheapest band by hand. */
export function bandForFee(fee: number) {
  return (
    FEE_BANDS.find((band) => {
      const [min, max] = {
        A: [0, 15000],
        B: [15000, 40000],
        C: [40000, 75000],
        D: [75000, 100000],
        E: [100000, Infinity],
      }[band.id] as [number, number];
      return fee >= min && fee < max;
    }) || FEE_BANDS[0]
  );
}

export function publishChecks(p: Professional) {
  return [
    { label: 'Verify your mobile number', done: p.mobileVerified, to: '/dashboard/profile#mobile' },
    { label: 'Add your full name', done: p.name.trim().length >= 2, to: '/dashboard/profile#name' },
    { label: 'Choose your professional type', done: !!p.type, to: '/dashboard/profile#type' },
    { label: 'Choose your city', done: !!p.city.trim(), to: '/dashboard/profile#city' },
    {
      label: 'Tell clients about your practice (at least 40 characters)',
      done: p.bio.trim().length >= 40,
      to: '/dashboard/profile#bio',
    },
    {
      label: 'Add a service and a project with a photo',
      done: p.services.length > 0 && p.projects.some((project) => project.images.length > 0),
      to: p.services.length ? '/dashboard/portfolio' : '/dashboard/services',
    },
  ];
}
export function canContact(
  state: DemoState,
  requirementId: string,
  providerId: string,
): string | null {
  const sent = state.enquiries.filter((e) => e.requirementId === requirementId);
  if (sent.some((e) => e.providerId === providerId))
    return 'You have already sent this project to this professional.';
  if (sent.length >= 5) return "You've contacted the maximum of 5 professionals for this project.";
  // Professionals pay connects to reply, so a project only goes to people who work in its city.
  const requirement = state.requirements.find((r) => r.id === requirementId);
  const provider = state.providers.find((p) => p.id === providerId);
  if (requirement && provider && !servesCity(provider, requirement.city))
    return `${provider.studio || provider.name} doesn’t take work in ${requirement.city}.`;
  return null;
}
export function hasContactDetails(text: string) {
  return /(?:\+?91[\s.-]?|0)?[6-9](?:[\s.-]?\d){9}\b|[\w.+-]+@[\w.-]+\.\w{2,}|(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|co\.in|in|net)\b|(?:^|\s)@[\w.]+|\b(?:instagram|insta|whatsapp|wa\.me|DM\s+me)\b/i.test(
    text,
  );
}
