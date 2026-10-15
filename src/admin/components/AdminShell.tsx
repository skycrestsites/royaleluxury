import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { signOut, useRequireAdmin } from '../lib/session';
import { usingEmulators } from '../lib/firebase';
import type { Role } from '../lib/types';
import { Spinner, ToastProvider } from './ui';
import { Icon, type IconName } from './Icon';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/products/', label: 'Products', icon: 'box' },
  { href: '/admin/categories/', label: 'Categories', icon: 'grid' },
  { href: '/admin/orders/', label: 'Orders', icon: 'receipt' },
  { href: '/admin/team/', label: 'Team', icon: 'users' },
  { href: '/admin/settings/', label: 'Settings', icon: 'settings' },
];

interface AdminContext {
  user: User;
  role: Role;
  isOwner: boolean;
}

const AdminSession = createContext<AdminContext | null>(null);

export function useAdmin() {
  const value = useContext(AdminSession);
  if (!value) throw new Error('useAdmin must be used inside <AdminShell>');
  return value;
}

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children: ReactNode;
}

export function AdminShell({ title, description, actions, back, children }: Props) {
  const session = useRequireAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [path, setPath] = useState('');

  useEffect(() => setPath(window.location.pathname), []);
  useEffect(() => {
    document.body.classList.toggle('a-locked', menuOpen);
  }, [menuOpen]);

  if (session.status !== 'ready') {
    return (
      <div className="a-fullscreen">
        <Spinner label="Checking your access" />
      </div>
    );
  }

  const { user, role } = session;
  const isActive = (href: string) => (href === '/admin/' ? path === href : path.startsWith(href));

  return (
    <AdminSession.Provider value={{ user, role, isOwner: role === 'owner' }}>
      <ToastProvider>
        <div className="a-app">
          <aside className={`a-sidebar ${menuOpen ? 'is-open' : ''}`}>
            <div className="a-sidebar-brand">
              <span className="a-brand-name">Royale</span>
              <span className="a-brand-sub">Admin</span>
            </div>
            <nav aria-label="Admin">
              <ul>
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={isActive(item.href) ? 'is-active' : ''} aria-current={isActive(item.href) ? 'page' : undefined}>
                      <Icon name={item.icon} />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="a-sidebar-foot">
              <a href="/" target="_blank" rel="noopener">
                <Icon name="external" /> View store
              </a>
            </div>
          </aside>
          {menuOpen && <div className="a-backdrop" onClick={() => setMenuOpen(false)} />}

          <div className="a-main">
            <header className="a-topbar">
              <button className="a-icon-btn a-menu-btn" type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                <Icon name="menu" />
              </button>
              {usingEmulators && <span className="a-env">Local emulators</span>}
              <div className="a-user">
                <span className="a-user-meta">
                  <span className="a-user-email">{user.email}</span>
                  <span className="a-user-role">{role}</span>
                </span>
                <button
                  className="a-btn a-btn--ghost"
                  type="button"
                  onClick={async () => {
                    await signOut();
                    window.location.replace('/adminlogin/');
                  }}
                >
                  Sign out
                </button>
              </div>
            </header>

            <main className="a-content">
              <div className="a-page-head">
                <div>
                  {back && (
                    <a className="a-back" href={back.href}>
                      <Icon name="chevronLeft" /> {back.label}
                    </a>
                  )}
                  <h1>{title}</h1>
                  {description && <p className="a-muted">{description}</p>}
                </div>
                {actions && <div className="a-page-actions">{actions}</div>}
              </div>
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminSession.Provider>
  );
}
