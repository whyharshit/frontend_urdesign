import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { useLocalDraft } from '../../hooks/useLocalDraft';
import { Avatar } from '../../components/professionals/ProfessionalCard';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, Notice } from '../../components/ui/Feedback';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { OtpForm } from '../auth/OtpForm';
import { CITIES, PROJECT_TYPES, SERVICES, CONTACT_WARNING } from '../../config/catalog';
import { canContact, hasContactDetails } from '../../lib/rules';
import { uid } from '../../lib/format';
import type { Requirement } from '../../types/domain';

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

function EnquiryFormContent({ providerId }: { providerId: string }) {
  const { state, dispatch } = useDemo();
  const [params] = useSearchParams();
  const professional = state.providers.find((p) => p.id === providerId)!;
  const [step, setStep] = useState(1);
  const [reuse, setReuse] = useState(params.get('requirement') || '');
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const [draft, setDraft, failed] = useLocalDraft('urdesigner.draft.requirement', {
    title: '',
    projectType: 'Residential',
    city: professional.city,
    service: professional.services[0]?.category || SERVICES[0],
    description: '',
    budget: '',
    timeline: '',
    size: '',
  });
  const patch = (key: keyof typeof draft, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const existing = state.requirements.find((r) => r.id === reuse);
  const blocked = existing ? canContact(state, existing.id, providerId) : null;
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
  if (sent)
    return (
      <div className="container success-page">
        <div className="success-mark">
          <Check size={28} />
        </div>
        <span className="eyebrow">THE START OF SOMETHING GOOD</span>
        <h1>Your idea is on its way.</h1>
        <p>
          {professional.studio || professional.name} can now review your project and send a written
          proposal. Your contact details stay private until you accept.
        </p>
        <Notice tone="success">
          Saved to this browser’s demo. You can continue the professional’s side of the journey in
          the workspace.
        </Notice>
        <div className="button-row">
          <ButtonLink to="/my-enquiries">View my enquiries</ButtonLink>
          <ButtonLink variant="secondary" to={`/architects?requirement=${sent}`}>
            Find another professional <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </div>
    );
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
        description="Write it once. Share it with up to five professionals. Make room for possibilities."
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
          {state.requirements.length > 0 && step === 1 && (
            <Select
              label="Start a new project or reuse a requirement"
              value={reuse}
              onChange={(e) => {
                setReuse(e.target.value);
                setError('');
              }}
            >
              <option value="">A new project</option>
              {state.requirements.map((r) => (
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
                {state.enquiries.filter((e) => e.requirementId === existing.id).length} of 5
                professionals contacted. Your original requirement is sent without retyping.
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
              <div className="flow-steps">
                {['Your project', 'About you', 'Verify & send'].map((title, i) => (
                  <span key={title} className={step === i + 1 ? 'active' : ''}>
                    <b>{i + 1}</b>
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
                    <Select
                      label="Project city"
                      value={draft.city}
                      onChange={(e) => patch('city', e.target.value)}
                    >
                      {CITIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <Select
                    label="Service required"
                    value={draft.service}
                    onChange={(e) => patch('service', e.target.value)}
                  >
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                  <Textarea
                    label="What would you like to create?"
                    placeholder="Tell us about the space, how you use it, and what matters to you."
                    value={draft.description}
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={5}
                    hint={`${draft.description.length}/1000 characters · At least 20 characters.`}
                    onChange={(e) => patch('description', e.target.value)}
                  />
                  {hasContactDetails(draft.description) && (
                    <Notice tone="warning">{CONTACT_WARNING}</Notice>
                  )}
                  <div className="form-grid">
                    <Select
                      label="Project budget (optional)"
                      value={draft.budget}
                      onChange={(e) => patch('budget', e.target.value)}
                    >
                      <option value="">Open to discussion</option>
                      {[
                        'Under ₹5 lakh',
                        '₹5–10 lakh',
                        '₹10–20 lakh',
                        '₹20–50 lakh',
                        'Over ₹50 lakh',
                      ].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </Select>
                    <Input
                      label="Project size (optional)"
                      maxLength={40}
                      placeholder="e.g. 1,850 sq ft"
                      value={draft.size}
                      onChange={(e) => patch('size', e.target.value)}
                    />
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
              ) : step === 2 ? (
                <form
                  className="stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(3);
                  }}
                >
                  <h3>A first introduction starts with you.</h3>
                  <p className="small">
                    Your name, email and mobile remain private until you accept a proposal. Use
                    sample details in this preview.
                  </p>
                  <Input
                    label="Your name"
                    minLength={2}
                    maxLength={80}
                    required
                    autoComplete="name"
                  />
                  <Input label="Email" type="email" required autoComplete="email" />
                  <Input
                    label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    required
                    hint="10-digit Indian mobile number"
                  />
                  <label className="checkbox">
                    <input type="checkbox" required />
                    <span>
                      I agree to the <Link to="/terms">Terms</Link> and{' '}
                      <Link to="/privacy">Privacy Policy</Link>, and consent to account creation
                      when my mobile is verified.
                    </span>
                  </label>
                  <Button type="submit">Continue to verification</Button>
                  <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                    Back to project
                  </Button>
                </form>
              ) : (
                <OtpForm
                  onBack={() => setStep(2)}
                  onVerified={() =>
                    send({ ...draft, id: uid(), createdAt: new Date().toISOString() })
                  }
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
            {professional.city} · {professional.years} years experience
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
