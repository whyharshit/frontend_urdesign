import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Coins, ArrowUpRight, Copy, Gift, CreditCard, Check } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { CONNECT_PACKS, PROPOSAL_VALID_DAYS } from '../../config/catalog';
import { money, dateLabel, uid } from '../../lib/format';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Notice, EmptyState, StatusBadge } from '../../components/ui/Feedback';

export function PackList({
  shortfall = 0,
  returnTo = '',
}: {
  shortfall?: number;
  returnTo?: string;
}) {
  const baseRate = CONNECT_PACKS[0].price / CONNECT_PACKS[0].connects;
  return (
    <div className="pack-grid">
      {CONNECT_PACKS.map((pack) => (
        <article className={`pack-card ${pack.popular ? 'popular' : ''}`} key={pack.connects}>
          {pack.popular && <span className="pack-popular">MOST POPULAR</span>}
          <h3>
            {pack.connects.toLocaleString('en-IN')}
            <span>connects</span>
          </h3>
          <div className="pack-price">{money(pack.price)}</div>
          <p>₹{(pack.price / pack.connects).toFixed(2)} / connect</p>
          <small>
            {pack.connects === 50
              ? 'Base rate'
              : `Save ${Math.round((1 - pack.price / pack.connects / baseRate) * 100)}% vs base`}
          </small>
          {shortfall > 0 && (
            <p>
              {pack.connects >= shortfall
                ? '✓ Covers your shortfall'
                : `${shortfall - pack.connects} more still needed`}
            </p>
          )}
          <ButtonLink
            variant={pack.popular ? 'primary' : 'secondary'}
            to={`/dashboard/connects/payment/${pack.connects}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          >
            Choose pack
          </ButtonLink>
        </article>
      ))}
    </div>
  );
}

export function WalletPage() {
  const { state } = useDemo();
  return (
    <>
      <PageHeading
        eyebrow="INTRODUCTIONS, ON YOUR TERMS"
        title="Your connects wallet"
        description="Invest in the projects that feel right for your practice."
      />
      <div className="wallet-hero">
        <div>
          <span className="eyebrow">AVAILABLE TO YOU</span>
          <strong>
            {state.balance.toLocaleString('en-IN')}
            <span>connects</span>
          </strong>
          <p>
            {state.balance.toLocaleString('en-IN')} connects ({money(state.balance)}). Each proposal
            is valid for {PROPOSAL_VALID_DAYS} days.
          </p>
        </div>
        <ButtonLink variant="light" to="/dashboard/connects/buy">
          <Coins size={17} />
          Buy connects
        </ButtonLink>
      </div>
      <div className="stack">
        <Notice>
          Connects never expire. You spend them when you send a proposal, with the cost based on
          your own design fee. Each proposal is valid for {PROPOSAL_VALID_DAYS} days: a client
          decline returns 50%, and no reply within {PROPOSAL_VALID_DAYS} days returns 100%.
        </Notice>
        <section className="panel">
          <div className="panel-heading">
            <h2>Your connect history</h2>
            <span className="small muted">Every credit. Every introduction.</span>
          </div>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Connect wallet ledger</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Connects</th>
                </tr>
              </thead>
              <tbody>
                {state.ledger.map((row) => (
                  <tr key={row.id}>
                    <td>{dateLabel(row.date)}</td>
                    <td>{row.label}</td>
                    <td className={row.amount > 0 ? 'positive' : 'negative'}>
                      {row.amount > 0 ? '+' : ''}
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {state.payments.length > 0 && (
          <section className="panel">
            <div className="panel-heading">
              <h2>Your pack purchases</h2>
            </div>
            <div className="stack-sm">
              {state.payments.map((p) => (
                <div className="enquiry-list-row" key={p.id}>
                  <div>
                    <h3>
                      {p.pack} connects · {money(p.amount)}
                    </h3>
                    <p>
                      Reference {p.reference} · {dateLabel(p.date)}
                    </p>
                    {p.reason && <p>{p.reason}</p>}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="panel">
          <div className="panel-heading">
            <h2>Good people know good people.</h2>
            <Gift size={23} className="accent" />
          </div>
          <p className="small" style={{ marginBottom: 19 }}>
            Invite a professional. You both receive 20 connects when they publish. Up to five
            rewarded referrals.
          </p>
          <Link className="text-link" to="/dashboard/referrals">
            Share an invitation <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}

export function BuyConnectsPage() {
  return (
    <>
      <PageHeading
        eyebrow="ROOM FOR YOUR NEXT INTRODUCTION"
        title="A little more possibility."
        description="Fixed packs. Transparent prices. Connects that never expire."
        action={
          <ButtonLink variant="secondary" to="/dashboard/connects">
            Back to wallet
          </ButtonLink>
        }
      />
      <Notice>
        Payments are verified by our team, usually within a few hours. Connects appear after
        verification. This preview simulates that process without taking payment.
      </Notice>
      <PackList />
      <div className="panel stack-sm">
        <h3>Choose what works for your practice.</h3>
        <p className="small">
          You can combine packs. Compare the per-connect rates and the total you need; there’s no
          subscription or automatic renewal.
        </p>
        <p className="small">
          200 joining connects are granted during the 90-day launch window; 50 after. Proposals have
          their band cost from the first send. The joining grant alone doesn’t fund a 300-connect
          proposal.
        </p>
      </div>
    </>
  );
}

export function PaymentPage() {
  const { pack: packId } = useParams();
  const [params] = useSearchParams();
  const { state, dispatch } = useDemo();
  const pack = CONNECT_PACKS.find((p) => String(p.connects) === packId);
  const [reference, setReference] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState('');
  const returnParam = params.get('returnTo') || '';
  const returnTo = /^\/dashboard\/enquiries\/[^/]+\/proposal$/.test(returnParam)
    ? returnParam
    : '/dashboard/connects';
  const payment = state.payments.find((p) => p.id === submitted);
  if (!pack)
    return (
      <EmptyState
        title="Choose an available connect pack."
        description="Packs have fixed sizes and prices."
        to="/dashboard/connects/buy"
        action="View all packs"
      />
    );
  return (
    <div className="stack">
      <PageHeading
        eyebrow="YOUR NEXT INTRODUCTION"
        title={payment ? 'Your payment status.' : 'One step closer.'}
        description={`${pack.connects} connects · ${money(pack.price)}`}
        action={
          <ButtonLink variant="secondary" to="/dashboard/connects/buy">
            All packs
          </ButtonLink>
        }
      />
      {payment ? (
        <section className="panel stack">
          <StatusBadge status={payment.status} />
          <h2>
            {payment.status === 'verified'
              ? 'Your connects are ready.'
              : payment.status === 'rejected'
                ? 'This submission needs another look.'
                : 'Your submission is with the team.'}
          </h2>
          <p>
            {payment.status === 'verified'
              ? `${pack.connects} connects have been credited to your demo wallet.`
              : payment.status === 'rejected'
                ? payment.reason
                : 'In the live service, payments are checked by a person, usually within a few hours.'}
          </p>
          <p className="small">Transaction reference: {payment.reference}</p>
          {payment.status === 'pending' && (
            <Notice>
              To continue the demo, open{' '}
              <Link to="/admin/payments">admin payment verification</Link> and verify this simulated
              submission.
            </Notice>
          )}
          <ButtonLink to={returnTo}>
            {returnTo.includes('/proposal') ? 'Return to your proposal' : 'Back to wallet'}{' '}
            <ArrowUpRight size={16} />
          </ButtonLink>
        </section>
      ) : (
        <div className="enquiry-detail-grid">
          <form
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                state.payments.some(
                  (p) => p.reference.toLowerCase() === reference.trim().toLowerCase(),
                )
              ) {
                setError(
                  'This transaction reference has already been submitted. Use a unique sample reference.',
                );
                return;
              }
              const id = uid();
              dispatch({
                type: 'payment',
                payment: {
                  id,
                  providerId: state.ownId,
                  pack: pack.connects,
                  amount: pack.price,
                  reference: reference.trim(),
                  date: new Date().toISOString(),
                  status: 'pending',
                },
              });
              setSubmitted(id);
            }}
          >
            <h2>Payment preview</h2>
            <Notice tone="warning">
              No live payment destination is configured. Don’t send money. Use a made-up reference
              to explore manual verification.
            </Notice>
            <div className="payment-placeholder">
              <CreditCard size={38} />
              <p>Payment QR will appear here when the backend is connected.</p>
            </div>
            <Input
              label="Sample transaction reference"
              placeholder="e.g. DEMO123456"
              required
              minLength={6}
              maxLength={40}
              pattern="[a-zA-Z0-9]{6,40}"
              value={reference}
              hint="6 to 40 letters or numbers. A reference can be submitted only once."
              onChange={(e) => setReference(e.target.value)}
            />
            {error && <Notice tone="warning">{error}</Notice>}
            <Button type="submit">Simulate payment submission</Button>
          </form>
          <aside className="panel stack-sm">
            <Coins size={25} className="accent" />
            <h3>{pack.connects} connects</h3>
            <dl className="detail-grid">
              <div>
                <dt>Pack price</dt>
                <dd>{money(pack.price)}</dd>
              </div>
              <div>
                <dt>Per connect</dt>
                <dd>₹{(pack.price / pack.connects).toFixed(2)}</dd>
              </div>
            </dl>
            <hr className="divider" />
            <p className="small">
              After a real payment is verified, the backend will credit the wallet and email a
              receipt. This demo only updates browser state.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const code = 'AANGAN20';
  return (
    <div className="stack">
      <PageHeading
        eyebrow="GOOD PEOPLE KNOW GOOD PEOPLE"
        title="Make room for someone good."
        description="Invite a professional whose work deserves to be discovered."
      />
      <section className="panel stack">
        <Gift size={35} className="accent" />
        <h2>A good introduction gives back.</h2>
        <p>
          When a professional joins with your code and publishes their profile, you both receive{' '}
          <strong>20 connects</strong>. Your first five published referrals count.
        </p>
        <div>
          <span className="eyebrow">YOUR SAMPLE INVITATION CODE</span>
          <div className="copy-field">
            <code>{code}</code>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/join?ref=${code}`);
                  setCopied(true);
                  setError('');
                } catch {
                  setError(
                    `Could not copy automatically. Your link is ${window.location.origin}/join?ref=${code}`,
                  );
                }
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Link copied' : 'Copy invitation link'}
            </Button>
          </div>
          {copied && (
            <p className="saved-note" role="status">
              Your demo invitation link is on the clipboard.
            </p>
          )}
          {error && (
            <p className="error-text" role="status">
              {error}
            </p>
          )}
        </div>
        <div>
          <h3>Five introductions. More possibilities.</h3>
          <div className="referral-slots">
            {[1, 2, 3, 4, 5].map((i) => (
              <div className="referral-slot" key={i}>
                <span>
                  Invite {i}
                  <br />
                  +20
                </span>
              </div>
            ))}
          </div>
          <p className="small">0 of 5 rewards earned · 0 connects received</p>
        </div>
        <Notice>
          Sample referral code. Tracking, code validation and automatic rewards will be connected to
          the backend. Rewards happen on first publication, not signup.
        </Notice>
      </section>
    </div>
  );
}
