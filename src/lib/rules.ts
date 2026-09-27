import type { DemoState, Professional, SearchFilters } from '../types/domain';
import { slugify } from './format';

export function filterProfessionals(providers: Professional[], filters: Partial<SearchFilters>) {
  return providers
    .filter((p) => {
      if (p.status !== 'published') return false;
      if (filters.city && slugify(p.city) !== slugify(filters.city)) return false;
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
    .sort((a, b) => b.completeness - a.completeness || b.lastActive.localeCompare(a.lastActive));
}

export function publishChecks(p: Professional) {
  return [
    { label: 'Verify your mobile number', done: p.mobileVerified, to: '/dashboard/profile#mobile' },
    { label: 'Add your full name', done: p.name.trim().length >= 2, to: '/dashboard/profile#name' },
    { label: 'Choose your professional type', done: !!p.type, to: '/dashboard/profile#type' },
    { label: 'Choose your city', done: !!p.city, to: '/dashboard/profile#city' },
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
  return null;
}
export function hasContactDetails(text: string) {
  return /(?:\+?91[\s.-]?|0)?[6-9](?:[\s.-]?\d){9}\b|[\w.+-]+@[\w.-]+\.\w{2,}|(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|co\.in|in|net)\b|(?:^|\s)@[\w.]+|\b(?:instagram|insta|whatsapp|wa\.me|DM\s+me)\b/i.test(
    text,
  );
}
