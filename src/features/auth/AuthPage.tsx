import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Input } from '../../components/ui/Field';
import { Button, ButtonLink } from '../../components/ui/Button';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { Notice } from '../../components/ui/Feedback';
import { OtpForm } from './OtpForm';

export function AuthPage({ mode }: { mode: 'join' | 'login' | 'reset' }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<'professional' | 'client'>('professional');
  const [step, setStep] = useState<'details' | 'otp' | 'password' | 'complete'>('details');
  const join = mode === 'join';
  const reset = mode === 'reset';
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <span className="eyebrow">A PLACE FOR YOUR NEXT CHAPTER</span>
        <h1>
          You shape spaces.
          <br />
          Let your work
          <br />
          open doors.
        </h1>
        <p>A home for your practice, your portfolio and meaningful introductions.</p>
        <img
          src="/images/dining.jpg"
          alt="A thoughtfully designed dining room filled with natural light"
        />
        <p>
          Create a profile for free. Receive 200 launch connects. Proposals cost connects from your
          first send.
        </p>
      </aside>
      <div className="auth-form" key={mode}>
        <h2>
          {step === 'otp'
            ? 'A small step. A real connection.'
            : step === 'password'
              ? 'Choose a new password.'
              : join
                ? 'Make room for your practice.'
                : reset
                  ? 'Let’s get you back in.'
                  : 'Welcome back.'}
        </h2>
        <p>
          {join
            ? 'Tell your story. Show your work. Find your next introduction.'
            : 'Your spaces, people and possibilities are right here.'}
        </p>
        <DemoNotice />
        {step === 'otp' ? (
          <OtpForm
            onBack={() => setStep('details')}
            onVerified={() =>
              reset
                ? setStep('password')
                : navigate(role === 'client' ? '/my-enquiries' : '/dashboard')
            }
          />
        ) : step === 'password' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('complete');
            }}
          >
            <Input
              label="New password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              hint="At least 8 characters. This demo does not store passwords."
            />
            <Button type="submit">Preview password reset</Button>
          </form>
        ) : step === 'complete' ? (
          <div className="stack">
            <Notice tone="success">
              Password reset preview complete. Real password changes will be available when the
              authentication API is connected.
            </Notice>
            <ButtonLink to="/login">Return to login</ButtonLink>
          </div>
        ) : (
          <>
            {!reset && (
              <div className="segmented" style={{ marginBottom: 25 }} aria-label="Account type">
                <button
                  aria-pressed={role === 'professional'}
                  onClick={() => setRole('professional')}
                >
                  I’m a professional
                </button>
                <button aria-pressed={role === 'client'} onClick={() => setRole('client')}>
                  I’m looking for a designer
                </button>
              </div>
            )}
            {join && role === 'client' ? (
              <div className="stack">
                <p>
                  Start by finding a professional whose work speaks to you. Your account is created
                  when you send your first enquiry.
                </p>
                <ButtonLink to="/architects">
                  Find a professional <ArrowUpRight size={17} />
                </ButtonLink>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mode === 'login' && role === 'professional') navigate('/dashboard');
                  else setStep('otp');
                }}
              >
                <Input
                  label="Mobile number"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  placeholder="10-digit Indian mobile number"
                  hint="India (+91)"
                  required
                />
                {join && (
                  <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourstudio.com"
                    required
                  />
                )}
                {!reset && role === 'professional' && (
                  <Input
                    label="Password"
                    type="password"
                    autoComplete={join ? 'new-password' : 'current-password'}
                    minLength={8}
                    placeholder="At least 8 characters"
                    required
                  />
                )}
                {join && (
                  <>
                    <Input
                      label="Referral code (optional)"
                      defaultValue={params.get('ref') || ''}
                      maxLength={30}
                      hint="Both professionals earn 20 connects after the referred profile is published. Referral validation requires the backend."
                    />
                    <label className="checkbox">
                      <input type="checkbox" required />
                      <span>
                        I agree to the <Link to="/terms">Terms</Link> and{' '}
                        <Link to="/privacy">Privacy Policy</Link>. My role is fixed after signup.
                      </span>
                    </label>
                  </>
                )}
                {mode === 'login' && role === 'professional' && (
                  <Link className="text-link" to="/forgot-password">
                    Forgot password?
                  </Link>
                )}
                <Button type="submit">
                  {join
                    ? 'Continue to verification'
                    : reset || role === 'client'
                      ? 'Continue with OTP'
                      : 'Open demo workspace'}
                  <ArrowUpRight size={16} />
                </Button>
              </form>
            )}
            <div className="auth-foot">
              {join ? (
                <>
                  Already have a profile? <Link to="/login">Log in</Link>
                </>
              ) : (
                <>
                  New here? <Link to="/join">Create your professional profile</Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
