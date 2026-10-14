import { seedProviders } from '../data/seed';
import { CITIES } from '../config/catalog';
import { slugify } from '../lib/format';

export function getPageMetadata(url: string) {
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  let title = 'Thoughtful spaces start with the right people';
  let description =
    'Discover architects and interior designers in India. Explore portfolios, compare services and connect on your terms with UrDesigner.';
  let status = 200;
  // Picture for link previews (og:image); a profile or project uses its own photo.
  let image = '/images/living.jpg';
  if (pathname.startsWith('/architects')) {
    const city = CITIES.find((c) => slugify(c) === pathname.split('/')[2]);
    const citySlug = pathname.split('/')[2];
    if (citySlug && !city) {
      return {
        title: 'City not found | UrDesigner',
        description,
        status: 404,
        private: true,
        image,
        path: pathname,
      };
    }
    const filters = ['type', 'service', 'experience']
      .map((key) => searchParams.get(key)?.replaceAll('-', ' '))
      .filter(Boolean);
    title = `Architects & interior designers${city ? ` in ${city}` : ' in India'}${filters.length ? ` · ${filters.join(' · ')}` : ''}`;
    if (searchParams.get('page')) title += ` · Page ${searchParams.get('page')}`;
    description = `Explore professional portfolios, services and indicative pricing${city ? ` in ${city}` : ' across India'}. Find the right practice for your space${filters.length ? `, filtered by ${filters.join(', ')}` : ''}.`;
  } else if (pathname.startsWith('/p/')) {
    const [, , slug, , projectId] = pathname.split('/');
    const provider = seedProviders.find((p) => p.slug === slug);
    const project = provider?.projects.find((p) => p.id === projectId);
    if (provider?.status === 'published' && (!projectId || project)) {
      title = project
        ? `${project.title} · ${provider.studio}`
        : `${provider.studio || provider.name} · ${provider.type} in ${provider.city}`;
      description = project?.description || provider.bio;
      image = project?.images[0] || provider.cover || provider.projects[0]?.images[0] || image;
    } else {
      title = 'Profile or project unavailable';
      status = 404;
    }
  } else if (pathname !== '/') {
    const titles: Record<string, string> = {
      '/join': 'Join as a professional',
      '/login': 'Professional log in',
      '/forgot-password': 'Reset your password',
      '/my-enquiries': 'My enquiries',
      '/my-enquiries/saved': 'Saved professionals',
      '/terms': 'Terms of service',
      '/privacy': 'Privacy policy',
      '/playground': 'Explore the frontend',
      '/dashboard': 'Your studio overview',
      '/dashboard/setup': 'Set up your profile',
      '/dashboard/profile': 'My profile',
      '/dashboard/publish': 'Preview & publish',
      '/dashboard/services': 'Services & pricing',
      '/dashboard/portfolio': 'Portfolio',
      '/dashboard/portfolio/new': 'Add a project',
      '/dashboard/enquiries': 'Enquiries',
      '/dashboard/connects': 'Connects wallet',
      '/dashboard/connects/buy': 'Buy connects',
      '/dashboard/referrals': 'Refer a professional',
      '/admin': 'Professional moderation',
      '/admin/login': 'Admin log in',
      '/admin/reports': 'Reported profiles',
      '/admin/payments': 'Payment verification',
      '/admin/enquiries': 'Enquiries & proposals',
    };
    // Dynamic workspace routes get a readable name, never a raw id.
    const patterns: [RegExp, string][] = [
      [/^\/dashboard\/portfolio\/[^/]+$/, 'Edit project'],
      [/^\/dashboard\/enquiries\/[^/]+\/proposal$/, 'Write a proposal'],
      [/^\/dashboard\/enquiries\/[^/]+$/, 'Enquiry details'],
      [/^\/dashboard\/connects\/payment\/[^/]+$/, 'Connect pack payment'],
      [/^\/my-enquiries\/proposal\/[^/]+$/, 'Your proposal'],
      [/^\/my-enquiries\/compare\/[^/]+$/, 'Compare proposals'],
      [/^\/enquiry\/[^/]+$/, 'Send an enquiry'],
    ];
    const clean = pathname.replace(/\/+$/, '') || '/';
    const match = titles[clean] || patterns.find(([pattern]) => pattern.test(clean))?.[1];
    if (match) title = match;
    else {
      title = 'Page not found';
      status = 404;
    }
    if (clean.startsWith('/enquiry/')) {
      const provider = seedProviders.find((p) => p.slug === clean.split('/')[2]);
      if (provider) title = `Send an enquiry to ${provider.studio || provider.name}`;
    }
  }
  return {
    title: `${title} | UrDesigner`,
    description,
    status,
    image,
    path: pathname,
    private: /^\/(dashboard|admin|enquiry|my-enquiries|login|join|forgot-password|playground)/.test(
      pathname,
    ),
  };
}
