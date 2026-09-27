import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Check, Minus } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { INTRODUCTION_NOTICE } from '../../config/catalog';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar } from '../../components/professionals/ProfessionalCard';
import { StatusBadge, Notice, EmptyState } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ContactReveal } from '../../components/enquiries/ContactReveal';
import { RequirementSummary } from '../../components/enquiries/RequirementSummary';
import { DemoNotice } from '../../components/ui/DemoNotice';

export function ClientEnquiries() {
  const { state } = useDemo();
  return (
    <div className="container flow-page stack">
      <PageHeading
        eyebrow="YOUR IDEAS, TAKING SHAPE"
        title="My enquiries"
        description="Your projects. Their perspectives. A connection on your terms."
        action={
          <ButtonLink to="/architects" variant="secondary">
            Explore professionals <ArrowUpRight size={16} />
          </ButtonLink>
        }
      />
      <DemoNotice />
      {state.requirements.length ? (
        state.requirements.map((r) => {
          const enquiries = state.enquiries.filter((e) => e.requirementId === r.id);
          const count = state.proposals.filter((p) =>
            enquiries.some((e) => e.id === p.enquiryId),
          ).length;
          return (
            <section className="client-enquiry" key={r.id}>
              <div className="client-enquiry-header">
                <div>
                  <h2>{r.title}</h2>
                  <p>
                    {r.city} · {r.service} · {enquiries.length} of 5 professionals contacted
                  </p>
                </div>
                {count >= 2 && (
                  <ButtonLink variant="secondary" to={`/my-enquiries/compare/${r.id}`}>
                    Compare {count} proposals
                  </ButtonLink>
                )}
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
                      <p>{p.type}</p>
                    </div>
                    <StatusBadge status={e.status} />
                    {hasProposal ? (
                      <ButtonLink variant="secondary" to={`/my-enquiries/proposal/${e.id}`}>
                        {e.status === 'accepted' ? 'View introduction' : 'Read proposal'}{' '}
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
              {enquiries.length < 5 && (
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
    </div>
  );
}

export function ClientProposal() {
  const { enquiryId } = useParams();
  const { state, dispatch } = useDemo();
  const [decision, setDecision] = useState<'accepted' | 'declined_by_client' | null>(null);
  const enquiry = state.enquiries.find((e) => e.id === enquiryId);
  const proposal = state.proposals.find((p) => p.enquiryId === enquiryId);
  const professional = state.providers.find((p) => p.id === enquiry?.providerId);
  const requirement = state.requirements.find((r) => r.id === enquiry?.requirementId);
  if (!enquiry || !proposal || !professional || !requirement)
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
                <strong>{proposal.timeline}</strong>
              </div>
            </div>
            <Notice>{INTRODUCTION_NOTICE}</Notice>
            {enquiry.status === 'proposal_sent' && (
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
            {enquiry.status === 'unavailable' && (
              <Notice tone="warning">
                This professional is no longer available. Explore other professionals for your
                project.
              </Notice>
            )}
          </section>
          {enquiry.status === 'accepted' && <ContactReveal />}
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
        onConfirm={() =>
          decision &&
          dispatch({
            type: 'decide',
            enquiryId: enquiry.id,
            decision,
            date: new Date().toISOString(),
          })
        }
      >
        <p>
          {decision === 'accepted'
            ? 'Both sides’ contact details become available after acceptance. This is the start of a conversation, not a commitment to hire.'
            : 'The professional will see your decision and receive half their connects back. This proposal will be closed.'}
        </p>
      </ConfirmDialog>
    </div>
  );
}

export function CompareProposals() {
  const { requirementId } = useParams();
  const { state } = useDemo();
  const r = state.requirements.find((r) => r.id === requirementId);
  const enquiries = state.enquiries.filter((e) => e.requirementId === requirementId);
  const proposals = state.proposals.filter((p) => enquiries.some((e) => e.id === p.enquiryId));
  if (!r || proposals.length < 2)
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
