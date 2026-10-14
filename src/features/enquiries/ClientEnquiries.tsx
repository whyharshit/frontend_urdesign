import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Check, Minus, X } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { INTRODUCTION_NOTICE } from '../../config/catalog';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar, SaveButton } from '../../components/professionals/ProfessionalCard';
import { StatusBadge, Notice, EmptyState, toast } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ContactReveal } from '../../components/enquiries/ContactReveal';
import { RequirementSummary } from '../../components/enquiries/RequirementSummary';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { Input } from '../../components/ui/Field';
import { OtpForm } from '../auth/OtpForm';
import { dateLabel, experienceLabel, plural, servicePrice } from '../../lib/format';
import type { DemoState } from '../../types/domain';

const SAMPLE_CLIENT_PHONE = '9812345678';

/** Clients have no password: they come back by verifying the mobile they enquired with. */
function ClientSignIn() {
  const { state, dispatch } = useDemo();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  return (
    <div className="container flow-page">
      <div className="panel stack client-signin">
        <span className="eyebrow">MY ENQUIRIES</span>
        <h1>See your enquiries and proposals.</h1>
        <p>
          Enter the mobile number you used when you sent an enquiry. We’ll send a code — no password
          needed.
        </p>
        {step === 'phone' ? (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              setStep('otp');
            }}
          >
            <Input
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              required
              autoComplete="tel-national"
              value={phone}
              hint={`India (+91). Preview: ${SAMPLE_CLIENT_PHONE} opens the sample client’s enquiries.`}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
            <Button type="submit">Send code</Button>
          </form>
        ) : (
          <OtpForm
            phone={phone}
            onBack={() => setStep('phone')}
            onVerified={() => {
              const known = state.requirements.find((r) => r.client?.phone === phone)?.client;
              dispatch({
                type: 'login',
                role: 'client',
                client: known || { name: 'UrDesigner client', email: '', phone },
              });
              toast('You’re signed in');
            }}
          />
        )}
        <p className="small">
          Haven’t sent an enquiry yet?{' '}
          <Link className="text-link" to="/architects">
            Find a professional
          </Link>{' '}
          and tell them about your project.
        </p>
      </div>
    </div>
  );
}

function SavedList({ state }: { state: DemoState }) {
  const saved = state.providers.filter(
    (p) => state.saved.includes(p.id) && p.status === 'published',
  );
  if (!saved.length)
    return (
      <p className="small">
        Tap <strong>Save</strong> on a profile to keep it here and compare practices side by side.
      </p>
    );
  return (
    <div className="stack-sm">
      {saved.map((p) => (
        <div className="client-enquiry-row" key={p.id}>
          <Avatar professional={p} />
          <div>
            <h3>{p.studio || p.name}</h3>
            <p>
              {p.type} · {p.city}
            </p>
          </div>
          <SaveButton professional={p} compact />
          <Link className="text-link" to={`/p/${p.slug}`}>
            View profile
          </Link>
        </div>
      ))}
      {saved.length >= 2 && (
        <Link className="text-link" to="/my-enquiries/saved">
          Compare {saved.length} saved professionals <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function ClientEnquiries() {
  const { state, dispatch, ready } = useDemo();
  const [closing, setClosing] = useState<string | null>(null);
  if (!ready) return <div className="container section" aria-busy="true" />;
  const client = state.session.client;
  if (!client) return <ClientSignIn />;
  const requirements = state.requirements
    .filter((r) => r.client?.phone === client.phone)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const closingRequirement = requirements.find((r) => r.id === closing);
  return (
    <div className="container flow-page stack">
      <PageHeading
        eyebrow="YOUR IDEAS, TAKING SHAPE"
        title="My enquiries"
        description="Your projects. Their perspectives. A connection on your terms."
        action={
          <ButtonLink to="/architects" variant="secondary">
            Find a professional <ArrowUpRight size={16} />
          </ButtonLink>
        }
      />
      <DemoNotice />
      {requirements.length ? (
        requirements.map((r) => {
          const enquiries = state.enquiries.filter((e) => e.requirementId === r.id);
          const count = state.proposals.filter((p) =>
            enquiries.some((e) => e.id === p.enquiryId),
          ).length;
          const sentAt = enquiries.map((e) => e.sentAt).sort()[0] || r.createdAt;
          const decided = enquiries.some((e) => e.status === 'accepted');
          return (
            <section className={`client-enquiry ${r.closedAt ? 'is-closed' : ''}`} key={r.id}>
              <div className="client-enquiry-header">
                <div>
                  <h2>{r.title}</h2>
                  <p>
                    Sent {dateLabel(sentAt)} · {r.city} · {r.service} · {enquiries.length} of 5
                    professionals contacted
                  </p>
                </div>
                <div className="button-row">
                  {count >= 2 && !r.closedAt && (
                    <ButtonLink variant="secondary" to={`/my-enquiries/compare/${r.id}`}>
                      Compare {count} proposals
                    </ButtonLink>
                  )}
                  {r.closedAt ? (
                    <span className="status status--withdrawn">Closed {dateLabel(r.closedAt)}</span>
                  ) : (
                    !decided && (
                      <Button variant="ghost" onClick={() => setClosing(r.id)}>
                        <X size={15} /> Close this enquiry
                      </Button>
                    )
                  )}
                </div>
              </div>
              <p className="small" style={{ marginBottom: 20 }}>
                {r.description}
              </p>
              {enquiries.map((e) => {
                const p = state.providers.find((p) => p.id === e.providerId)!;
                const hasProposal = state.proposals.some((p) => p.enquiryId === e.id);
                return (
                  <div className="client-enquiry-row" key={e.id}>
                    <Avatar professional={p} />
                    <div>
                      <h3>{p.studio || p.name}</h3>
                      <p>
                        {p.type} · sent {dateLabel(e.sentAt)}
                      </p>
                    </div>
                    <StatusBadge status={e.status} />
                    {hasProposal ? (
                      <ButtonLink variant="secondary" to={`/my-enquiries/proposal/${e.id}`}>
                        {e.status === 'accepted' ? 'View contact details' : 'Read proposal'}{' '}
                        <ArrowUpRight size={14} />
                      </ButtonLink>
                    ) : (
                      <Link className="text-link" to={`/p/${p.slug}`}>
                        View profile
                      </Link>
                    )}
                  </div>
                );
              })}
              {enquiries.length < 5 && !r.closedAt && !decided && (
                <div style={{ paddingTop: 20 }}>
                  <Link className="text-link" to={`/architects?requirement=${r.id}`}>
                    Share this project with another professional <ArrowUpRight size={15} />
                  </Link>
                </div>
              )}
            </section>
          );
        })
      ) : (
        <EmptyState
          title="Your next space starts with an idea."
          description="Find a professional and tell them what you have in mind."
          to="/architects"
        />
      )}
      <section className="client-enquiry" id="saved">
        <div className="client-enquiry-header">
          <div>
            <h2>Saved professionals</h2>
            <p>Practices you’ve kept to compare later.</p>
          </div>
        </div>
        <SavedList state={state} />
      </section>
      <ConfirmDialog
        open={!!closing}
        title="Close this enquiry?"
        confirmLabel="Close enquiry"
        onClose={() => setClosing(null)}
        onConfirm={() => {
          if (!closing) return;
          dispatch({
            type: 'closeRequirement',
            requirementId: closing,
            date: new Date().toISOString(),
          });
          toast('Enquiry closed');
        }}
      >
        <p>
          {closingRequirement?.title}: professionals who haven’t heard back will see that you’ve
          closed it, and open proposals are withdrawn. You can’t reopen it, but you can always start
          a new one.
        </p>
      </ConfirmDialog>
    </div>
  );
}

export function SavedProfessionals() {
  const { state, ready } = useDemo();
  if (!ready) return <div className="container section" aria-busy="true" />;
  const saved = state.providers.filter(
    (p) => state.saved.includes(p.id) && p.status === 'published',
  );
  return (
    <div className="container flow-page stack">
      <PageHeading
        eyebrow="KEEP YOUR OPTIONS IN VIEW"
        title="Saved professionals"
        description="Compare practices side by side before you send an enquiry."
        action={
          state.session.client ? (
            <ButtonLink to="/my-enquiries" variant="secondary">
              My enquiries
            </ButtonLink>
          ) : undefined
        }
      />
      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          description="Tap Save on a profile or listing to keep it here."
          to="/architects"
        />
      ) : (
        <div className="panel table-wrap">
          <table className="compare-table">
            <caption className="sr-only">Compare saved professionals</caption>
            <thead>
              <tr>
                <th scope="col">Practice</th>
                {saved.map((p) => (
                  <th key={p.id} scope="col">
                    <Link className="text-link" to={`/p/${p.slug}`}>
                      {p.studio || p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Type', (p: (typeof saved)[number]) => p.type],
                [
                  'City',
                  (p: (typeof saved)[number]) => [p.city, ...(p.workCities || [])].join(', '),
                ],
                ['Experience', (p: (typeof saved)[number]) => experienceLabel(p.years, '')],
                [
                  'Projects shown',
                  (p: (typeof saved)[number]) => plural(p.projects.length, 'project'),
                ],
                [
                  'COA number',
                  (p: (typeof saved)[number]) => (p.coaNumber ? 'Provided' : 'Not provided'),
                ],
              ].map(([label, value]) => (
                <tr key={label as string}>
                  <td>{label as string}</td>
                  {saved.map((p) => (
                    <td key={p.id}>{(value as (p: (typeof saved)[number]) => string)(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td>Services</td>
                {saved.map((p) => (
                  <td key={p.id}>
                    <ul className="plain-list">
                      {p.services.map((s) => (
                        <li key={s.id}>
                          {s.category}
                          <br />
                          <small className="muted">{servicePrice(s)}</small>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Next step</td>
                {saved.map((p) => (
                  <td key={p.id}>
                    <div className="stack-sm">
                      <ButtonLink to={`/enquiry/${p.slug}`}>Send enquiry</ButtonLink>
                      <SaveButton professional={p} />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ClientProposal() {
  const { enquiryId } = useParams();
  const { state, dispatch, ready } = useDemo();
  const [decision, setDecision] = useState<'accepted' | 'declined_by_client' | null>(null);
  const enquiry = state.enquiries.find((e) => e.id === enquiryId);
  const proposal = state.proposals.find((p) => p.enquiryId === enquiryId);
  const professional = state.providers.find((p) => p.id === enquiry?.providerId);
  const requirement = state.requirements.find((r) => r.id === enquiry?.requirementId);
  if (!ready) return <div className="container section" aria-busy="true" />;
  if (!state.session.client) return <ClientSignIn />;
  if (
    !enquiry ||
    !proposal ||
    !professional ||
    !requirement ||
    requirement.client?.phone !== state.session.client.phone
  )
    return (
      <div className="container section">
        <EmptyState
          title="This proposal is unavailable."
          description="Find your received proposals in My enquiries."
          to="/my-enquiries"
          action="My enquiries"
        />
      </div>
    );
  const others = state.enquiries.filter(
    (e) =>
      e.requirementId === requirement.id && e.id !== enquiry.id && e.status === 'proposal_sent',
  ).length;
  const contact = state.contacts[professional.id];
  return (
    <div className="container flow-page stack">
      <div className="breadcrumbs">
        <Link to="/my-enquiries">My enquiries</Link>
        <span>/</span>
        <span>{requirement.title}</span>
      </div>
      <PageHeading
        eyebrow="A PERSPECTIVE FOR YOUR PROJECT"
        title={`A proposal from ${professional.studio || professional.name}.`}
        action={<StatusBadge status={enquiry.status} />}
      />
      <div className="flow-layout">
        <div className="stack">
          {enquiry.status === 'accepted' && (
            <ContactReveal
              role="professional"
              name={
                professional.studio
                  ? `${professional.name}, ${professional.studio}`
                  : professional.name
              }
              phone={contact?.phone}
              email={contact?.email}
              project={requirement.title}
            />
          )}
          <section className="panel stack">
            <h2>The approach</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{proposal.scope}</p>
            <hr className="divider" style={{ marginBlock: 5 }} />
            <h3>What’s included</h3>
            <ul className="checklist">
              {proposal.deliverables.map((line, i) => (
                <li key={i} className="meta">
                  <Check size={16} />
                  {line}
                </li>
              ))}
            </ul>
            <div className="proposal-summary">
              <div>
                <span>Indicative design fee</span>
                <strong>{proposal.fee || 'To be discussed'}</strong>
              </div>
              <div>
                <span>Expected timeline</span>
                <strong>
                  {/^\d+$/.test(proposal.timeline.trim())
                    ? `${proposal.timeline} weeks`
                    : proposal.timeline}
                </strong>
              </div>
            </div>
            <Notice>{INTRODUCTION_NOTICE}</Notice>
            {enquiry.status === 'proposal_sent' && !requirement.closedAt && (
              <div className="button-row">
                <Button onClick={() => setDecision('accepted')}>
                  Accept this proposal <ArrowUpRight size={16} />
                </Button>
                <Button variant="ghost" onClick={() => setDecision('declined_by_client')}>
                  Decline proposal
                </Button>
              </div>
            )}
            {enquiry.status === 'declined_by_client' && (
              <Notice>
                You declined this proposal. This decision is recorded; you can explore your other
                introductions.
              </Notice>
            )}
            {enquiry.status === 'withdrawn' && <Notice>You closed this enquiry.</Notice>}
            {enquiry.status === 'unavailable' && (
              <Notice tone="warning">
                This professional is no longer available. Explore other professionals for your
                project.
              </Notice>
            )}
          </section>
        </div>
        <aside className="panel">
          <RequirementSummary requirement={requirement} />
        </aside>
      </div>
      <ConfirmDialog
        open={!!decision}
        title={decision === 'accepted' ? 'Start a conversation?' : 'Decline this proposal?'}
        confirmLabel={decision === 'accepted' ? 'Accept & connect' : 'Decline proposal'}
        onClose={() => setDecision(null)}
        onConfirm={() => {
          if (!decision) return;
          dispatch({
            type: 'decide',
            enquiryId: enquiry.id,
            decision,
            date: new Date().toISOString(),
          });
          toast(
            decision === 'accepted'
              ? 'Proposal accepted — contact details are below'
              : 'Proposal declined',
          );
        }}
      >
        {decision === 'accepted' ? (
          <>
            <p>
              You’ll both see each other’s phone and email straight away. This is the start of a
              conversation, not a commitment to hire.
            </p>
            <p>
              <strong>Others who sent proposals will be told you’ve chosen someone.</strong>
              {others > 0 &&
                ` (${plural(others, 'other proposal')} on this project will be closed.)`}
            </p>
          </>
        ) : (
          <p>
            The professional will see your decision and receive half their connects back. This
            proposal will be closed.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}

export function CompareProposals() {
  const { requirementId } = useParams();
  const { state, ready } = useDemo();
  const r = state.requirements.find((r) => r.id === requirementId);
  const enquiries = state.enquiries.filter((e) => e.requirementId === requirementId);
  const proposals = state.proposals.filter((p) => enquiries.some((e) => e.id === p.enquiryId));
  if (!ready) return <div className="container section" aria-busy="true" />;
  if (!state.session.client) return <ClientSignIn />;
  if (!r || proposals.length < 2 || r.client?.phone !== state.session.client.phone)
    return (
      <div className="container section">
        <EmptyState
          title="A comparison needs two perspectives."
          description="Come back when at least two proposals have arrived for this project."
          to="/my-enquiries"
          action="My enquiries"
        />
      </div>
    );
  const deliverables = [...new Set(proposals.flatMap((p) => p.deliverables))];
  return (
    <div className="container flow-page stack">
      <PageHeading
        eyebrow="MAKE A CONSIDERED CHOICE"
        title="Different perspectives. Side by side."
        description={r.title}
        action={
          <ButtonLink variant="secondary" to="/my-enquiries">
            Back to enquiries
          </ButtonLink>
        }
      />
      <div className="panel table-wrap">
        <table className="compare-table">
          <caption className="sr-only">Compare proposals for {r.title}</caption>
          <thead>
            <tr>
              <th scope="col">Your project</th>
              {proposals.map((p) => {
                const e = enquiries.find((e) => e.id === p.enquiryId)!;
                const pro = state.providers.find((pro) => pro.id === e.providerId)!;
                return (
                  <th key={p.id} scope="col">
                    {pro.studio || pro.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Indicative fee</td>
              {proposals.map((p) => (
                <td key={p.id}>{p.fee || 'To be discussed'}</td>
              ))}
            </tr>
            <tr>
              <td>Timeline</td>
              {proposals.map((p) => (
                <td key={p.id}>{p.timeline}</td>
              ))}
            </tr>
            {deliverables.map((d) => (
              <tr key={d}>
                <td>{d}</td>
                {proposals.map((p) => (
                  <td key={p.id}>
                    {p.deliverables.includes(d) ? (
                      <>
                        <Check size={17} />
                        <span className="sr-only">Included</span>
                      </>
                    ) : (
                      <>
                        <Minus size={17} />
                        <span className="sr-only">Not listed</span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td>Approach</td>
              {proposals.map((p) => (
                <td key={p.id}>
                  <p>{p.scope}</p>
                </td>
              ))}
            </tr>
            <tr>
              <td>Next step</td>
              {proposals.map((p) => (
                <td key={p.id}>
                  <ButtonLink to={`/my-enquiries/proposal/${p.enquiryId}`} variant="secondary">
                    Review & decide
                  </ButtonLink>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Notice>{INTRODUCTION_NOTICE}</Notice>
    </div>
  );
}
