import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import { CITIES, PROFESSIONAL_TYPES, SERVICES } from '../../config/catalog';
import { useDemo } from '../../hooks/useDemo';
import { filterProfessionals } from '../../lib/rules';
import { slugify } from '../../lib/format';
import { ProfessionalCard } from '../../components/professionals/ProfessionalCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
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
  };
  const [refine, setRefine] = useState(!!(filters.type || filters.service || filters.experience));
  const results = filterProfessionals(state.providers, filters);
  const city = CITIES.find((c) => slugify(c) === slugify(filters.city));
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    setParams(next);
  };
  const count = (key: keyof SearchFilters, value: string) =>
    filterProfessionals(state.providers, { ...filters, [key]: value }).length;
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pages = Math.ceil(results.length / 20);
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
        <div className="filter-bar">
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
              <option value="">All cities ({count('city', '')})</option>
              {CITIES.map((c) => (
                <option key={c} value={slugify(c)} disabled={count('city', c) === 0}>
                  {c} ({count('city', c)})
                </option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" aria-expanded={refine} onClick={() => setRefine(!refine)}>
            <SlidersHorizontal size={17} />
            Refine{' '}
            {filters.type || filters.service || filters.experience ? (
              <span className="filter-dot" />
            ) : null}
          </Button>
          {Object.values(filters).some(Boolean) && (
            <Link className="text-link clear-filters" to={withRequirement('/architects')}>
              <X size={15} />
              Clear filters
            </Link>
          )}
        </div>
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
                <option value="">Any ({count(group.key, '')})</option>
                {group.values.map(([value, label]) => (
                  <option key={value} value={value} disabled={count(group.key, value) === 0}>
                    {label} ({count(group.key, value)})
                  </option>
                ))}
              </Select>
            ))}
          </div>
        )}
        <div className="results-heading">
          <p>
            <strong>
              {results.length} {results.length === 1 ? 'professional' : 'professionals'}
            </strong>
            {city ? ` in ${city}` : ' to discover'}
          </p>
          <span>Different perspectives. Your perfect fit.</span>
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
            description={`No professionals match ${[city || filters.city, filters.type.replaceAll('-', ' '), filters.service.replaceAll('-', ' '), filters.experience && filters.experience + ' years'].filter(Boolean).join(' · ')}. Remove a filter or explore the sample practices in Ahmedabad.`}
            to="/architects/ahmedabad"
            action="See professionals in Ahmedabad"
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
            Make room for your practice <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
