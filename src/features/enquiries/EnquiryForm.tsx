import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight, Send } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { useLocalDraft } from '../../hooks/useLocalDraft';
import { Avatar } from '../../components/professionals/ProfessionalCard';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Checkbox, CityInput, Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, Notice, toast } from '../../components/ui/Feedback';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { OtpForm } from '../auth/OtpForm';
import {
  AREA_UNITS,
  BUDGETS,
  CONTACT_WARNING,
  IS_STAGING,
  PROJECT_TYPES,
} from '../../config/catalog';
import { canContact, hasContactDetails } from '../../lib/rules';
import {
  capitaliseWords,
  experienceLabel,
  joinMeasure,
  plural,
  slugify,
  splitMeasure,
  uid,
} from '../../lib/format';
import type { DemoState, Professional, Requirement } from '../../types/domain';

const NOT_SURE = 'Not sure yet';

export function EnquiryForm() {
  const { slug } = useParams();
  const { state, ready } = useDemo();
  const professional = state.providers.find((p) => p.slug === slug && p.status === 'published');
  if (!ready)
    return (
      <div className="container section">
        <Notice>Preparing your enquiry…</Notice>
      </div>
    );
  if (!professional)
    return (
      <div className="container section">
        <EmptyState
          title="This practice is currently unavailable."
          description="Find another professional for your project."
          to="/architects"
        />
      </div>
    );
  return <EnquiryFormContent key={slug} providerId={professional.id} />;
}

/** Two or three practices in the same city or offering the same service, not yet contacted. */
function similarProfessionals(state: DemoState, requirement: Requirement, exclude: string) {
  const contacted = new Set(
    state.enquiries.filter((e) => e.requirementId === requirement.id).map((e) => e.providerId),
  );
  return state.providers
    .filter((p) => p.status === 'published' && p.id !== exclude && !contacted.has(p.id))
    .map((p) => ({
      p,
      score:
        ([p.city, ...(p.workCities || [])].some((c) => slugify(c) === slugify(requirement.city))
          ? 2
          : 0) + (p.services.some((s) => s.category === requirement.service) ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ p }) => p);
}

function SentPage({
  requirementId,
  professional,
}: {
  requirementId: string;
  professional: Professional;
}) {
  const { state, dispatch } = useDemo();
  const requirement = state.requirements.find((r) => r.id === requirementId)!;
  const [suggested] = useState(() => similarProfessionals(state, requirement, professional.id));
  const contacted = state.enquiries.filter((e) => e.requirementId === requirementId);
  const left = 5 - contacted.length;
  return (
    <div className="container success-page">
      <div className="success-mark success-mark--animated">
        <Check size={28} />
      </div>
      <span className="eyebrow">THE START OF SOMETHING GOOD</span>
      <h1>Your idea is on its way.</h1>
      <p>
        {professional.studio || professional.name} can now review your project and send a written
        proposal. Your contact details stay private until you accept.
      </p>
      {IS_STAGING && (
        <Notice tone="success">
          Saved to this browser’s demo. You can continue the professional’s side of the journey in
          the workspace.
        </Notice>
      )}
      {suggested.length > 0 && (
        <section className="similar-pros">
          <h2>Get more perspectives</h2>
          <p className="small">
            Send the same enquiry to similar practices — no retyping. You can contact{' '}
            {plural(Math.max(0, left), 'more professional')}.
          </p>
          <div className="similar-list">
            {suggested.map((p) => {
              const sent = contacted.some((e) => e.providerId === p.id);
              const blocked = !sent && canContact(state, requirementId, p.id);
              return (
                <article className="similar-row" key={p.id}>
                  <Avatar professional={p} />
                  <div>
                    <Link to={`/p/${p.slug}`} className="text-link">
                      <h3>{p.studio || p.name}</h3>
                    </Link>
                    <p className="small">
                      {p.type} · {p.city} · {experienceLabel(p.years)}
                    </p>
                  </div>
                  {sent ? (
                    <span className="status status--accepted">Sent</span>
                  ) : (
                    <Button
                      variant="secondary"
                      disabled={!!blocked}
                      title={blocked || undefined}
                      onClick={() => {
                        dispatch({
                          type: 'contact',
                          requirement,
                          providerId: p.id,
                          id: uid(),
                          date: new Date().toISOString(),
                        });
                        toast(`Enquiry sent to ${p.studio || p.name}`);
                      }}
                    >
                      <Send size={15} /> Send this enquiry to them too
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
      <div className="button-row">
        <ButtonLink to="/my-enquiries">View my enquiries</ButtonLink>
        <ButtonLink variant="secondary" to={`/architects?requirement=${requirementId}`}>
          Find another professional <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </div>
  );
}

function EnquiryFormContent({ providerId }: { providerId: string }) {
  const { state, dispatch } = useDemo();
  const [params] = useSearchParams();
  const professional = state.providers.find((p) => p.id === providerId)!;
  const client = state.session.client;
  // A signed-in client can only reuse their own projects.
  const ownRequirements = client
    ? state.requirements.filter((r) => r.client?.phone === client.phone)
    : [];
  const [step, setStep] = useState(1);
  const [reuse, setReuse] = useState(
    ownRequirements.some((r) => r.id === params.get('requirement'))
      ? params.get('requirement')!
      : '',
  );
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const services = professional.services.map((s) => s.category);
  const [draft, setDraft, failed] = useLocalDraft('urdesigner.draft.requirement', {
    title: '',
    projectType: 'Residential',
    city: professional.city,
    service: services[0] || NOT_SURE,
    description: '',
    budget: '',
    timeline: '',
    size: '',
  });
  const [you, setYou] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
  });
  const size = splitMeasure(draft.size, AREA_UNITS, 'sq ft');
  const patch = (key: keyof typeof draft, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const existing = ownRequirements.find((r) => r.id === reuse && !r.closedAt);
  const blocked = existing ? canContact(state, existing.id, providerId) : null;
  // Drafts saved for another professional may name a service this one does not offer.
  const service = [...services, NOT_SURE].includes(draft.service)
    ? draft.service
    : services[0] || NOT_SURE;
  const send = (requirement: Requirement) => {
    const reason = canContact(state, requirement.id, providerId);
    if (reason) {
      setError(reason);
      return;
    }
    if (
      state.enquiries.filter((e) => Date.now() - Date.parse(e.sentAt) < 86_400_000).length >= 10
    ) {
      setError(
        'You’ve sent 10 enquiries in the last 24 hours. Please return later to send another.',
      );
      return;
    }
    dispatch({
      type: 'contact',
      requirement,
      providerId,
      id: uid(),
      date: new Date().toISOString(),
    });
    setSent(requirement.id);
    if (!existing) {
      try {
        localStorage.removeItem('urdesigner.draft.requirement');
      } catch {
        /* Nonessential cleanup. */
      }
    }
  };
  const sendNew = (contact: { name: string; email: string; phone: string }) =>
    send({
      ...draft,
      service,
      title: draft.title.trim(),
      description: draft.description.trim(),
      city: draft.city.trim(),
      id: uid(),
      createdAt: new Date().toISOString(),
      client: contact,
    });
  if (sent) return <SentPage requirementId={sent} professional={professional} />;
  const steps = client
    ? ['Your project', 'Review & send']
    : ['Your project', 'About you', 'Verify & send'];
  return (
    <div className="container flow-page">
      <div className="breadcrumbs">
        <Link to={`/p/${professional.slug}`}>{professional.studio || professional.name}</Link>
        <span>/</span>
        <span>Send enquiry</span>
      </div>
      <PageHeading
        eyebrow="EVERY GOOD SPACE STARTS WITH AN IDEA"
        title="Tell us what you have in mind."
        description="Write it once. After sending, you can share it with up to four more professionals."
      />
      <div className="flow-layout">
        <div className="stack">
          <DemoNotice />
          {failed && (
            <Notice tone="warning">
              Your draft cannot be saved in this browser. Keep this tab open until you finish.
            </Notice>
          )}
          {error && <Notice tone="warning">{error}</Notice>}
          {ownRequirements.some((r) => !r.closedAt) && step === 1 && (
            <Select
              label="Start a new project or reuse a requirement"
              value={reuse}
              onChange={(e) => {
                setReuse(e.target.value);
                setError('');
              }}
            >
              <option value="">A new project</option>
              {ownRequirements
                .filter((r) => !r.closedAt)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
            </Select>
          )}
          {existing ? (
            <div className="panel stack">
              <h2>{existing.title}</h2>
              <p>{existing.description}</p>
              <p className="small">
                {existing.city} · {existing.service}
              </p>
              <Notice>
                {plural(
                  state.enquiries.filter((e) => e.requirementId === existing.id).length,
                  'professional',
                )}{' '}
                of 5 contacted. Your original requirement is sent without retyping.
              </Notice>
              {blocked && <Notice tone="warning">{blocked}</Notice>}
              <Button disabled={!!blocked} onClick={() => send(existing)}>
                Send to {professional.studio || professional.name}
              </Button>
              <ButtonLink to="/my-enquiries" variant="ghost">
                View my enquiries
              </ButtonLink>
            </div>
          ) : (
            <div className="panel">
              <div
                className="flow-steps"
                style={
                  {
                    '--progress': `${((step - 1) / (steps.length - 1)) * 100}%`,
                  } as React.CSSProperties
                }
              >
                {steps.map((title, i) => (
                  <span
                    key={title}
                    className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}
                  >
                    <b>{step > i + 1 ? <Check size={12} /> : i + 1}</b>
                    {title}
                  </span>
                ))}
              </div>
              {step === 1 ? (
                <form
                  className="stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                  }}
                >
                  <Input
                    label="Give your project a name"
                    placeholder="A warm, welcoming family home"
                    minLength={3}
                    maxLength={100}
                    value={draft.title}
                    onChange={(e) => patch('title', e.target.value)}
                    required
                  />
                  <div className="form-grid">
                    <Select
                      label="Project type"
                      value={draft.projectType}
                      onChange={(e) => patch('projectType', e.target.value)}
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <CityInput
                      label="Project city"
                      value={draft.city}
                      required
                      onChange={(value) => patch('city', value)}
                    />
                  </div>
                  <Select
                    label="Service required"
                    value={service}
                    hint={`Services ${professional.studio || professional.name} offers.`}
                    onChange={(e) => patch('service', e.target.value)}
                  >
                    {services.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                    <option>{NOT_SURE}</option>
                  </Select>
                  <Textarea
                    label="What would you like to create?"
                    placeholder="Tell us about the space, how you use it, and what matters to you."
                    value={draft.description}
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={5}
                    hint={`${draft.description.trim().length}/1000 characters · At least 20 characters.`}
                    onChange={(e) => patch('description', e.target.value)}
                  />
                  {hasContactDetails(draft.description) && (
                    <Notice tone="warning">{CONTACT_WARNING}</Notice>
                  )}
                  <div className="form-grid">
                    <Select
                      label="Total project budget (optional)"
                      hint="What you expect to spend on construction or furnishing — not the design fee."
                      value={draft.budget}
                      onChange={(e) => patch('budget', e.target.value)}
                    >
                      <option value="">Open to discussion</option>
                      {BUDGETS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </Select>
                    <div className="measure-field">
                      <Input
                        label="Project size (optional)"
                        type="number"
                        min={1}
                        step="any"
                        inputMode="decimal"
                        placeholder="e.g. 1850"
                        value={size.amount}
                        onChange={(e) =>
                          patch(
                            'size',
                            e.target.value
                              ? joinMeasure(e.target.value, size.unit) || e.target.value
                              : '',
                          )
                        }
                      />
                      <Select
                        label="Unit"
                        value={size.unit}
                        onChange={(e) => patch('size', joinMeasure(size.amount, e.target.value))}
                      >
                        {AREA_UNITS.map((u) => (
                          <option key={u}>{u}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <Select
                    label="When would you like to start? (optional)"
                    value={draft.timeline}
                    onChange={(e) => patch('timeline', e.target.value)}
                  >
                    <option value="">I’m flexible</option>
                    {[
                      'As soon as possible',
                      'Within 1 month',
                      'Within 3 months',
                      'Within 6 months',
                      'Just exploring',
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                  <Button type="submit">
                    Continue <ArrowRight size={16} />
                  </Button>
                </form>
              ) : client ? (
                <div className="stack">
                  <h3>Sending as {client.name}</h3>
                  <p className="small">
                    {draft.title} · {draft.city} · {service}. Your contact details stay private
                    until you accept a proposal.
                  </p>
                  <Button onClick={() => sendNew(client)}>
                    <Send size={16} /> Send to {professional.studio || professional.name}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                    Back to project
                  </Button>
                </div>
              ) : step === 2 ? (
                <form
                  className="stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setYou((v) => ({ ...v, name: capitaliseWords(v.name.trim()) }));
                    setStep(3);
                  }}
                >
                  <h3>A first introduction starts with you.</h3>
                  <p className="small">
                    Your name, email and mobile remain private until you accept a proposal.
                  </p>
                  <Input
                    label="Your name"
                    minLength={2}
                    maxLength={80}
                    required
                    autoComplete="name"
                    value={you.name}
                    onChange={(e) => setYou({ ...you, name: e.target.value })}
                    onBlur={() => setYou((v) => ({ ...v, name: capitaliseWords(v.name) }))}
                  />
                  <Input
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    value={you.email}
                    onChange={(e) => setYou({ ...you, email: e.target.value })}
                  />
                  <Input
                    label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    required
                    hint="10-digit Indian mobile number"
                    value={you.phone}
                    onChange={(e) => setYou({ ...you, phone: e.target.value.replace(/\D/g, '') })}
                  />
                  <Checkbox required>
                    I agree to the <Link to="/terms">Terms</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>, and consent to account creation when
                    my mobile is verified.
                  </Checkbox>
                  <Button type="submit">Continue to verification</Button>
                  <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                    Back to project
                  </Button>
                </form>
              ) : (
                <OtpForm
                  phone={you.phone}
                  onBack={() => setStep(2)}
                  onVerified={() => {
                    dispatch({ type: 'login', role: 'client', client: you });
                    sendNew(you);
                  }}
                />
              )}
            </div>
          )}
        </div>
        <aside className="panel flow-sidebar">
          <span className="eyebrow">YOUR ENQUIRY IS FOR</span>
          <Avatar professional={professional} large />
          <h3>{professional.studio || professional.name}</h3>
          <p>
            {professional.type}
            <br />
            {professional.city} · {experienceLabel(professional.years)}
          </p>
          <hr className="divider" />
          <h3>On your terms.</h3>
          <p>
            There’s no cost to send an enquiry. Read their proposal first; choose to connect when it
            feels right.
          </p>
          <p style={{ marginTop: 18 }}>
            Both sides’ contact details are shared only after acceptance.
          </p>
        </aside>
      </div>
    </div>
  );
}
