import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Compass, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, Notice } from '../../components/ui/Feedback';
import { useDemo } from '../../hooks/useDemo';
import { createSeedState } from '../../data/seed';

export function NotFoundPage() {
  return (
    <div className="container section">
      <EmptyState
        title="A little off the plan."
        description="We couldn’t find that page. Let’s help you find the right people instead."
        to="/architects"
        action="Explore professionals"
      />
    </div>
  );
}

export function DemoPage() {
  const { dispatch } = useDemo();
  const [reset, setReset] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="container section stack">
      <PageHeading
        eyebrow="URDESIGNER · FRONTEND PREVIEW"
        title="One platform. Three perspectives."
        description="Explore the connected client, professional and admin journeys with sample data."
      />
      <Notice>
        All changes stay in this browser. Authentication, SMS, real payments, private contacts and
        email need the independent backend.
      </Notice>
      <div className="demo-cards">
        {[
          {
            Icon: Compass,
            title: 'Find your professional',
            body: 'Explore portfolios, send an enquiry, then read and accept a proposal from My enquiries.',
            to: '/architects',
            label: 'Explore discovery',
          },
          {
            Icon: LayoutDashboard,
            title: 'Build your practice',
            body: 'Edit Aangan Studio, manage services and projects, reply to enquiries and explore connects.',
            to: '/dashboard',
            label: 'Open workspace',
          },
          {
            Icon: ShieldCheck,
            title: 'Keep things running',
            body: 'Review sample professionals, verify simulated pack purchases and inspect enquiries.',
            to: '/admin',
            label: 'Open admin preview',
          },
        ].map(({ Icon, title, body, to, label }) => (
          <article className="panel" key={to}>
            <Icon size={28} />
            <h2>{title}</h2>
            <p>{body}</p>
            <ButtonLink to={to}>{label}</ButtonLink>
          </article>
        ))}
      </div>
      <div className="panel stack-sm">
        <h2>Try a complete introduction.</h2>
        <p>
          Open the workspace’s first enquiry, write a band-B proposal (150 connects), and send it.
          Switch to{' '}
          <Link className="text-link" to="/my-enquiries">
            My enquiries
          </Link>{' '}
          to accept or decline. For a band-C proposal, create a simulated pack purchase and verify
          it in the admin preview first.
        </p>
        <p className="small">
          Demo OTP: <strong>123456</strong>. Real phone numbers, passwords and payment details are
          unnecessary.
        </p>
        <div className="button-row">
          <Button variant="secondary" onClick={() => setReset(true)}>
            Reset demo data
          </Button>
          {done && (
            <span className="saved-note" role="status">
              Sample data restored.
            </span>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={reset}
        title="Start with a fresh canvas?"
        confirmLabel="Reset demo"
        onClose={() => setReset(false)}
        onConfirm={() => {
          dispatch({ type: 'hydrate', state: createSeedState() });
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith('urdesigner.draft.')) localStorage.removeItem(key);
          }
          setDone(true);
        }}
      >
        <p>This clears your demo edits, enquiries and payment simulations in this browser.</p>
      </ConfirmDialog>
    </div>
  );
}

export function LegalPage({ privacy = false }: { privacy?: boolean }) {
  return (
    <div className="container section prose">
      <span className="eyebrow">URDESIGNER</span>
      <h1>{privacy ? 'Privacy policy' : 'Terms of service'}</h1>
      <div style={{ marginTop: 25 }}>
        <Notice tone="warning">
          Frontend placeholder. Founder-approved legal copy and company contact details must replace
          this page before launch.
        </Notice>
      </div>
      <h2>{privacy ? 'Your contact details, on your terms.' : 'A thoughtful introduction.'}</h2>
      <p>
        {privacy
          ? 'The intended product shares client and professional contact details only after a proposal is accepted. Public profiles describe the work, services and experience of a professional.'
          : 'UrDesigner introduces clients to architects and interior designers. Acceptance of a proposal is an introduction; the parties discuss and agree the actual engagement directly.'}
      </p>
      <h2>{privacy ? 'What this preview stores' : 'About this preview'}</h2>
      <p>
        This frontend uses sample profiles and browser storage for your edits, enquiries, proposals
        and simulated payments. It does not create real accounts, verify identities, send messages
        or take money. Use sample details throughout.
      </p>
      <h2>{privacy ? 'Clear your sample data' : 'Your next step'}</h2>
      <p>
        You can reset browser demo data from the{' '}
        <Link className="text-link" to="/playground">
          demo guide
        </Link>
        . Final policies covering the live service, retention, consent, purchases, takedowns and
        support are pending the approved company documents.
      </p>
      <ButtonLink variant="secondary" to="/">
        Back to discovery
      </ButtonLink>
    </div>
  );
}
