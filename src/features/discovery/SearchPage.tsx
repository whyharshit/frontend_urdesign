import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, X, ArrowRight, Search } from 'lucide-react';
import { CITIES, PROFESSIONAL_TYPES, SERVICES } from '../../config/catalog';
import { useDemo } from '../../hooks/useDemo';
import { filterProfessionals, SORTS } from '../../lib/rules';
import { plural, slugify } from '../../lib/format';
import { ProfessionalCard } from '../../components/professionals/ProfessionalCard';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/Feedback';
import type { SearchFilters } from '../../types/domain';
import { useRequirementLink } from '../../hooks/useRequirementLink';
export function SearchPage() {
  const withRequirement = useRequirementLink();
  const { city: pathCity } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const filters: SearchFilters = {
    city: pathCity || params.get('city') || '',
    type: params.get('type') || '',
    service: params.get('service') || '',
    experience: params.get('experience') || '',
    q: params.get('q') || '',
    projectType: params.get('projectType') || '',
    sort: params.get('sort') || 'active',
  };
  const [query, setQuery] = useState(filters.q);
  useEffect(() => setQuery(filters.q), [filters.q]);
  const [refine, setRefine] = useState(!!(filters.type || filters.service || filters.experience));
  const results = filterProfessionals(state.providers, filters);
  const published = state.providers.filter((p) => p.status === 'published');
  // Only cities where someone actually works, so the list never offers an empty choice.
  const cities = CITIES.filter((c) =>
    published.some((p) => [p.city, ...(p.workCities || [])].some((w) => slugify(w) === slugify(c))),
  );
  const city = CITIES.find((c) => slugify(c) === slugify(filters.city));
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    setParams(next);
  };
  const has = (key: keyof SearchFilters, value: string) =>
    filterProfessionals(state.providers, { ...filters, [key]: value }).length > 0;
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pages = Math.ceil(results.length / 20);
  const filtered = !!(
    filters.city ||
    filters.type ||
    filters.service ||
    filters.experience ||
    filters.q ||
    filters.projectType
  );
  return (
    <>
      <section className="discovery-intro">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Find a professional</span>
          </div>
          <span className="eyebrow">YOUR SPACE DESERVES THE RIGHT PEOPLE</span>
          <h1>
            Find your kind of professional<span className="accent">.</span>
          </h1>
          <p>Explore the work. Get to know the practice. Start something good.</p>
        </div>
      </section>
      <section className="container search-content">
        <form
          className="filter-bar"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter('q', query.trim());
          }}
        >
          <div className="name-search">
            <Search size={18} />
            <Input
              label="Name or studio"
              name="q"
              type="search"
              placeholder="e.g. Aangan Studio"
              value={query}
              maxLength={60}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) setFilter('q', '');
              }}
            />
          </div>
          <div className="city-filter">
            <MapPin size={19} />
            <Select
              label="Project city"
              value={filters.city ? slugify(filters.city) : ''}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                next.delete('city');
                next.delete('page');
                const query = next.toString();
                navigate(
                  `/architects${e.target.value ? '/' + e.target.value : ''}${query ? '?' + query : ''}`,
                );
              }}
            >
              <option value="">All cities</option>
              {city && !cities.includes(city) && <option value={slugify(city)}>{city}</option>}
              {cities.map((c) => (
                <option key={c} value={slugify(c)}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Project type"
            value={filters.projectType}
            onChange={(e) => setFilter('projectType', e.target.value)}
          >
            <option value="">Residential & commercial</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </Select>
          <Select
            label="Sort by"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value === 'active' ? '' : e.target.value)}
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="secondary"
            aria-expanded={refine}
            onClick={() => setRefine(!refine)}
          >
            <SlidersHorizontal size={17} />
            More filters{' '}
            {filters.type || filters.service || filters.experience ? (
              <span className="filter-dot" />
            ) : null}
          </Button>
          {filtered && (
            <Link className="text-link clear-filters" to={withRequirement('/architects')}>
              <X size={15} />
              Clear filters
            </Link>
          )}
        </form>
        {refine && (
          <div className="refine-grid">
            {[
              {
                key: 'type' as const,
                label: 'Professional type',
                values: PROFESSIONAL_TYPES.map((t) => [slugify(t), t]),
              },
              {
                key: 'service' as const,
                label: 'Service',
                values: SERVICES.map((s) => [slugify(s), s]),
              },
              {
                key: 'experience' as const,
                label: 'Years of experience',
                values: ['0-2', '3-5', '6-10', '10+'].map((x) => [
                  x,
                  x.replace('-', '–') + ' years',
                ]),
              },
            ].map((group) => (
              <Select
                key={group.key}
                label={group.label}
                value={filters[group.key]}
                onChange={(e) => setFilter(group.key, e.target.value)}
              >
                <option value="">Any</option>
                {group.values
                  .filter(([value]) => value === filters[group.key] || has(group.key, value))
                  .map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
              </Select>
            ))}
          </div>
        )}
        <div className="results-heading">
          <p>
            <strong>{plural(results.length, 'professional')}</strong>
            {city ? ` in ${city}` : ' to discover'}
            {filters.q ? ` matching “${filters.q}”` : ''}
          </p>
          <span>
            Sorted by{' '}
            {SORTS.find(([v]) => v === filters.sort)?.[1].toLowerCase() || 'recently active'}
          </span>
        </div>
        {results.length ? (
          <div className="results-list">
            {results.slice((page - 1) * 20, page * 20).map((p) => (
              <ProfessionalCard key={p.id} professional={p} />
            ))}
            {page > pages && (
              <EmptyState
                title="This page has no results"
                description="Return to the first page of these search results."
                to={`/architects${pathCity ? '/' + pathCity : ''}`}
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="A little change could open up more possibilities."
            description={`No professionals match ${[filters.q && `“${filters.q}”`, city || filters.city, filters.projectType, filters.type.replaceAll('-', ' '), filters.service.replaceAll('-', ' '), filters.experience && filters.experience + ' years'].filter(Boolean).join(' · ')}. Remove a filter to see more practices.`}
            to={withRequirement('/architects')}
            action="See all professionals"
          />
        )}
        {pages > 1 && (
          <nav className="pagination" aria-label="Search pages">
            {Array.from({ length: pages }, (_, i) => (
              <Link
                key={i}
                className={page === i + 1 ? 'active' : ''}
                to={`?${new URLSearchParams({ ...Object.fromEntries(params), page: String(i + 1) })}`}
              >
                {i + 1}
              </Link>
            ))}
          </nav>
        )}
        <div className="search-bottom">
          <span>Are you an architect or interior designer?</span>
          <Link to="/join">
            Join as a professional <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
