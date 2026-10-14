import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, X, ArrowRight, ChevronDown, Bookmark } from 'lucide-react';
import { Brand } from './Brand';
import { Button, ButtonLink } from '../components/ui/Button';
import { useDemo } from '../hooks/useDemo';
import { initialsOf } from '../lib/format';
import { IS_STAGING } from '../config/catalog';
import { toast, Toaster } from '../components/ui/Feedback';

/** Logged-in client: initials with a small menu (My enquiries, Saved, Log out). */
function AccountMenu() {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !ref.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const client = state.session.client!;
  return (
    <div className="account-menu" ref={ref}>
      <button
        type="button"
        className="account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${client.name}`}
        onClick={() => setOpen(!open)}
      >
        <span className="mini-avatar">{initialsOf(client.name)}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="account-popover" role="menu">
          <div className="account-name">
            <strong>{client.name}</strong>
            <span>{client.email}</span>
          </div>
          <Link role="menuitem" to="/my-enquiries">
            My enquiries
          </Link>
          <Link role="menuitem" to="/my-enquiries/saved">
            Saved professionals
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              dispatch({ type: 'logout', role: 'client' });
              toast('You’re logged out');
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const { state, ready } = useDemo();
  useEffect(() => setMenu(false), [location.pathname]);
  const client = ready ? state.session.client : null;
  const professional = ready && state.session.professional;
  const saved = ready ? state.saved.length : 0;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        Good spaces start with the right people.
        <Link to="/join">
          Join as a professional <ArrowUpRight size={13} />
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
            {client && (
              <NavLink to="/my-enquiries" end>
                My enquiries
              </NavLink>
            )}
            {!client && saved > 0 && (
              <NavLink to="/my-enquiries/saved">
                <Bookmark size={14} /> Saved ({saved})
              </NavLink>
            )}
          </nav>
          <div className="header-actions">
            {client ? (
              <AccountMenu />
            ) : professional ? (
              <ButtonLink to="/dashboard" variant="secondary">
                Your workspace <ArrowUpRight size={16} />
              </ButtonLink>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Professional log in
                </Link>
                <ButtonLink to="/join" variant="secondary">
                  Join as a professional <ArrowUpRight size={16} />
                </ButtonLink>
              </>
            )}
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
            <Link to="/join">Join as a professional</Link>
            <Link to="/login">Professional log in</Link>
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
              Find a professional <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 UrDesigner. Made for spaces. Built around people.</span>
          <div>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            {IS_STAGING && <Link to="/playground">Explore frontend demo</Link>}
          </div>
        </div>
      </footer>
      <Toaster />
    </>
  );
}
