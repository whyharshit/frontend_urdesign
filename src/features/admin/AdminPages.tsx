import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Send, Flag, ArrowUpRight } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { hasContactDetails } from '../../lib/rules';
import { money, dateLabel } from '../../lib/format';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Avatar } from '../../components/professionals/ProfessionalCard';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Notice, StatusBadge, EmptyState } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminProfessionals() {
  const { state, dispatch } = useDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selection, setSelection] = useState<{
    id: string;
    status: 'unpublished' | 'suspended';
  } | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const providers = state.providers.filter(
    (p) =>
      (status === 'all' || p.status === status) &&
      `${p.name} ${p.studio} ${p.city}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="stack">
      <PageHeading
        eyebrow="A CONSIDERED COMMUNITY"
        title="Professionals & moderation"
        description="Profiles publish immediately when complete. Review concerns and act with context."
      />
      <Notice>
        Admin preview is open for frontend testing. Production admin access, audit records and
        permissions require the backend.
      </Notice>
      <div className="stats-grid">
        <StatCard
          label="Professionals"
          value={state.providers.length}
          detail="Sample community"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Published"
          value={state.providers.filter((p) => p.status === 'published').length}
          detail="Visible in discovery"
          icon={<ArrowUpRight size={18} />}
        />
        <StatCard
          label="Pending payments"
          value={state.payments.filter((p) => p.status === 'pending').length}
          detail="Awaiting verification"
          icon={<CreditCard size={18} />}
        />
        <StatCard
          label="Flagged proposals"
          value={state.proposals.filter((p) => p.flagged).length}
          detail="Contact-detail warnings"
          icon={<Flag size={18} />}
        />
      </div>
      <div className="form-grid">
        <Input
          label="Find a professional"
          placeholder="Name, studio or city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select label="Profile status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['all', 'published', 'draft', 'unpublished', 'suspended'].map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>
      {error && <Notice tone="warning">{error}</Notice>}
      <div className="panel">
        {providers.map((p) => (
          <div className="moderation-row" key={p.id}>
            <Avatar professional={p} />
            <div>
              <h3>{p.studio || p.name}</h3>
              <p>
                {p.name} · {p.city} · {p.type}
              </p>
              {hasContactDetails(p.bio) && (
                <p className="error-text">Bio contains possible contact details</p>
              )}
            </div>
            <StatusBadge status={p.status} />
            <div className="button-row">
              <ButtonLink variant="ghost" to={`/p/${p.slug}`}>
                View
              </ButtonLink>
              <Button
                variant="secondary"
                onClick={() => {
                  setReason('');
                  setSelection({ id: p.id, status: 'unpublished' });
                }}
              >
                {p.status === 'suspended' ? 'Reinstate as unpublished' : 'Unpublish'}
              </Button>
              {p.status !== 'suspended' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setReason('');
                    setSelection({ id: p.id, status: 'suspended' });
                  }}
                >
                  Suspend
                </Button>
              )}
            </div>
          </div>
        ))}
        {!providers.length && (
          <EmptyState
            title="No matching professionals"
            description="Try another name or status filter."
          />
        )}
      </div>
      <ConfirmDialog
        open={!!selection}
        confirmDisabled={!reason.trim()}
        title={
          selection?.status === 'suspended'
            ? 'Suspend this professional?'
            : 'Set this profile to unpublished?'
        }
        confirmLabel="Apply moderation action"
        onClose={() => setSelection(null)}
        onConfirm={() => {
          if (!reason.trim()) {
            setError('A moderation reason is required. Reopen the action and add a reason.');
            return;
          }
          if (selection)
            dispatch({
              type: 'moderate',
              providerId: selection.id,
              status: selection.status,
              reason,
              date: new Date().toISOString(),
            });
          setError('');
        }}
      >
        <div className="stack">
          <p>
            {selection?.status === 'suspended'
              ? 'Open enquiries become unavailable. Open proposals are closed and refunded in full. The unused balance stays frozen until reinstatement.'
              : 'The profile will be hidden from discovery. Existing enquiries and proposals are retained.'}
          </p>
          <Textarea
            label="Reason for this action"
            required
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}

export function AdminPayments() {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState<{ id: string; approve: boolean } | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const payments = state.payments.filter((p) => filter === 'all' || p.status === filter);
  return (
    <div className="stack">
      <PageHeading
        eyebrow="CONNECTS · MANUAL VERIFICATION"
        title="Payment verification"
        description="Check the transaction, then credit the exact pack. A submission is verified only once."
      />
      <Notice>
        Simulated payments only. In production, verify against the actual bank transaction before
        approving. A screenshot alone is not proof of receipt.
      </Notice>
      <div className="segmented" style={{ maxWidth: 480 }}>
        {['pending', 'verified', 'rejected', 'all'].map((s) => (
          <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {error && <Notice tone="warning">{error}</Notice>}
      {payments.length ? (
        payments.map((p) => (
          <article className="payment-review" key={p.id}>
            <div>
              <span className="eyebrow">
                {state.providers.find((pro) => pro.id === p.providerId)?.studio}
              </span>
              <h3>
                {p.pack} connects · {money(p.amount)}
              </h3>
              <p>
                Reference: <strong>{p.reference}</strong> · {dateLabel(p.date)}
              </p>
              {p.reason && <p>Reason: {p.reason}</p>}
              {p.status === 'pending' && (
                <div className="button-row">
                  <Button
                    onClick={() => {
                      setSelected({ id: p.id, approve: true });
                      setReason('');
                    }}
                  >
                    Verify & credit {p.pack} connects
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelected({ id: p.id, approve: false });
                      setReason('');
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
            <div>
              <StatusBadge status={p.status} />
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="The queue is clear."
          description="Simulated pack submissions appear here for verification."
          to="/dashboard/connects/buy"
          action="Explore a demo purchase"
        />
      )}
      <ConfirmDialog
        open={!!selected}
        confirmDisabled={!selected?.approve && !reason.trim()}
        title={selected?.approve ? 'Verify this payment?' : 'Reject this payment?'}
        confirmLabel={
          selected?.approve
            ? `Verify & credit ${state.payments.find((p) => p.id === selected.id)?.pack} connects`
            : 'Reject payment'
        }
        onClose={() => setSelected(null)}
        onConfirm={() => {
          if (!selected) return;
          if (!selected.approve && !reason.trim()) {
            setError('Please give a reason before rejecting a payment.');
            return;
          }
          dispatch({
            type: 'verifyPayment',
            id: selected.id,
            approve: selected.approve,
            reason,
            date: new Date().toISOString(),
          });
          setError('');
        }}
      >
        <div className="stack">
          <p>
            {selected?.approve
              ? 'This credits the selected pack exactly once and records a ledger entry in the browser demo.'
              : 'No connects will be credited. Give the professional a clear reason for rejection.'}
          </p>
          {!selected?.approve && (
            <Textarea
              label="Rejection reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}

export function AdminEnquiries() {
  const { state } = useDemo();
  const [query, setQuery] = useState('');
  const results = state.enquiries.filter((e) => {
    const r = state.requirements.find((r) => r.id === e.requirementId);
    return `${r?.title} ${r?.city} ${e.status}`.toLowerCase().includes(query.toLowerCase());
  });
  const accepted = state.enquiries.filter((e) => e.status === 'accepted').length;
  return (
    <div className="stack">
      <PageHeading
        eyebrow="SUPPORT & PLATFORM ACTIVITY"
        title="Enquiries & proposals"
        description="A read-only view of the sample introduction funnel."
      />
      <div className="stats-grid">
        <StatCard
          label="Enquiries"
          value={state.enquiries.length}
          detail="All sample enquiries"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Proposals"
          value={state.proposals.length}
          detail="Written responses"
          icon={<Send size={18} />}
        />
        <StatCard
          label="Accepted"
          value={accepted}
          detail="Introductions made"
          icon={<ArrowUpRight size={18} />}
        />
        <StatCard
          label="Acceptance ratio"
          value={`${state.proposals.length ? Math.round((100 * accepted) / state.proposals.length) : 0}%`}
          detail="Accepted / sent proposals"
          icon={<Flag size={18} />}
        />
      </div>
      <Input
        label="Find an enquiry"
        placeholder="Project, city or status"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="stack">
        {results.map((e) => {
          const r = state.requirements.find((r) => r.id === e.requirementId)!;
          const professional = state.providers.find((p) => p.id === e.providerId)!;
          const proposal = state.proposals.find((p) => p.enquiryId === e.id);
          return (
            <article key={e.id} className="panel stack-sm">
              <div className="panel-heading" style={{ marginBottom: 0 }}>
                <h2>{r.title}</h2>
                <StatusBadge status={e.status} />
              </div>
              <p className="small">
                {professional.studio || professional.name} · {r.city} · {dateLabel(e.sentAt)}
              </p>
              <details>
                <summary className="text-link" style={{ cursor: 'pointer' }}>
                  View requirement & proposal
                </summary>
                <div className="stack-sm" style={{ marginTop: 18 }}>
                  <p>{r.description}</p>
                  {hasContactDetails(r.description) && (
                    <Notice tone="warning">Requirement contains possible contact details.</Notice>
                  )}
                  {proposal ? (
                    <>
                      <h3>Proposal</h3>
                      <p>{proposal.scope}</p>
                      <ul>
                        {proposal.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      <p className="small">
                        Declared fee band {proposal.band} · {proposal.cost} connects ·{' '}
                        {proposal.timeline}
                      </p>
                      {proposal.flagged && (
                        <Notice tone="warning">
                          Contact details were detected when this proposal was sent.
                        </Notice>
                      )}
                    </>
                  ) : (
                    <p>No proposal sent yet.</p>
                  )}
                </div>
              </details>
            </article>
          );
        })}
        {!results.length && (
          <EmptyState
            title="No enquiries match that search."
            description="Try a different project name, city or status."
          />
        )}
      </div>
      <Link className="text-link" to="/admin">
        Back to moderation <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
