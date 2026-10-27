import { ArrowUpRight, Bookmark, BookmarkCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Professional } from '../../types/domain';
import { ButtonLink } from '../ui/Button';
import { toast } from '../ui/Feedback';
import { useRequirementLink } from '../../hooks/useRequirementLink';
import { useDemo } from '../../hooks/useDemo';
import { experienceLabel, plural } from '../../lib/format';
export function Avatar({
  professional,
  large = false,
}: {
  professional: Professional;
  large?: boolean;
}) {
  if (professional.photo)
    return (
      <img
        className={`avatar avatar--photo ${large ? 'avatar--large' : ''}`}
        src={professional.photo}
        alt=""
      />
    );
  return (
    <span
      className={`avatar ${large ? 'avatar--large' : ''}`}
      style={{ background: professional.color }}
    >
      {professional.initials}
    </span>
  );
}
/** Every distinct portfolio image, cover photos first. Never repeats one to fill space. */
export function portfolioImages(p: Professional) {
  const covers = p.projects.map((project) => project.images[0]).filter(Boolean);
  const rest = p.projects.flatMap((project) => project.images.slice(1));
  return [...new Set([...covers, ...rest])];
}
export function SaveButton({
  professional,
  compact = false,
}: {
  professional: Professional;
  compact?: boolean;
}) {
  const { state, dispatch } = useDemo();
  const saved = state.saved.includes(professional.id);
  const name = professional.studio || professional.name;
  return (
    <button
      type="button"
      className={`save-button ${compact ? 'save-button--icon' : ''} ${saved ? 'is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={compact ? `${saved ? 'Remove' : 'Save'} ${name}` : undefined}
      onClick={(e) => {
        e.preventDefault();
        dispatch({ type: 'toggleSave', providerId: professional.id });
        toast(saved ? `${name} removed from saved` : `${name} saved to compare later`);
      }}
    >
      {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
      {!compact && (saved ? 'Saved' : 'Save')}
    </button>
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
  const images = portfolioImages(p);
  if (compact)
    return (
      <article className="studio-card">
        <Link to={profileUrl} className="studio-card-image">
          {images[0] ? (
            <img
              src={images[0]}
              alt={`${p.projects[0]?.title || 'Portfolio'} by ${p.studio || p.name}`}
              loading="lazy"
            />
          ) : (
            <span className="image-placeholder" aria-hidden="true" />
          )}
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
              {p.city} <span>·</span> {experienceLabel(p.years)}
            </p>
          </div>
        </div>
        <div className="studio-card-footer">
          <span>{p.type}</span>
          <span>{plural(p.projects.length, 'project')}</span>
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
            {experienceLabel(p.years)}
          </p>
          <p className="bio-snippet">{p.bio}</p>
          <div className="tag-list">
            {p.coaNumber && <span className="tag">CoA number provided</span>}
            {p.services.slice(0, 2).map((s) => (
              <span key={s.id} className="tag">
                {s.category}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="professional-card-work">
        {images.length > 0 && (
          <div className={`three-thumbnails three-thumbnails--${Math.min(3, images.length)}`}>
            {images.slice(0, 3).map((src) => (
              <Link to={profileUrl} key={src} tabIndex={-1} aria-hidden="true">
                <img src={src} alt="" loading="lazy" />
              </Link>
            ))}
          </div>
        )}
        <div className="card-actions">
          <SaveButton professional={p} />
          <ButtonLink variant="secondary" to={profileUrl}>
            View profile <ArrowUpRight size={17} />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
