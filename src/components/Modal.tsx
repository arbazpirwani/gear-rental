import { useEffect, useRef, type ReactNode } from 'react';

// Native <dialog> wrapper. Renders nothing when closed, traps focus, closes
// on ESC and backdrop click. No scroll-lock needed — <dialog> handles it.
export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function onBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    // Clicks on the dialog element itself (i.e. the backdrop) close it; clicks
    // inside the inner card do not bubble here.
    if (e.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={onBackdropClick}
      onCancel={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {title && <h2 className="modal-title">{title}</h2>}
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
}
