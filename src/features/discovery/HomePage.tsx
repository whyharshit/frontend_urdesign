import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Search,
  LockKeyhole,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CITIES } from '../../config/catalog';
import { useDemo } from '../../hooks/useDemo';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { slugify } from '../../lib/format';
import { ProfessionalCard } from '../../components/professionals/ProfessionalCard';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button, ButtonLink } from '../../components/ui/Button';
import { HeroVisual } from './components/HeroVisual';

/** Sections fade up once as they scroll in. Content stays visible without JavaScript. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = [...root.querySelectorAll<HTMLElement>('.reveal')].filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    sections.forEach((el) => el.classList.add('reveal--waiting'));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal--waiting');
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/** Featured studios glide sideways on their own; hovering or focusing pauses them. */
function StudioCarousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const step = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const width = (card?.offsetWidth || el.clientWidth / 3) + 25;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (direction === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else if (direction === -1 && el.scrollLeft <= 4)
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    else el.scrollBy({ left: direction * width, behavior: 'smooth' });
  };
  useEffect(() => {
    if (paused || reduced) return;
    const timer = setInterval(() => step(1), 3500);
    return () => clearInterval(timer);
  }, [paused, reduced]);
  return (
    <div
      className="studio-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="studio-track" ref={track}>
        {children}
      </div>
      <div className="carousel-controls">
        <button type="button" aria-label="Previous studios" onClick={() => step(-1)}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" aria-label="Next studios" onClick={() => step(1)}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

const principles = ['Discover the work', 'Find your people', 'Start a conversation'];

export function HomePage() {
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('');
  const navigate = useNavigate();
  const { state } = useDemo();
  const listId = useId();
  const reveal = useReveal();
  const providers = state.providers.filter((p) => p.status === 'published');
  return (
    <div ref={reveal}>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-star">✳</span> SPACES WITH SOUL. PEOPLE WITH VISION.
          </span>
          <h1>
            Your space.
            <br />
            Your story.
            <br />
            <span>The right designer.</span>
          </h1>
          <p>
            Discover architects and interior designers who see the potential in your space. Explore
            their work. Find your kind of professional.
          </p>
          <form
            className="hero-search"
            action="/architects"
            onSubmit={(e) => {
              e.preventDefault();
              const match = CITIES.find((c) => c.toLowerCase() === city.trim().toLowerCase());
              if (city.trim() && !match) {
                setCityError('Choose a city from the list, or leave it empty to see everyone');
                return;
              }
              navigate(match ? `/architects/${slugify(match)}` : '/architects');
            }}
          >
            <div>
              <MapPin size={20} />
              <label htmlFor="hero-city">
                <span>Where’s your project?</span>
                <input
                  id="hero-city"
                  name="city"
                  list={listId}
                  value={city}
                  placeholder="Any city in India"
                  autoComplete="address-level2"
                  aria-invalid={!!cityError}
                  aria-describedby={cityError ? 'hero-city-error' : undefined}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setCityError('');
                  }}
                />
                <datalist id={listId}>
                  {CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
            </div>
            <Button type="submit">
              <Search size={18} />
              <span>Find a professional</span>
            </Button>
          </form>
          {cityError && (
            <small id="hero-city-error" className="error-text" role="alert">
              {cityError}
            </small>
          )}
          <div className="hero-reassurance">
            <span>
              <Check size={14} /> Free to explore
            </span>
            <span>
              <Check size={14} /> Connect on your terms
            </span>
          </div>
        </div>
        <HeroVisual />
      </section>
      <div className="principles-strip">
        <div className="container">
          <span>
            Thoughtful choices.
            <br />
            <strong>Better spaces.</strong>
          </span>
          <div className="principles-marquee">
            {[0, 1].map((copy) => (
              <div className="principles-track" key={copy} aria-hidden={copy === 1}>
                {principles.map((text, i) => (
                  <div key={text}>
                    <span>0{i + 1}</span> {text}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <span className="strip-star" aria-hidden="true">
            ✳
          </span>
        </div>
      </div>
      <section className="section container reveal">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE PEOPLE BEHIND THE SPACES</span>
            <h2>Find a practice that feels right.</h2>
            <p>Independent minds. Distinct perspectives. A shared love for good design.</p>
          </div>
          <Link className="text-link" to="/architects">
            Find a professional <ArrowUpRight size={18} />
          </Link>
        </div>
        <StudioCarousel>
          {providers.map((p) => (
            <ProfessionalCard key={p.id} professional={p} compact />
          ))}
        </StudioCarousel>
      </section>
      <section className="how-section reveal" id="how-it-works">
        <div className="container">
          <div className="how-intro">
            <span className="eyebrow">FROM AN IDEA TO A FIRST HELLO</span>
            <h2>
              Good things begin
              <br />
              with a simple connection.
            </h2>
            <p>Finding the right professional shouldn’t feel like a project in itself.</p>
            <ButtonLink to="/architects" variant="secondary">
              Find a professional <ArrowRight size={17} />
            </ButtonLink>
          </div>
          <div className="steps">
            {[
              {
                n: '01',
                title: 'Find your kind of professional',
                body: 'Explore portfolios, services and experience. Find the people whose work speaks to you.',
              },
              {
                n: '02',
                title: 'Tell them what you have in mind',
                body: 'Write your requirement once and send it to up to five professionals. Your contact details stay private.',
              },
              {
                n: '03',
                title: 'Choose who you connect with',
                body: 'Read their indicative proposals. Accept one when it feels right, and your contact details are shared.',
              },
            ].map((step) => (
              <div className="step" key={step.n}>
                <span>{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section container reveal">
        <div className="section-heading">
          <div>
            <span className="eyebrow">POSSIBILITIES, IN PICTURES</span>
            <h2>A little inspiration. A fresh perspective.</h2>
            <p>Spaces from the practices on UrDesigner.</p>
          </div>
          <Link to="/architects" className="text-link">
            Find a professional <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="masonry masonry--home">
          {providers
            .flatMap((p) => p.projects.slice(0, 2).map((project) => ({ p, project })))
            .slice(0, 6)
            .map(({ p, project }) => (
              <ProjectCard key={project.id} project={project} slug={p.slug} natural />
            ))}
        </div>
      </section>
      <section className="container reveal">
        <div className="professional-cta">
          <div>
            <span className="eyebrow">FOR ARCHITECTS & INTERIOR DESIGNERS</span>
            <h2>
              You shape spaces.
              <br />
              Let your work open doors.
            </h2>
            <p>
              A place for your practice, your portfolio and your next introduction. Create your
              profile for free.
            </p>
            <ButtonLink to="/join" variant="light">
              Join as a professional <ArrowUpRight size={18} />
            </ButtonLink>
          </div>
          <div className="cta-art" aria-hidden="true">
            <div className="arch arch-one" />
            <div className="arch arch-two" />
            <div className="arch arch-three" />
            <span>
              MAKE ROOM
              <br />
              FOR WHAT’S NEXT.
            </span>
          </div>
        </div>
      </section>
      <div className="privacy-note container">
        <LockKeyhole size={17} />
        <p>
          A conversation on your terms. Contact details are only shared when a proposal is accepted.
        </p>
      </div>
    </div>
  );
}
