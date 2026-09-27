import { NavLink, Outlet, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Brand } from './Brand';
import { useDemo } from '../hooks/useDemo';
import { Notice } from '../components/ui/Feedback';
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
  { to: '/admin/payments', label: 'Payment verification', Icon: CreditCard },
  { to: '/admin/enquiries', label: 'Enquiries & proposals', Icon: ClipboardList },
];
export function WorkspaceLayout({ admin = false }: { admin?: boolean }) {
  const { state, storageError } = useDemo();
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <span className="sidebar-label">{admin ? 'ADMIN WORKSPACE' : 'YOUR WORKSPACE'}</span>
        <nav aria-label={admin ? 'Admin navigation' : 'Professional navigation'}>
          {(admin ? adminLinks : proLinks).map(({ to, label, Icon, ...rest }) => (
            <NavLink key={to} to={to} end={'end' in rest && rest.end}>
              <Icon size={19} />
              {label}
              {label === 'Enquiries' && (
                <span className="nav-count">
                  {
                    state.enquiries.filter((e) => e.providerId === 'p1' && e.status === 'sent')
                      .length
                  }
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="small-symbol">✳</span>
            <h4>A little help goes a long way.</h4>
            <p>Explore every side of your frontend.</p>
            <Link to="/playground">
              Demo guide <ArrowUpRight size={16} />
            </Link>
          </div>
          <Link to="/architects" className="back-to-site">
            Back to discovery <ArrowUpRight size={16} />
          </Link>
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
            <span className="mini-avatar">{admin ? 'AD' : 'AM'}</span>
          </div>
        </header>
        <div className="demo-strip">
          <span className="demo-dot" />
          Frontend demo · Changes are saved in this browser. No real accounts or payments.
          <Link to="/playground">
            Switch view <ArrowUpRight size={13} />
          </Link>
        </div>
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
    </div>
  );
}
