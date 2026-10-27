import { useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserRound,
  Layers3,
  Images,
  Inbox,
  Coins,
  Gift,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Flag,
  LogOut,
  CircleUserRound,
} from 'lucide-react';
import { Brand } from './Brand';
import { AccountMenu } from './AccountMenu';
import { useDemo } from '../hooks/useDemo';
import { Notice, Toaster } from '../components/ui/Feedback';
import { ADMIN_EMAIL, IS_STAGING } from '../config/catalog';
const proLinks = [
  { to: '/dashboard', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/dashboard/profile', label: 'My profile', Icon: UserRound },
  { to: '/dashboard/services', label: 'Services & pricing', Icon: Layers3 },
  { to: '/dashboard/portfolio', label: 'Portfolio', Icon: Images },
  { to: '/dashboard/enquiries', label: 'Enquiries', Icon: Inbox },
  { to: '/dashboard/connects', label: 'Connects wallet', Icon: Coins },
  { to: '/dashboard/referrals', label: 'Refer a professional', Icon: Gift },
];
const adminLinks = [
  { to: '/admin', label: 'Professionals', Icon: ShieldCheck, end: true },
  { to: '/admin/reports', label: 'Reported profiles', Icon: Flag },
  { to: '/admin/payments', label: 'Payment verification', Icon: CreditCard },
  { to: '/admin/enquiries', label: 'Enquiries & proposals', Icon: ClipboardList },
];
export function WorkspaceLayout({ admin = false }: { admin?: boolean }) {
  const { state, storageError, ready, dispatch } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = useRef<HTMLElement>(null);
  // On phones the tabs scroll sideways: keep the current one in view.
  useEffect(() => {
    const active = nav.current?.querySelector<HTMLElement>('a.active');
    const strip = nav.current;
    if (active && strip && strip.scrollWidth > strip.clientWidth)
      strip.scrollLeft +=
        active.getBoundingClientRect().left -
        strip.getBoundingClientRect().left -
        (strip.clientWidth - active.offsetWidth) / 2;
  }, [location.pathname, ready]);
  // Neither workspace is open to anyone with the URL: wait for the saved session, then require
  // the matching login. The server always renders the empty shell, so nothing private leaks.
  if (!ready) return <div className="workspace-loading" aria-busy="true" />;
  if (admin ? !state.session.admin : !state.session.professional)
    return (
      <Navigate
        to={`${admin ? '/admin/login' : '/login'}?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  const own = state.providers.find((p) => p.id === state.ownId)!;
  const openReports = state.reports.length;
  const logout = () => {
    dispatch({ type: 'logout', role: admin ? 'admin' : 'professional' });
    navigate(admin ? '/admin/login' : '/');
  };
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <span className="sidebar-label">{admin ? 'ADMIN WORKSPACE' : 'YOUR WORKSPACE'}</span>
        <nav ref={nav} aria-label={admin ? 'Admin navigation' : 'Professional navigation'}>
          {(admin ? adminLinks : proLinks).map(({ to, label, Icon, ...rest }) => (
            <NavLink key={to} to={to} end={'end' in rest && rest.end}>
              <Icon size={19} />
              {label}
              {label === 'Enquiries' && (
                <span className="nav-count">
                  {
                    state.enquiries.filter(
                      (e) => e.providerId === state.ownId && e.status === 'sent',
                    ).length
                  }
                </span>
              )}
              {label === 'Reported profiles' && openReports > 0 && (
                <span className="nav-count">{openReports}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {IS_STAGING && (
            <div className="sidebar-help">
              <h4>A little help goes a long way.</h4>
              <p>Explore every side of your frontend.</p>
              <Link to="/playground">
                Demo guide <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
          <Link to="/architects" className="back-to-site">
            Back to discovery <ArrowUpRight size={16} />
          </Link>
          <button type="button" className="back-to-site" onClick={logout}>
            Log out <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <span>{admin ? 'Administration' : 'Welcome to your studio'}</span>
          <div>
            {!admin && (
              <Link className="balance-chip" to="/dashboard/connects">
                <Coins size={18} />
                <strong>{state.balance}</strong> connects
              </Link>
            )}
            <AccountMenu
              name={admin ? 'Administrator' : own.studio || own.name || 'Your practice'}
              detail={admin ? ADMIN_EMAIL : state.contacts[state.ownId]?.email}
              avatar={
                !admin && own.photo ? (
                  <img className="mini-avatar" src={own.photo} alt="" />
                ) : (
                  <span className="mini-avatar mini-avatar--icon">
                    <CircleUserRound size={20} />
                  </span>
                )
              }
            >
              {!admin && (
                <>
                  <Link role="menuitem" to="/dashboard/profile">
                    My profile
                  </Link>
                  {own.status === 'published' && (
                    <Link role="menuitem" to={`/p/${own.slug}`}>
                      View public profile
                    </Link>
                  )}
                  <Link role="menuitem" to="/dashboard/connects">
                    Connects wallet
                  </Link>
                </>
              )}
              <button role="menuitem" type="button" onClick={logout}>
                Log out
              </button>
            </AccountMenu>
          </div>
        </header>
        {IS_STAGING && (
          <div className="demo-strip">
            <span className="demo-dot" />
            Frontend demo · Changes are saved in this browser. No real accounts or payments.
            <Link to="/playground">
              Switch view <ArrowUpRight size={13} />
            </Link>
          </div>
        )}
        <main id="main" tabIndex={-1} className="workspace-content">
          {storageError && (
            <Notice tone="warning">
              Browser storage is unavailable or full. Changes work for this session, but may not
              survive a reload.
            </Notice>
          )}
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
