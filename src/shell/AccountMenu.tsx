import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

/** Round account button that opens a small menu; closes on route change, outside click or Escape. */
export function AccountMenu({
  name,
  detail,
  avatar,
  children,
}: {
  name: string;
  detail?: string;
  avatar: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !ref.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div className="account-menu" ref={ref}>
      <button
        type="button"
        className="account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen(!open)}
      >
        {avatar}
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="account-popover" role="menu">
          <div className="account-name">
            <strong>{name}</strong>
            {detail && <span>{detail}</span>}
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
