import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Checkbox, Input } from '../../components/ui/Field';
import { Button, ButtonLink } from '../../components/ui/Button';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { Notice } from '../../components/ui/Feedback';
import { useDemo } from '../../hooks/useDemo';
import { OtpForm } from './OtpForm';

/** Professionals only. Clients sign in through the OTP sent when they enquire. */
export function AuthPage({ mode }: { mode: 'join' | 'login' | 'reset' }) {
  const navigate = useNavigate();
  const { dispatch } = useDemo();
  const [params] = useSearchParams();
  const [step, setStep] = useState<'details' | 'otp' | 'password' | 'complete'>('details');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const join = mode === 'join';
  const reset = mode === 'reset';
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <span className="eyebrow">FOR ARCHITECTS & INTERIOR DESIGNERS</span>
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
        <span className="eyebrow">PROFESSIONAL ACCOUNT</span>
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
            phone={phone}
            onBack={() => setStep('details')}
            onVerified={() => {
              if (reset) setStep('password');
              else {
                dispatch({ type: 'signup', phone, email, date: new Date().toISOString() });
                navigate('/dashboard/setup');
              }
            }}
          />
        ) : step === 'password' ? (
          <form
            className="stack"
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="At least 8 characters."
            />
            <Button type="submit">Save new password</Button>
          </form>
        ) : step === 'complete' ? (
          <div className="stack">
            <Notice tone="success">Your password is updated. Log in with your new password.</Notice>
            <ButtonLink to="/login">Return to log in</ButtonLink>
          </div>
        ) : (
          <>
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                if (mode === 'login') {
                  dispatch({ type: 'login', role: 'professional' });
                  navigate('/dashboard');
                } else setStep('otp');
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
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
              {join && (
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yourstudio.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
              {!reset && (
                <Input
                  label="Password"
                  type="password"
                  autoComplete={join ? 'new-password' : 'current-password'}
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              {join && (
                <>
                  <Input
                    label="Referral code (optional)"
                    defaultValue={params.get('ref') || ''}
                    maxLength={30}
                    hint="Both professionals earn 20 connects after the referred profile is published."
                  />
                  <Checkbox required>
                    I agree to the <Link to="/terms">Terms</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </Checkbox>
                </>
              )}
              {mode === 'login' && (
                <Link className="text-link" to="/forgot-password">
                  Forgot password?
                </Link>
              )}
              <Button type="submit">
                {join ? 'Continue to verification' : reset ? 'Continue with OTP' : 'Log in'}
                <ArrowUpRight size={16} />
              </Button>
            </form>
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
            <div className="auth-foot auth-foot--client">
              Looking for a designer? <Link to="/architects">Browse professionals</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
