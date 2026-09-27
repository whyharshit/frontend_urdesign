import { CheckCircle2, Info, LockKeyhole, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
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
const statusLabels: Record<string, string> = {
  sent: 'New enquiry',
  viewed: 'Viewed',
  proposal_sent: 'Proposal ready',
  accepted: 'Accepted',
  declined_by_provider: 'Unavailable',
  declined_by_client: 'Declined',
  unavailable: 'No longer available',
  published: 'Published',
  unpublished: 'Unpublished',
  suspended: 'Suspended',
  draft: 'Draft',
  pending: 'Pending review',
  verified: 'Verified',
  rejected: 'Rejected',
};
export function StatusBadge({ status }: { status: string }) {
  return <span className={`status status--${status}`}>{statusLabels[status] || status}</span>;
}
