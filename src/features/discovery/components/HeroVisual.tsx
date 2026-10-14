import { useEffect, useState } from 'react';
import { MoveUpRight } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';

const spaces = [
  {
    image: 'living',
    alt: 'A warm, sunlit living room with natural materials and considered details',
  },
  {
    image: 'dining',
    alt: 'A calm neutral interior with thoughtful furniture and natural textures',
  },
  { image: 'house', alt: 'A contemporary home opening onto green outdoor space' },
];

/** Hero slideshow: advances by itself every few seconds, pauses on hover or focus. */
export function HeroVisual() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (paused || reduced) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % spaces.length), 5000);
    return () => clearTimeout(timer);
  }, [active, paused, reduced]);
  return (
    <div
      className="hero-visual"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-photo" aria-roledescription="carousel">
        {spaces.map((space, i) => (
          <img
            key={space.image}
            className={i === active ? 'is-active' : ''}
            src={`/images/${space.image}.jpg`}
            alt={i === active ? space.alt : ''}
            aria-hidden={i !== active}
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        ))}
        <div className="hero-photo-caption">
          <span>A little inspiration for your next chapter</span>
          <div className="hero-slide-nav" aria-label="Featured spaces">
            {spaces.map((space, i) => (
              <button
                key={space.image}
                aria-label={`Show featured space ${i + 1}`}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="floating-project">
        <div className="floating-project-icon">
          <MoveUpRight size={26} strokeWidth={1.3} />
        </div>
        <div>
          <span>THOUGHTFULLY DESIGNED</span>
          <strong>Spaces that feel like you.</strong>
        </div>
      </div>
      <span className="hero-side-note">GOOD DESIGN IS PERSONAL.</span>
    </div>
  );
}
