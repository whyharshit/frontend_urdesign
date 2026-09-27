import { useState } from 'react';
import { MoveUpRight } from 'lucide-react';

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

export function HeroVisual() {
  const [active, setActive] = useState(0);
  return (
    <div className="hero-visual">
      <div className="hero-photo">
        <img
          src={`/images/${spaces[active].image}.jpg`}
          alt={spaces[active].alt}
          fetchPriority="high"
        />
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
