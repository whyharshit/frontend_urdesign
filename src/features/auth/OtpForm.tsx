import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Notice } from '../../components/ui/Feedback';

/** Visual OTP flow only. Real verification, expiry and throttling belong to the API. */
export function OtpForm({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
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
      onSubmit={(event) => {
        event.preventDefault();
        if (locked) return;
        if (code === '123456') onVerified();
        else {
          setAttempts((a) => a + 1);
          setError(`That code isn’t right. ${Math.max(0, 2 - attempts)} attempts left.`);
        }
      }}
    >
      <Notice>
        {locked ? (
          'Demo locked after three attempts. Return to the previous step to restart. In production, the server enforces a 30-minute lock.'
        ) : (
          <>
            No SMS is sent in this preview. Enter <strong>123456</strong> to continue.
          </>
        )}
      </Notice>
      <div className="otp-input">
        <Input
          label="Six-digit verification code"
          value={code}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          disabled={locked}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
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
            setError('Use the same demo code: 123456.');
          }}
        >
          Resend code{seconds > 0 ? ` (${seconds}s)` : ''}
        </Button>
      </div>
    </form>
  );
}
