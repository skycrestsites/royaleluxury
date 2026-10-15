import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { titleCase } from '../lib/format';

export function Button({
  variant = 'primary',
  busy = false,
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; busy?: boolean }) {
  return (
    <button {...props} className={`a-btn a-btn--${variant} ${className}`} disabled={busy || props.disabled} aria-busy={busy}>
      {busy && <span className="a-spinner a-spinner--sm" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <a {...props} className={`a-btn a-btn--${variant} ${props.className ?? ''}`} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="a-field">
      <span className="a-field-label">{label}</span>
      {children}
      {error ? <span className="a-field-error">{error}</span> : hint && <span className="a-field-hint">{hint}</span>}
    </label>
  );
}

export function Card({ title, actions, children, className = '' }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`a-card ${className}`}>
      {(title || actions) && (
        <header className="a-card-head">
          {title && <h2>{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

const BADGE_TONES: Record<string, string> = {
  active: 'success',
  paid: 'info',
  fulfilled: 'info',
  shipped: 'success',
  delivered: 'success',
  connected: 'success',
  owner: 'gold',
  published: 'success',
  draft: 'neutral',
  pending: 'warning',
  building: 'warning',
  archived: 'neutral',
  cancelled: 'danger',
  refunded: 'danger',
  failed: 'danger',
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return <span className={`a-badge a-badge--${BADGE_TONES[value] ?? 'neutral'}`}>{label ?? titleCase(value.replace(/[-_]/g, ' '))}</span>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="a-loading" role="status">
      <span className="a-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="a-empty">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorNotice({ error }: { error: unknown }) {
  if (!error) return null;
  return <p className="a-notice a-notice--error">{error instanceof Error ? error.message : String(error)}</p>;
}

// ---------- Toasts ----------

type Toast = { id: number; message: string; tone: 'success' | 'error' };
const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, tone }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`a-toast a-toast--${toast.tone}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
