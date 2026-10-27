import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Compass, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, Notice } from '../../components/ui/Feedback';
import { useDemo } from '../../hooks/useDemo';
import { createSeedState } from '../../data/seed';
import { CONNECT_PACKS, FEE_BANDS, PROPOSAL_VALID_DAYS } from '../../config/catalog';
import { connectsLabel } from '../../lib/format';

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
        eyebrow="UR DESIGNER · FRONTEND PREVIEW"
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

/** Public explainer for professionals, linked from the footer. No login needed. */
export function ConnectsInfoPage() {
  const { state, ready } = useDemo();
  const professional = ready && state.session.professional;
  return (
    <div className="container section stack connects-info">
      <PageHeading
        eyebrow="FOR ARCHITECTS & INTERIOR DESIGNERS"
        title="How connects work."
        description="Connects are how professionals reply to enquiries on UR DESIGNER. Clients never pay anything."
      />
      <div className="connects-steps">
        {[
          {
            title: 'Start with 200 free',
            body: 'Every new professional gets 200 launch connects when they join. Creating and publishing a profile is free.',
          },
          {
            title: 'Spend them on a proposal',
            body: 'Reading an enquiry is free. You only spend connects when you send a proposal, and the cost follows the design fee you quote.',
          },
          {
            title: `Valid for ${PROPOSAL_VALID_DAYS} days`,
            body: `Each proposal stays open for ${PROPOSAL_VALID_DAYS} days. If the client doesn’t reply in that time, every connect comes back.`,
          },
        ].map((step, i) => (
          <article className="panel" key={step.title}>
            <span className="eyebrow">STEP {i + 1}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
      <section className="panel">
        <h2>What a proposal costs</h2>
        <p className="small">Set automatically from the design fee in your proposal.</p>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Connects needed per proposal, by design fee</caption>
            <thead>
              <tr>
                <th>Your design fee</th>
                <th>Connects to send</th>
              </tr>
            </thead>
            <tbody>
              {FEE_BANDS.map((band) => (
                <tr key={band.id}>
                  <td>{band.label}</td>
                  <td>{connectsLabel(band.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>When connects come back</h2>
        <ul className="plain-list connects-refunds">
          <li>
            <strong>The client declines:</strong> half your connects return.
          </li>
          <li>
            <strong>No reply in {PROPOSAL_VALID_DAYS} days:</strong> all your connects return.
          </li>
          <li>
            <strong>The client closes the enquiry:</strong> all your connects return.
          </li>
          <li>
            <strong>Unused connects</strong> never expire.
          </li>
        </ul>
        <p className="small">
          Need more? Packs start at {CONNECT_PACKS[0].connects} connects for ₹
          {CONNECT_PACKS[0].price}.
        </p>
      </section>
      <div className="button-row">
        {professional ? (
          <ButtonLink to="/dashboard/connects">Open your connects wallet</ButtonLink>
        ) : (
          <ButtonLink to="/join">Join as a professional</ButtonLink>
        )}
        <ButtonLink variant="secondary" to="/terms">
          Read the terms
        </ButtonLink>
      </div>
    </div>
  );
}

const TERMS: [string, string[]][] = [
  [
    '1. About UR DESIGNER',
    [
      'UR DESIGNER ("we", "us") is an online platform that helps people ("clients") discover architects, interior designers and other design professionals ("professionals") in India, share a project requirement and receive written proposals.',
      'We are an introduction service. We are not a party to any agreement between a client and a professional, we do not employ professionals, and we do not supervise, guarantee or take responsibility for any design, construction or other work.',
    ],
  ],
  [
    '2. Who can use UR DESIGNER',
    [
      'You must be at least 18 years old and able to enter into a binding contract under Indian law. You must give accurate information, including a mobile number you control, and keep your login details private.',
      'One person or practice may hold one professional account. Your role (client or professional) is fixed once your account is created.',
    ],
  ],
  [
    '3. Enquiries and proposals',
    [
      'A client may send one project requirement to up to five professionals. Sending an enquiry is free.',
      'A professional may reply with a written, indicative proposal. Fees and timelines in a proposal are estimates to start a conversation; they are not a binding quote unless both parties later agree in writing outside UR DESIGNER.',
      'When a client accepts a proposal, both sides can see each other’s name, mobile number and email address. Accepting is an introduction, not a contract to hire. Other professionals who sent proposals on the same project are told the client has chosen someone.',
      'A client may close an enquiry at any time. Professionals who have not been chosen will see that it is closed.',
    ],
  ],
  [
    '4. Connects (professionals)',
    [
      'Professionals use connects to send proposals. The number of connects a proposal costs is set by the design fee quoted. Connects have no cash value, cannot be transferred and are not refundable except as stated in the app (for example, half returned when a client declines, all returned when a client closes an enquiry or a proposal expires unanswered).',
      'Launch grants, referral rewards and pack prices may change. Any change applies to future purchases only.',
    ],
  ],
  [
    '5. Profiles and content',
    [
      'Professionals are responsible for everything on their profile. You may only show work you created or have permission to show, and you must describe qualifications and registrations truthfully. A Council of Architecture (CoA) number is shown as "provided" until we have checked it; it is not an endorsement.',
      'Do not put phone numbers, email addresses or social handles inside bios, project descriptions, enquiries or proposals to get around the introduction process. Contact details are shared automatically on acceptance.',
      'You keep ownership of your content. You give UR DESIGNER a non-exclusive, royalty-free licence to host, display and resize it to run and promote the platform while your profile is live.',
    ],
  ],
  [
    '6. Things you must not do',
    [
      'Impersonate anyone; post fake, copied or misleading work or reviews; harass or abuse other users; ask for payment outside an agreed engagement in a way that is deceptive; scrape or copy the platform; or try to break its security.',
      'Anyone can report a profile. We may remove content, unpublish or suspend an account, and close open proposals if we reasonably believe these terms have been broken. Where we suspend a professional, unspent connects stay frozen until the review is complete.',
    ],
  ],
  [
    '7. Liability',
    [
      'UR DESIGNER is provided "as is". To the extent allowed by law, we are not liable for the quality, safety, legality or outcome of any work agreed between clients and professionals, or for any indirect or consequential loss. Our total liability to a professional is limited to the amount they paid us for connects in the three months before the claim.',
      'Nothing in these terms limits rights you have under the Consumer Protection Act, 2019 or any other law that cannot be excluded.',
    ],
  ],
  [
    '8. Changes, notices and law',
    [
      'We may update these terms. We will tell you about material changes by email or in the app before they take effect; continuing to use UR DESIGNER afterwards means you accept them.',
      'These terms are governed by the laws of India. Courts at Ahmedabad, Gujarat have exclusive jurisdiction, subject to any consumer forum you are entitled to use.',
      'Questions or complaints: write to our Grievance Officer at support@urdesigner.in. We acknowledge complaints within 48 hours and aim to resolve them within 15 days.',
    ],
  ],
];

const PRIVACY: [string, string[]][] = [
  [
    '1. What we collect',
    [
      'Clients: name, mobile number, email address and the project details you write (type, city, size, budget, timeline and description).',
      'Professionals: name, studio, mobile number, email address, city and cities you work in, qualification, optional CoA number, links, photos and portfolio content, and records of connects and payments.',
      'Everyone: basic device and usage data (pages viewed, profile views, approximate location from IP) used to keep the service secure and to show professionals how often their profile is viewed.',
    ],
  ],
  [
    '2. How we use it',
    [
      'To create and secure your account (including sending one-time passcodes), deliver enquiries and proposals, show professionals in search, prevent fraud and abuse, provide support, and improve the product.',
      'We do not sell your personal data. We do not use your project description to advertise to you.',
    ],
  ],
  [
    '3. When contact details are shared',
    [
      'A client’s name, mobile number and email are hidden from professionals until the client accepts that professional’s proposal. A professional’s phone and email are shown only to a client who has accepted their proposal. Public profiles never show a professional’s phone or email.',
    ],
  ],
  [
    '4. Who we share it with',
    [
      'Service providers who help us run UR DESIGNER (hosting, SMS, email and payment processing), bound by confidentiality. Authorities when the law requires it. A buyer of the business, under the same protections, if UR DESIGNER is sold or merged.',
    ],
  ],
  [
    '5. Keeping and deleting data',
    [
      'We keep account data while your account is active and for up to 3 years after your last activity, then delete or anonymise it, unless the law requires longer (for example, tax records for payments).',
      'You can ask to see, correct or delete your data, or withdraw consent, under the Digital Personal Data Protection Act, 2023. Write to support@urdesigner.in; we respond within 30 days.',
    ],
  ],
  [
    '6. Cookies and storage',
    [
      'We use essential cookies and your browser’s storage to keep you signed in and to save drafts and the professionals you save. We do not use advertising cookies.',
    ],
  ],
  [
    '7. Contact',
    [
      'Grievance Officer, UR DESIGNER: support@urdesigner.in. We will update this policy as the service changes and show the date of the latest version at the top.',
    ],
  ],
];

export function LegalPage({ privacy = false }: { privacy?: boolean }) {
  const sections = privacy ? PRIVACY : TERMS;
  return (
    <div className="container section prose">
      <span className="eyebrow">UR DESIGNER</span>
      <h1>{privacy ? 'Privacy policy' : 'Terms of service'}</h1>
      <p className="small muted">Draft for legal review · Last updated 14 October 2026</p>
      <p>
        {privacy
          ? 'Your contact details, on your terms. This policy explains what UR DESIGNER collects, why, and the choices you have.'
          : 'These terms explain how UR DESIGNER works and what we expect from clients and professionals. By using UR DESIGNER you agree to them.'}
      </p>
      {sections.map(([heading, paragraphs]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          {paragraphs.map((text) => (
            <p key={text.slice(0, 40)}>{text}</p>
          ))}
        </section>
      ))}
      <p>
        See also our{' '}
        <Link className="text-link" to={privacy ? '/terms' : '/privacy'}>
          {privacy ? 'Terms of service' : 'Privacy policy'}
        </Link>
        .
      </p>
      <ButtonLink variant="secondary" to="/">
        Back to home
      </ButtonLink>
    </div>
  );
}
