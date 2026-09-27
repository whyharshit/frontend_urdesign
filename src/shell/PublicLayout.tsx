import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, ArrowRight } from 'lucide-react';
import { Brand } from './Brand';
import { Button, ButtonLink } from '../components/ui/Button';
export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        Good spaces start with the right people.
        <Link to="/join">
          Build your professional profile <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={`main-nav ${menu ? 'is-open' : ''}`}
            aria-label="Main navigation"
            onClick={() => setMenu(false)}
          >
            <NavLink to="/architects">Find a professional</NavLink>
            <Link to="/#how-it-works">How it works</Link>
            <NavLink to="/my-enquiries">My enquiries</NavLink>
          </nav>
          <div className="header-actions">
            <Link to="/login" className="login-link">
              Log in
            </Link>
            <ButtonLink to="/join" variant="secondary">
              For professionals <ArrowUpRight size={16} />
            </ButtonLink>
            <Button
              variant="ghost"
              className="mobile-menu"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} key={location.pathname}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-top">
          <div>
            <Brand />
            <p>
              A thoughtful space to find
              <br />
              the people who shape yours.
            </p>
          </div>
          <div>
            <h4>Discover</h4>
            <Link to="/architects">Find a professional</Link>
            <Link to="/architects/ahmedabad">Professionals in Ahmedabad</Link>
            <Link to="/#how-it-works">How it works</Link>
          </div>
          <div>
            <h4>For professionals</h4>
            <Link to="/join">Join UrDesigner</Link>
            <Link to="/dashboard">Your workspace</Link>
            <Link to="/dashboard/connects">About connects</Link>
          </div>
          <div className="footer-note">
            <span className="eyebrow">A PLACE FOR GOOD DESIGN</span>
            <p>
              Your next chapter
              <br />
              starts with a conversation.
            </p>
            <Link to="/architects">
              Let’s find your professional <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 UrDesigner. Made for spaces. Built around people.</span>
          <div>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/playground">Explore frontend demo</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
