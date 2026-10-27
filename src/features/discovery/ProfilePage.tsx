import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { ProfileContent } from '../../components/professionals/ProfileContent';
import { EmptyState } from '../../components/ui/Feedback';
import { ButtonLink } from '../../components/ui/Button';
import { areaLabel, slugify } from '../../lib/format';
import { useRequirementLink } from '../../hooks/useRequirementLink';

export function ProfilePage() {
  const { slug } = useParams();
  const { state, dispatch, ready } = useDemo();
  const professional = state.providers.find((p) => p.slug === slug);
  const viewed = useRef('');
  // Count one view per visit, for the professional's "Profile views this week".
  useEffect(() => {
    if (ready && professional?.status === 'published' && viewed.current !== professional.id) {
      viewed.current = professional.id;
      dispatch({
        type: 'profileView',
        providerId: professional.id,
        date: new Date().toISOString(),
      });
    }
  }, [ready, professional?.id, professional?.status, dispatch]);
  if (!professional)
    return (
      <div className="container section">
        <EmptyState
          title="Profile not found."
          description="There’s no profile at this address. Check the link, or find a professional instead."
          to="/architects"
          action="Find a professional"
        />
      </div>
    );
  if (professional.status !== 'published')
    return (
      <div className="container section">
        <EmptyState
          title="This profile is taking a little pause."
          description="This practice is currently unavailable. There are other perspectives waiting to be discovered."
          to={`/architects${professional?.city ? '/' + slugify(professional.city) : ''}`}
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

/** Full-screen photo viewer: arrow keys, swipe on touch, Escape to close. */
function Lightbox({
  images,
  index,
  title,
  onChange,
  onClose,
}: {
  images: string[];
  index: number;
  title: string;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touch = useRef(0);
  const go = (delta: number) => onChange((index + delta + images.length) % images.length);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={`${title} photos`}
      onCancel={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <img src={images[index]} alt={`${title}, photo ${index + 1} of ${images.length}`} />
      <button type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
        <X />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-prev"
            aria-label="Previous photo"
            onClick={() => go(-1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="lightbox-next"
            aria-label="Next photo"
            onClick={() => go(1)}
          >
            <ChevronRight />
          </button>
        </>
      )}
      <span className="lightbox-count">
        {index + 1} / {images.length}
      </span>
    </dialog>
  );
}

export function ProjectPage() {
  const withRequirement = useRequirementLink();
  const { slug, projectId } = useParams();
  const { state, ready } = useDemo();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
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
        {!(ready && state.session.professional && professional.id === state.ownId) && (
          <ButtonLink to={withRequirement(`/enquiry/${slug}`)}>
            Send enquiry <ArrowUpRight size={17} />
          </ButtonLink>
        )}
      </div>
      <button
        type="button"
        className="project-detail-trigger"
        aria-label="Open photo full screen"
        onClick={() => setZoom(true)}
      >
        <img
          className="project-detail-image"
          src={project.images[active] || project.images[0]}
          alt={project.photoInfo?.[active]?.alt || `${project.title}, view ${active + 1}`}
        />
        <span className="image-arrow">
          <Expand size={17} />
        </span>
      </button>
      {project.photoInfo?.[active]?.caption && (
        <p className="photo-caption">{project.photoInfo[active].caption}</p>
      )}
      <div className="project-caption">
        <span>
          {[project.location, project.year, project.area && areaLabel(project.area)]
            .filter(Boolean)
            .join(' · ')}
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
              <dd>{project.area ? areaLabel(project.area) : 'Not specified'}</dd>
            </div>
          </dl>
        </div>
      </div>
      {zoom && (
        <Lightbox
          images={project.images}
          index={active}
          title={project.title}
          onChange={setActive}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}
