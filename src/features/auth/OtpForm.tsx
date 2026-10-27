import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Notice } from '../../components/ui/Feedback';
import { formatPhone } from '../../lib/format';

/** Visual OTP flow only. Real verification, expiry and throttling belong to the API. */
export function OtpForm({
  onVerified,
  onBack,
  phone,
}: {
  onVerified: () => void;
  onBack: () => void;
  phone?: string;
}) {
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  const locked = attempts >= 3;
  return (
    <form
      className="stack"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (locked) return;
        if (!/^\d{6}$/.test(code)) {
          setError('Enter the 6-digit code');
          return;
        }
        if (code === '123456') onVerified();
        else {
          setAttempts((a) => a + 1);
          setError(`That code isn’t right. ${Math.max(0, 2 - attempts)} attempts left.`);
        }
      }}
    >
      <Notice>
        {locked ? (
          'Too many attempts. Go back and request a new code.'
        ) : (
          <>
            {phone ? `We’ve sent a code to ${formatPhone(phone)}. ` : ''}No SMS is sent in this
            preview. Enter <strong>123456</strong>.
          </>
        )}
      </Notice>
      <div className="otp-input">
        <Input
          label="Six-digit verification code"
          value={code}
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          disabled={locked}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ''));
            setError('');
          }}
          error={error}
        />
      </div>
      <Button type="submit" disabled={locked}>
        Verify & continue
      </Button>
      <div className="otp-actions">
        <Button type="button" variant="ghost" onClick={onBack}>
          Go back
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={seconds > 0 || locked}
          onClick={() => {
            setSeconds(30);
            setError('Code sent again. In this preview it is still 123456.');
          }}
        >
          Resend code{seconds > 0 ? ` (${seconds}s)` : ''}
        </Button>
      </div>
    </form>
  );
}
