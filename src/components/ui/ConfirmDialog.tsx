import { useEffect, useRef, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmDisabled = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-top">
        <h2 id={id}>{title}</h2>
        <Button variant="ghost" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      <div className="dialog-body">{children}</div>
      <div className="button-row">
        <Button variant="secondary" onClick={onClose} autoFocus>
          Cancel
        </Button>
        <Button
          disabled={confirmDisabled}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
