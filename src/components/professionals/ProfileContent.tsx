import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, LockKeyhole, Flag, Eye } from 'lucide-react';
import { Avatar, SaveButton, portfolioImages } from './ProfessionalCard';
import { Button, ButtonLink } from '../ui/Button';
import { ProjectCard } from '../projects/ProjectCard';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Select, Textarea } from '../ui/Field';
import { toast } from '../ui/Feedback';
import { experienceLabel, servicePrice, uid } from '../../lib/format';
import type { Professional } from '../../types/domain';
import { useRequirementLink } from '../../hooks/useRequirementLink';
import { useDemo } from '../../hooks/useDemo';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { REPORT_REASONS } from '../../config/catalog';

/** "Website", "Instagram", …: the kind of link, never the address itself. */
export const linkLabel = (url: string) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('behance')) return 'Behance';
    if (host.includes('pinterest')) return 'Pinterest';
    return 'Website';
  } catch {
    return 'Website';
  }
};

/** Cover photo plus portfolio photos, advancing on their own; hover or focus pauses them. */
function CoverSlideshow({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (paused || reduced || images.length < 2) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % images.length), 4500);
    return () => clearTimeout(timer);
  }, [active, paused, reduced, images.length]);
  if (!images.length) return <span className="image-placeholder" aria-hidden="true" />;
  return (
    <div
      className="cover-slideshow"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          className={i === active ? 'is-active' : ''}
          alt={i === active ? alt : ''}
          aria-hidden={i !== active}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      {images.length > 1 && (
        <div className="cover-dots" aria-label="Cover photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Shared by the public profile and the professional's publish preview. */
export function ProfileContent({
  professional: p,
  preview = false,
}: {
  professional: Professional;
  preview?: boolean;
}) {
  const withRequirement = useRequirementLink();
  const { state, dispatch, ready } = useDemo();
  // A professional looking at their own public page sees it as clients do, minus the buttons
  // that only make sense for clients.
  const own = ready && state.session.professional && p.id === state.ownId;
  const client = !preview && !own;
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const covers = [...new Set([p.cover, ...portfolioImages(p)].filter(Boolean) as string[])].slice(
    0,
    6,
  );
  const links = [...new Set((p.links || []).filter(Boolean).map(linkLabel))];
  return (
    <>
      {own && !preview && (
        <div className="own-profile-bar" role="status">
          <Eye size={17} />
          <p>This is your public profile, as clients see it.</p>
          <Link className="text-link" to="/dashboard/profile">
            Edit profile
          </Link>
        </div>
      )}
      <div className="profile-cover">
        <CoverSlideshow images={covers} alt={`Selected work by ${p.studio || p.name}`} />
      </div>
      <div className="profile-header">
        <Avatar professional={p} large />
        <div>
          <span className="eyebrow">{p.type}</span>
          <h1>{p.studio || p.name || 'Your practice'}</h1>
          {p.studio && <p className="profile-person">Led by {p.name}</p>}
          <p className="meta">
            <MapPin size={14} />
            {p.city}
            <span>·</span>
            {experienceLabel(p.years, 'of experience')}
            {p.coaNumber && (
              <>
                <span>·</span>
                <span title="Self-declared. UR DESIGNER has not yet checked the CoA register.">
                  CoA number provided
                </span>
              </>
            )}
          </p>
        </div>
        {client && (
          <div className="profile-header-actions">
            <SaveButton professional={p} />
            <ButtonLink to={withRequirement(`/enquiry/${p.slug}`)}>
              Send enquiry <ArrowUpRight size={18} />
            </ButtonLink>
          </div>
        )}
      </div>
      <div className="profile-body">
        <div className="profile-main">
          <section className="profile-section">
            <span className="eyebrow">THE PRACTICE</span>
            <h2>A little about us.</h2>
            <p>{p.bio || 'Your story will appear here.'}</p>
          </section>
          <section className="profile-section">
            <span className="eyebrow">WHAT WE CAN CREATE TOGETHER</span>
            <h2>Services & indicative pricing</h2>
            <div>
              {p.services.map((service) => (
                <div className="service-row" key={service.id}>
                  <div>
                    <h3>{service.category}</h3>
                    <p>{service.description}</p>
                  </div>
                  <strong>{servicePrice(service)}</strong>
                </div>
              ))}
            </div>
            {!p.services.length && (
              <p>Add your first service to help clients understand your practice.</p>
            )}
          </section>
          <section className="profile-section">
            <span className="eyebrow">SPACES, WITH A STORY</span>
            <h2>
              Selected work <span className="muted">({p.projects.length})</span>
            </h2>
            <div className="masonry profile-projects">
              {p.projects.map((project) => (
                <ProjectCard key={project.id} project={project} slug={p.slug} natural />
              ))}
            </div>
          </section>
          {client && (
            <div className="button-row">
              <div>
                <h3>Have a space in mind?</h3>
                <p className="small">Share your idea. See where it could go.</p>
              </div>
              <ButtonLink to={withRequirement(`/enquiry/${p.slug}`)}>
                Send enquiry <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
          )}
        </div>
        <aside className="profile-aside">
          <div className="panel">
            <span className="eyebrow">THE DETAILS</span>
            <h3>Professional information</h3>
            <dl className="detail-grid">
              {[
                ['Qualification', p.qualification || 'Not provided'],
                ['Experience', experienceLabel(p.years, '')],
                ['Based in', p.city],
                ...(p.workCities?.length ? [['Also takes work in', p.workCities.join(', ')]] : []),
                ['Languages', p.languages.filter(Boolean).join(', ') || 'Not provided'],
                ...(p.coaNumber ? [['CoA registration', 'Number provided, not yet checked']] : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {links.length > 0 && (
              <p className="profile-links small">
                <LockKeyhole size={14} /> Shared when you accept: {links.join(' · ')}
              </p>
            )}
          </div>
          <div className="panel">
            <LockKeyhole size={22} className="accent" />
            <h3 style={{ marginTop: 16 }}>A connection on your terms.</h3>
            <p className="small">
              Mobile and email are shared when you accept a proposal. Your contact details stay
              private until then, too.
            </p>
            {client && (
              <ButtonLink variant="secondary" to={withRequirement(`/enquiry/${p.slug}`)}>
                Tell us about your project
              </ButtonLink>
            )}
          </div>
          {client && (
            <Button variant="ghost" className="report-link" onClick={() => setReporting(true)}>
              <Flag size={14} /> Report this profile
            </Button>
          )}
        </aside>
      </div>
      {client && (
        <ConfirmDialog
          open={reporting}
          title="Report this profile"
          confirmLabel="Send report"
          confirmDisabled={!reason}
          onClose={() => setReporting(false)}
          onConfirm={() => {
            dispatch({
              type: 'report',
              report: {
                id: uid(),
                providerId: p.id,
                reason,
                details: details.trim(),
                date: new Date().toISOString(),
              },
            });
            setReason('');
            setDetails('');
            toast('Thanks. Our team will review this profile.');
          }}
        >
          <div className="stack">
            <p>Tell us what’s wrong. The professional won’t see who reported them.</p>
            <Select
              label="What’s the problem?"
              value={reason}
              required
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Choose a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
            <Textarea
              label="Anything else we should know? (optional)"
              rows={3}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </ConfirmDialog>
      )}
    </>
  );
}
