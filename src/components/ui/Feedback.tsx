import { CheckCircle2, Info, LockKeyhole, SearchX } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ButtonLink } from './Button';
export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'success' | 'warning';
}) {
  const Icon = tone === 'success' ? CheckCircle2 : Info;
  return (
    <div className={`notice notice--${tone}`} role="status">
      <Icon size={19} />
      <div>{children}</div>
    </div>
  );
}
export function MaskedContact() {
  return (
    <div className="masked">
      <LockKeyhole size={22} />
      <div>
        <strong>Contact details stay private</strong>
        <p>
          Name · hidden until accepted
          <br />
          Mobile · hidden until accepted
          <br />
          Email · hidden until accepted
        </p>
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  to,
  action,
}: {
  title: string;
  description: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX size={36} strokeWidth={1.3} />
      <h2>{title}</h2>
      <p>{description}</p>
      {to && <ButtonLink to={to}>{action || 'Find a professional'}</ButtonLink>}
    </div>
  );
}
const clientLabels: Record<string, string> = {
  sent: 'Sent',
  viewed: 'Viewed',
  proposal_sent: 'Proposal ready',
  accepted: 'Accepted',
  declined_by_provider: 'Unavailable',
  declined_by_client: 'Declined',
  withdrawn: 'Closed',
  unavailable: 'No longer available',
};
/** The professional sees their own actions: a proposal they sent is "Proposal sent". */
const proLabels: Record<string, string> = {
  sent: 'New',
  viewed: 'Awaiting reply',
  proposal_sent: 'Proposal sent',
  accepted: 'Accepted',
  declined_by_provider: 'You declined',
  declined_by_client: 'Declined',
  withdrawn: 'Closed by client',
  unavailable: 'No longer available',
};
const statusLabels: Record<string, string> = {
  published: 'Published',
  unpublished: 'Unpublished',
  suspended: 'Suspended',
  draft: 'Draft',
  pending: 'Pending review',
  verified: 'Verified',
  rejected: 'Rejected',
};
export function StatusBadge({
  status,
  side = 'client',
}: {
  status: string;
  side?: 'client' | 'professional';
}) {
  const label =
    (side === 'professional' ? proLabels : clientLabels)[status] || statusLabels[status];
  return <span className={`status status--${status}`}>{label || status}</span>;
}

/** Fire-and-forget confirmation ("Service saved"). Rendered by <Toaster /> in the app shell. */
export function toast(message: string) {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('urdesigner:toast', { detail: message }));
}
export function Toaster() {
  const [items, setItems] = useState<{ id: number; message: string }[]>([]);
  useEffect(() => {
    const show = (event: Event) => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, message: (event as CustomEvent<string>).detail }]);
      setTimeout(() => setItems((list) => list.filter((item) => item.id !== id)), 3200);
    };
    window.addEventListener('urdesigner:toast', show);
    return () => window.removeEventListener('urdesigner:toast', show);
  }, []);
  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((item) => (
        <div className="toast" key={item.id}>
          <CheckCircle2 size={17} />
          {item.message}
        </div>
      ))}
    </div>
  );
}
