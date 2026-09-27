import { LockKeyhole } from 'lucide-react';
import { Notice } from '../ui/Feedback';

export function ContactReveal() {
  return (
    <div className="panel stack-sm">
      <LockKeyhole className="accent" size={24} />
      <h3>You’re ready for a first hello.</h3>
      <p className="small">Both sides can now connect directly.</p>
      <Notice tone="success">
        Acceptance recorded in this preview. Real contact details will be securely supplied by the
        backend after acceptance.
      </Notice>
    </div>
  );
}
