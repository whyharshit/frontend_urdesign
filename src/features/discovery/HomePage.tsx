import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, Search, LockKeyhole, Check } from 'lucide-react';
import { CITIES } from '../../config/catalog';
import { useDemo } from '../../hooks/useDemo';
import { slugify } from '../../lib/format';
import { ProfessionalCard } from '../../components/professionals/ProfessionalCard';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button, ButtonLink } from '../../components/ui/Button';
import { HeroVisual } from './components/HeroVisual';
export function HomePage() {
  const [city, setCity] = useState('Ahmedabad');
  const navigate = useNavigate();
  const { state } = useDemo();
  const providers = state.providers.filter((p) => p.status === 'published');
  const featured = providers.slice(0, 3);
  return (
    <>
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
              navigate(`/architects/${slugify(city)}`);
            }}
          >
            <div>
              <MapPin size={20} />
              <label htmlFor="hero-city">
                <span>Where’s your project?</span>
                <select
                  id="hero-city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit">
              <Search size={18} />
              <span>Find a professional</span>
            </Button>
          </form>
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
          <div>
            <span>01</span> Discover the work
          </div>
          <div>
            <span>02</span> Find your people
          </div>
          <div>
            <span>03</span> Start a conversation
          </div>
          <span className="strip-star">✳</span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE PEOPLE BEHIND THE SPACES</span>
            <h2>Find a practice that feels right.</h2>
            <p>Independent minds. Distinct perspectives. A shared love for good design.</p>
          </div>
          <Link className="text-link" to="/architects">
            Explore professionals <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="studio-grid">
          {featured.map((p) => (
            <ProfessionalCard key={p.id} professional={p} compact />
          ))}
        </div>
        <p className="sample-caption">
          A preview of discovery · Sample professional profiles and portfolio imagery
        </p>
      </section>
      <section className="how-section" id="how-it-works">
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
              Let’s get started <ArrowRight size={17} />
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
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">POSSIBILITIES, IN PICTURES</span>
            <h2>A little inspiration. A fresh perspective.</h2>
            <p>Explore the spaces in our sample portfolios.</p>
          </div>
          <Link to="/architects" className="text-link">
            Meet their designers <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="project-grid">
          {providers
            .slice(0, 3)
            .map(
              (p, i) =>
                p.projects.length > 0 && (
                  <ProjectCard
                    key={p.id}
                    project={p.projects[i === 0 ? 1 : 0] || p.projects[0]}
                    slug={p.slug}
                  />
                ),
            )}
        </div>
      </section>
      <section className="container">
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
    </>
  );
}
