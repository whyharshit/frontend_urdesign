import { seedProviders } from '../data/seed';
import { CITIES } from '../config/catalog';
import { slugify } from '../lib/format';

export function getPageMetadata(url: string) {
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  let title = 'Thoughtful spaces start with the right people';
  let description =
    'Discover architects and interior designers in India. Explore portfolios, compare services and connect on your terms with UrDesigner.';
  let status = 200;
  if (pathname.startsWith('/architects')) {
    const city = CITIES.find((c) => slugify(c) === pathname.split('/')[2]);
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
    if (provider && (!projectId || project)) {
      title = project
        ? `${project.title} · ${provider.studio}`
        : `${provider.studio || provider.name} · ${provider.type} in ${provider.city}`;
      description = project?.description || provider.bio;
    } else {
      title = 'Profile or project unavailable';
      status = 404;
    }
  } else if (pathname !== '/') {
    const titles: Record<string, string> = {
      '/join': 'Make room for your practice',
      '/login': 'Welcome back',
      '/forgot-password': 'Reset your password',
      '/my-enquiries': 'My enquiries',
      '/terms': 'Terms of service',
      '/privacy': 'Privacy policy',
      '/playground': 'Explore the frontend',
      '/dashboard': 'Your studio overview',
      '/admin': 'Professional moderation',
    };
    title = titles[pathname] || pathname.split('/').filter(Boolean).at(-1)!.replaceAll('-', ' ');
    if (!titles[pathname] && !/^\/(dashboard|admin|enquiry|my-enquiries)\//.test(pathname)) {
      title = 'Page not found';
      status = 404;
    }
  }
  return {
    title: `${title} | UrDesigner`,
    description,
    status,
    private: /^\/(dashboard|admin|enquiry|my-enquiries|login|join|forgot-password|playground)/.test(
      pathname,
    ),
  };
}
