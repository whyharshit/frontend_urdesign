import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowUp, ArrowDown, Trash2, Plus, Send } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { useLocalDraft } from '../../hooks/useLocalDraft';
import { OWN_PROVIDER_ID, CONTACT_WARNING, TIMELINE_UNITS } from '../../config/catalog';
import { DELIVERABLES } from '../../config/deliverables';
import { bandForFee, hasContactDetails } from '../../lib/rules';
import { uid, dateLabel, money, plural, joinMeasure } from '../../lib/format';
import { newestFirst } from './DashboardPage';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import {
  Notice,
  EmptyState,
  MaskedContact,
  StatusBadge,
  toast,
} from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RequirementSummary } from '../../components/enquiries/RequirementSummary';
import { ContactReveal } from '../../components/enquiries/ContactReveal';
import { PackList } from '../connects/ConnectsPages';

export function EnquiriesPage() {
  const { state } = useDemo();
  const [filter, setFilter] = useState('all');
  const enquiries = state.enquiries
    .filter(
      (e) =>
        e.providerId === OWN_PROVIDER_ID &&
        (filter === 'all' ||
          (filter === 'new'
            ? ['sent', 'viewed'].includes(e.status)
            : filter === 'declined'
              ? ['declined_by_client', 'declined_by_provider', 'withdrawn'].includes(e.status)
              : e.status === filter)),
    )
    .sort(newestFirst);
  return (
    <>
      <PageHeading
        eyebrow="POSSIBILITIES IN YOUR INBOX"
        title="Your next chapter starts here."
        description="Read the idea. Consider the fit. Choose the projects you’d love to shape."
      />
      <div className="segmented" style={{ maxWidth: 640, marginBottom: 27 }}>
        {[
          ['all', 'All enquiries'],
          ['new', 'Awaiting reply'],
          ['proposal_sent', 'Proposal sent'],
          ['accepted', 'Accepted'],
          ['declined', 'Declined'],
        ].map(([value, label]) => (
          <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>
      {enquiries.length ? (
        <div className="panel">
          {enquiries.map((e) => {
            const r = state.requirements.find((r) => r.id === e.requirementId)!;
            return (
              <Link className="enquiry-list-row" to={`/dashboard/enquiries/${e.id}`} key={e.id}>
                <div>
                  <h3>{r.title}</h3>
                  <p>
                    {r.service} · {r.city} · {dateLabel(e.sentAt)}
                  </p>
                </div>
                <div className="row-end">
                  <StatusBadge status={e.status} side="professional" />
                  <ArrowUpRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="A little quiet, for now."
          description="New enquiries will appear here. Keep your profile and portfolio ready for the right introduction."
          to="/dashboard/publish"
          action="Review your profile"
        />
      )}
    </>
  );
}

export function EnquiryDetail() {
  const { enquiryId } = useParams();
  const { state, dispatch, ready } = useDemo();
  const [decline, setDecline] = useState(false);
  const enquiry = state.enquiries.find(
    (e) => e.id === enquiryId && e.providerId === OWN_PROVIDER_ID,
  );
  const requirement = state.requirements.find((r) => r.id === enquiry?.requirementId);
  const proposal = state.proposals.find((p) => p.enquiryId === enquiryId);
  useEffect(() => {
    if (ready && enquiry?.status === 'sent') dispatch({ type: 'view', enquiryId: enquiry.id });
  }, [ready, enquiry?.id, enquiry?.status, dispatch]);
  if (!enquiry || !requirement)
    return (
      <EmptyState
        title="Enquiry unavailable"
        description="Open an enquiry from your inbox."
        to="/dashboard/enquiries"
        action="Back to enquiries"
      />
    );
  const canReply =
    ['sent', 'viewed'].includes(enquiry.status) &&
    state.providers.find((p) => p.id === OWN_PROVIDER_ID)?.status !== 'suspended';
  return (
    <div className="stack">
      <PageHeading
        eyebrow="AN IDEA WORTH CONSIDERING"
        title="A new possibility."
        action={
          <ButtonLink to="/dashboard/enquiries" variant="secondary">
            Back to enquiries
          </ButtonLink>
        }
      />
      <StatusBadge status={enquiry.status} side="professional" />
      <div className="enquiry-detail-grid">
        <div className="stack">
          <div className="panel">
            <RequirementSummary requirement={requirement} />
          </div>
          {proposal && (
            <div className="panel stack">
              <h2>Your proposal</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{proposal.scope}</p>
              <ul>
                {proposal.deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
              <dl className="detail-grid">
                <div>
                  <dt>Indicative fee</dt>
                  <dd>{proposal.fee || 'To be discussed'}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{proposal.timeline}</dd>
                </div>
              </dl>
              <Notice>
                {proposal.cost} connects spent.{' '}
                {enquiry.status === 'proposal_sent'
                  ? 'The client is reviewing your proposal.'
                  : enquiry.status === 'declined_by_client'
                    ? 'The client chose another direction; half your connects were returned.'
                    : enquiry.status === 'withdrawn'
                      ? 'The client closed this enquiry; your connects were returned.'
                      : ''}
              </Notice>
            </div>
          )}
          {canReply && (
            <div className="button-row">
              <ButtonLink to={`/dashboard/enquiries/${enquiry.id}/proposal`}>
                Write a proposal <ArrowUpRight size={16} />
              </ButtonLink>
              <Button variant="ghost" onClick={() => setDecline(true)}>
                Not available for this
              </Button>
            </div>
          )}
        </div>
        <aside className="stack">
          <div className="panel">
            <span className="eyebrow">BEFORE YOU DECIDE</span>
            <h3>
              {plural(
                state.enquiries.filter((e) => e.requirementId === requirement.id).length,
                'professional',
              )}{' '}
              contacted
            </h3>
            <p className="small" style={{ marginTop: 14 }}>
              This is the current number of professionals who received this requirement. Proposals
              are private.
            </p>
          </div>
          {enquiry.status === 'accepted' ? (
            <ContactReveal
              role="client"
              name={requirement.client?.name || 'Your client'}
              phone={requirement.client?.phone}
              email={requirement.client?.email}
              project={requirement.title}
            />
          ) : (
            <MaskedContact />
          )}
        </aside>
      </div>
      <ConfirmDialog
        open={decline}
        title="Not the right fit this time?"
        confirmLabel="Decline enquiry"
        onClose={() => setDecline(false)}
        onConfirm={() => {
          dispatch({
            type: 'decide',
            enquiryId: enquiry.id,
            decision: 'declined_by_provider',
            date: new Date().toISOString(),
          });
          toast('Enquiry declined');
        }}
      >
        <p>
          No connects are charged. The client will see that you are unavailable for this project.
        </p>
      </ConfirmDialog>
    </div>
  );
}

export function ProposalEditor() {
  const { enquiryId } = useParams();
  const { state, ready } = useDemo();
  const enquiry = state.enquiries.find(
    (e) => e.id === enquiryId && e.providerId === OWN_PROVIDER_ID,
  );
  if (!ready) return <Notice>Loading your proposal draft…</Notice>;
  if (
    !enquiry ||
    !['sent', 'viewed'].includes(enquiry.status) ||
    state.providers.find((p) => p.id === OWN_PROVIDER_ID)?.status === 'suspended'
  )
    return (
      <EmptyState
        title="This enquiry isn’t open for a proposal."
        description="Sent proposals are final, and closed enquiries can’t receive a new proposal."
        to="/dashboard/enquiries"
        action="Back to enquiries"
      />
    );
  return <ProposalForm key={enquiryId} enquiryId={enquiry.id} />;
}

function ProposalForm({ enquiryId }: { enquiryId: string }) {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const enquiry = state.enquiries.find((e) => e.id === enquiryId)!;
  const requirement = state.requirements.find((r) => r.id === enquiry.requirementId)!;
  const key = `urdesigner.draft.proposal.v2.${enquiryId}`;
  const [draft, setDraft, failed] = useLocalDraft(key, {
    scope: '',
    deliverables: [...(DELIVERABLES[requirement.service] || [])],
    timelineAmount: '',
    timelineUnit: 'weeks' as string,
    fee: '',
  });
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const fee = Math.round(Number(draft.fee) || 0);
  // The connect cost follows the design fee you quote; there is no band to pick by hand.
  const band = bandForFee(fee);
  const shortfall = Math.max(0, band.cost - state.balance);
  const timeline = joinMeasure(draft.timelineAmount, draft.timelineUnit);
  const flagged = hasContactDetails([draft.scope, ...draft.deliverables].join(' '));
  const move = (index: number, next: number) => {
    const list = [...draft.deliverables];
    const [line] = list.splice(index, 1);
    list.splice(next, 0, line);
    setDraft({ ...draft, deliverables: list });
  };
  return (
    <>
      <PageHeading
        eyebrow="A THOUGHTFUL RESPONSE GOES A LONG WAY"
        title="Write your proposal."
        description={requirement.title}
        action={
          <ButtonLink variant="secondary" to={`/dashboard/enquiries/${enquiryId}`}>
            Back to enquiry
          </ButtonLink>
        }
      />
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.deliverables.length || draft.deliverables.some((d) => !d.trim())) {
            setError('Include at least one deliverable. Each line needs a description.');
            return;
          }
          setError('');
          setConfirm(true);
        }}
      >
        {failed && (
          <Notice tone="warning">
            Draft storage is unavailable. Keep this page open until you send.
          </Notice>
        )}
        <Notice>
          {state.enquiries.filter((e) => e.requirementId === requirement.id).length} professionals
          have received this requirement. Your proposal is private to this client.
        </Notice>
        <section className="panel stack">
          <h2>How would you approach it?</h2>
          <Textarea
            label="Your approach & scope"
            rows={6}
            value={draft.scope}
            required
            minLength={30}
            maxLength={2000}
            placeholder="Share your understanding of the project and how you would bring it to life."
            hint={`${draft.scope.length}/2000 characters · At least 30 characters.`}
            onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
          />
          <div>
            <h3>What’s included</h3>
            <p className="small" style={{ margin: '8px 0 17px' }}>
              Suggestions for {requirement.service}. Edit, reorder or replace them with your own
              deliverables.
            </p>
            <div className="stack-sm">
              {draft.deliverables.map((line, i) => (
                <div className="deliverable-row" key={i}>
                  <Input
                    label={`Deliverable ${i + 1}`}
                    required
                    maxLength={120}
                    value={line}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        deliverables: draft.deliverables.map((d, index) =>
                          index === i ? e.target.value : d,
                        ),
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label={`Move deliverable ${i + 1} up`}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  >
                    <ArrowUp size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label={`Move deliverable ${i + 1} down`}
                    disabled={i === draft.deliverables.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    <ArrowDown size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label={`Remove deliverable ${i + 1}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        deliverables: draft.deliverables.filter((_, index) => i !== index),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              style={{ marginTop: 14 }}
              variant="secondary"
              type="button"
              disabled={draft.deliverables.length >= 15}
              onClick={() => setDraft({ ...draft, deliverables: [...draft.deliverables, ''] })}
            >
              <Plus size={15} />
              Add a deliverable
            </Button>
            <p className="small" style={{ marginTop: 9 }}>
              {draft.deliverables.length}/15 deliverables
            </p>
          </div>
          <div className="form-grid">
            <div className="measure-field">
              <Input
                label="Expected timeline"
                type="number"
                min={1}
                max={365}
                step={1}
                inputMode="numeric"
                placeholder="e.g. 8"
                value={draft.timelineAmount}
                required
                onChange={(e) => setDraft({ ...draft, timelineAmount: e.target.value })}
              />
              <Select
                label="Timeline unit"
                value={draft.timelineUnit}
                onChange={(e) => setDraft({ ...draft, timelineUnit: e.target.value })}
              >
                {TIMELINE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label="Indicative design fee (₹)"
              type="number"
              min={1000}
              step={500}
              inputMode="numeric"
              placeholder="e.g. 65000"
              value={draft.fee}
              required
              hint={
                fee
                  ? `Shown to the client as ${money(fee)}.`
                  : 'Your own design fee, not the client’s project budget.'
              }
              onChange={(e) => setDraft({ ...draft, fee: e.target.value })}
            />
          </div>
          {flagged && <Notice tone="warning">{CONTACT_WARNING} You may still submit.</Notice>}
        </section>
        <section className="panel stack">
          <h2>Your proposal cost, upfront.</h2>
          <p className="small">
            {fee
              ? `A ${money(fee)} design fee is band ${band.id} (${band.label}). Bands are set from your fee and never shown to clients.`
              : 'Enter your design fee above — the connect cost is set from it automatically.'}
          </p>
          <div className="proposal-summary">
            <div>
              <span>Cost to send</span>
              <strong>{band.cost} connects</strong>
            </div>
            <div>
              <span>Illustration at ₹1/connect</span>
              <strong>{money(band.cost)}</strong>
            </div>
            <div>
              <span>Current balance</span>
              <strong>{state.balance}</strong>
            </div>
          </div>
          <p className="small">
            The rupee illustration uses ₹1 per connect; your purchase rate depends on the pack. If
            the client declines, <strong>{Math.ceil(band.cost / 2)} connects</strong> return. If
            they never reply by the validity date, all <strong>{band.cost}</strong> return.
            Automated expiry needs the backend.
          </p>
          {shortfall > 0 && (
            <>
              <div className="shortfall-grid">
                <div>
                  <span>Proposal costs</span>
                  <strong>{band.cost}</strong>
                </div>
                <div>
                  <span>You have</span>
                  <strong>{state.balance}</strong>
                </div>
                <div>
                  <span>You need</span>
                  <strong>{shortfall} more</strong>
                </div>
              </div>
              <p className="small">
                Choose from the fixed packs below. You can combine packs. Your draft is saved while
                you top up.
              </p>
              <PackList
                shortfall={shortfall}
                returnTo={`/dashboard/enquiries/${enquiryId}/proposal`}
              />
            </>
          )}
          {error && <Notice tone="warning">{error}</Notice>}
          <p className="small">
            Review carefully. Once sent, this proposal cannot be edited, withdrawn or re-sent.
          </p>
          <Button type="submit" disabled={shortfall > 0 && fee > 0}>
            <Send size={16} />
            Send · {band.cost} connects
          </Button>
        </section>
      </form>
      <ConfirmDialog
        open={confirm}
        title="Ready to make an introduction?"
        confirmLabel={`Send · ${band.cost} connects`}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          if (state.balance < band.cost) {
            setError('Your balance changed. Review the available packs before sending.');
            return;
          }
          dispatch({
            type: 'proposal',
            proposal: {
              id: uid(),
              enquiryId,
              scope: draft.scope.trim(),
              deliverables: draft.deliverables.map((d) => d.trim()),
              band: band.id,
              timeline,
              fee: money(fee),
              cost: band.cost,
              flagged,
            },
            date: new Date().toISOString(),
          });
          toast('Proposal sent');
          try {
            localStorage.removeItem(key);
          } catch {
            /* No effect on the send. */
          }
          navigate(`/dashboard/enquiries/${enquiryId}`);
        }}
      >
        <p>
          <strong>{band.cost} connects</strong> will be deducted; your remaining balance will be{' '}
          <strong>{state.balance - band.cost}</strong>.
        </p>
        <p>
          {Math.ceil(band.cost / 2)} connects return if the client declines. A sent proposal cannot
          be edited or withdrawn.
        </p>
      </ConfirmDialog>
    </>
  );
}
