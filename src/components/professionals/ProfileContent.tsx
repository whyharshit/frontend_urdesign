import { useState } from 'react';
import { MapPin, ArrowUpRight, LockKeyhole, BadgeCheck, Flag, Link2, Globe } from 'lucide-react';
import { Avatar, SaveButton } from './ProfessionalCard';
import { Button, ButtonLink } from '../ui/Button';
import { ProjectCard } from '../projects/ProjectCard';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Select, Textarea } from '../ui/Field';
import { toast } from '../ui/Feedback';
import { experienceLabel, servicePrice, uid } from '../../lib/format';
import type { Professional } from '../../types/domain';
import { useRequirementLink } from '../../hooks/useRequirementLink';
import { useDemo } from '../../hooks/useDemo';
import { REPORT_REASONS } from '../../config/catalog';

const linkLabel = (url: string) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('behance')) return 'Behance';
    if (host.includes('pinterest')) return 'Pinterest';
    return host;
  } catch {
    return url;
  }
};

/** Shared by the public profile and the professional's publish preview. */
export function ProfileContent({
  professional: p,
  preview = false,
}: {
  professional: Professional;
  preview?: boolean;
}) {
  const withRequirement = useRequirementLink();
  const { dispatch } = useDemo();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const cover = p.cover || p.projects[0]?.images[0];
  const links = (p.links || []).filter(Boolean);
  return (
    <>
      <div className="profile-cover">
        {cover ? (
          <img src={cover} alt={`Selected work by ${p.studio || p.name}`} />
        ) : (
          <span className="image-placeholder" aria-hidden="true" />
        )}
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
                <span
                  className="coa-badge"
                  title="Self-declared. UrDesigner has not yet checked the COA register."
                >
                  <BadgeCheck size={14} /> COA number provided
                </span>
              </>
            )}
          </p>
        </div>
        {!preview && (
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
          {!preview && (
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
                ...(p.coaNumber
                  ? [['COA registration', `${p.coaNumber} (provided, not yet checked)`]]
                  : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {links.length > 0 && (
              <div className="profile-links">
                {links.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="text-link"
                  >
                    {linkLabel(url) === 'Instagram' ? <Link2 size={15} /> : <Globe size={15} />}
                    {linkLabel(url)}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="panel">
            <LockKeyhole size={22} className="accent" />
            <h3 style={{ marginTop: 16 }}>A connection on your terms.</h3>
            <p className="small">
              Mobile and email are shared when you accept a proposal. Your contact details stay
              private until then, too.
            </p>
            {!preview && (
              <ButtonLink variant="secondary" to={withRequirement(`/enquiry/${p.slug}`)}>
                Tell us about your project
              </ButtonLink>
            )}
          </div>
          {!preview && (
            <Button variant="ghost" className="report-link" onClick={() => setReporting(true)}>
              <Flag size={14} /> Report this profile
            </Button>
          )}
        </aside>
      </div>
      {!preview && (
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
            toast('Thanks — our team will review this profile');
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
