import { Notice } from './Feedback';
import { IS_STAGING } from '../../config/catalog';
/** Preview banner. Staging builds only; production users never see it. */
export function DemoNotice() {
  if (!IS_STAGING) return null;
  return (
    <Notice>
      Interactive frontend preview. Use sample details; no account is created, SMS sent or payment
      collected.
    </Notice>
  );
}
