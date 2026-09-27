import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Professional } from '../../types/domain';
import { ButtonLink } from '../ui/Button';
import { useRequirementLink } from '../../hooks/useRequirementLink';
export function Avatar({
  professional,
  large = false,
}: {
  professional: Professional;
  large?: boolean;
}) {
  return (
    <span
      className={`avatar ${large ? 'avatar--large' : ''}`}
      style={{ background: professional.color }}
    >
      {professional.initials}
    </span>
  );
}
export function ProfessionalCard({
  professional: p,
  compact = false,
}: {
  professional: Professional;
  compact?: boolean;
}) {
  const withRequirement = useRequirementLink();
  const profileUrl = withRequirement(`/p/${p.slug}`);
  if (compact)
    return (
      <article className="studio-card">
        <Link to={profileUrl} className="studio-card-image">
          <img
            src={p.projects[0]?.images[0] || '/images/living.jpg'}
            alt={`${p.projects[0]?.title || 'Portfolio'} by ${p.studio || p.name}`}
            loading="lazy"
          />
          <span className="image-arrow">
            <ArrowUpRight size={20} />
          </span>
        </Link>
        <div className="studio-card-info">
          <Avatar professional={p} />
          <div>
            <Link to={profileUrl}>
              <h3>{p.studio || p.name}</h3>
            </Link>
            <p>
              {p.city} <span>·</span> {p.years} years experience
            </p>
          </div>
        </div>
        <div className="studio-card-footer">
          <span>{p.type}</span>
          <span>{p.projects.length} projects</span>
        </div>
      </article>
    );
  return (
    <article className="professional-card">
      <div className="professional-card-main">
        <Avatar professional={p} />
        <div>
          <Link to={profileUrl}>
            <h2>{p.studio || p.name}</h2>
          </Link>
          <p className="professional-type">{p.type}</p>
          <p className="meta">
            <MapPin size={14} /> {p.city}
            <span>·</span>
            {p.years} years experience
          </p>
          <p className="bio-snippet">{p.bio}</p>
          <div className="tag-list">
            {p.services.slice(0, 2).map((s) => (
              <span key={s.id} className="tag">
                {s.category}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="professional-card-work">
        <div className="three-thumbnails">
          {Array.from({ length: 3 }, (_, i) => (
            <Link to={profileUrl} key={i} tabIndex={-1} aria-hidden="true">
              <img
                src={(p.projects[i] || p.projects[0])?.images[0] || '/images/living.jpg'}
                alt=""
                loading="lazy"
              />
            </Link>
          ))}
        </div>
        <ButtonLink variant="secondary" to={profileUrl}>
          View profile <ArrowUpRight size={17} />
        </ButtonLink>
      </div>
    </article>
  );
}
