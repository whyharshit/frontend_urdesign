import { MapPin, ArrowUpRight, LockKeyhole } from 'lucide-react';
import { Avatar } from './ProfessionalCard';
import { ButtonLink } from '../ui/Button';
import { ProjectCard } from '../projects/ProjectCard';
import { servicePrice } from '../../lib/format';
import type { Professional } from '../../types/domain';
import { useRequirementLink } from '../../hooks/useRequirementLink';

/** Shared by the public profile and the professional's publish preview. */
export function ProfileContent({
  professional: p,
  preview = false,
}: {
  professional: Professional;
  preview?: boolean;
}) {
  const withRequirement = useRequirementLink();
  return (
    <>
      <div className="profile-cover">
        <img
          src={p.projects[0]?.images[0] || '/images/living.jpg'}
          alt={`Selected work by ${p.studio || p.name}`}
        />
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
            {p.years} years of experience
          </p>
        </div>
        {!preview && (
          <ButtonLink to={withRequirement(`/enquiry/${p.slug}`)}>
            Send enquiry <ArrowUpRight size={18} />
          </ButtonLink>
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
            <div className="project-grid profile-projects">
              {p.projects.map((project) => (
                <ProjectCard key={project.id} project={project} slug={p.slug} />
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
                ['Experience', `${p.years} years`],
                ['Based in', p.city],
                ['Languages', p.languages.join(', ') || 'Not provided'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
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
        </aside>
      </div>
    </>
  );
}
