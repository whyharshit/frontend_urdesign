import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { ProfileContent } from '../../components/professionals/ProfileContent';
import { EmptyState } from '../../components/ui/Feedback';
import { ButtonLink } from '../../components/ui/Button';
import { slugify } from '../../lib/format';
import { useRequirementLink } from '../../hooks/useRequirementLink';

export function ProfilePage() {
  const { slug } = useParams();
  const { state } = useDemo();
  const professional = state.providers.find((p) => p.slug === slug);
  if (!professional || professional.status !== 'published')
    return (
      <div className="container section">
        <EmptyState
          title="This profile is taking a little pause."
          description="This practice is currently unavailable. There are other perspectives waiting to be discovered."
          to={`/architects${professional ? '/' + slugify(professional.city) : ''}`}
          action="Find similar professionals"
        />
      </div>
    );
  return (
    <div className="container profile-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/architects">Professionals</Link>
        <span>/</span>
        <span>{professional.studio || professional.name}</span>
      </div>
      <ProfileContent professional={professional} />
    </div>
  );
}

export function ProjectPage() {
  const withRequirement = useRequirementLink();
  const { slug, projectId } = useParams();
  const { state } = useDemo();
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [projectId]);
  const professional = state.providers.find((p) => p.slug === slug && p.status === 'published');
  const project = professional?.projects.find((p) => p.id === projectId);
  if (!professional || !project)
    return (
      <div className="container section">
        <EmptyState
          title="This project is unavailable."
          description="Explore more work from our professional community."
          to="/architects"
        />
      </div>
    );
  return (
    <div className="container profile-page">
      <div className="breadcrumbs">
        <Link to="/architects">Professionals</Link>
        <span>/</span>
        <Link to={withRequirement(`/p/${slug}`)}>{professional.studio || professional.name}</Link>
        <span>/</span>
        <span>{project.title}</span>
      </div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {project.type} · {project.location}
          </span>
          <h1>{project.title}</h1>
          <p>
            By{' '}
            <Link className="text-link" to={withRequirement(`/p/${slug}`)}>
              {professional.studio || professional.name}
            </Link>
          </p>
        </div>
        <ButtonLink to={withRequirement(`/enquiry/${slug}`)}>
          Start your own story <ArrowUpRight size={17} />
        </ButtonLink>
      </div>
      <img
        className="project-detail-image"
        src={project.images[active] || project.images[0]}
        alt={`${project.title} — view ${active + 1}`}
      />
      <div className="project-caption">
        <span>
          {project.location} · {project.year} · {project.area}
        </span>
        <span>
          {active + 1} / {project.images.length}
        </span>
      </div>
      {project.images.length > 1 && (
        <div className="project-gallery" aria-label="Project images">
          {project.images.map((src, i) => (
            <button
              key={i}
              aria-label={`View image ${i + 1}`}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
      <div className="profile-body">
        <section className="profile-section">
          <span className="eyebrow">BEHIND THE DESIGN</span>
          <h2>Considered in every detail.</h2>
          <p>{project.description}</p>
        </section>
        <div className="panel">
          <dl className="detail-grid">
            <div>
              <dt>Project type</dt>
              <dd>{project.type}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{project.area || 'Not specified'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
