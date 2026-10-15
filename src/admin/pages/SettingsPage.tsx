import { useEffect, useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { PublishPanel } from '../components/PublishPanel';
import { Badge, Button, Card, Spinner, useToast } from '../components/ui';
import { callable, usingEmulators } from '../lib/firebase';
import { useLiveDoc, type StorageStats } from '../lib/data';
import { bytes, date, errorMessage } from '../lib/format';

/** Firebase includes 5 GB of Storage on the Blaze plan before charges start. */
const STORAGE_FREE_BYTES = 5 * 1024 ** 3;

type Status = { resend: boolean; github: boolean; stripe: boolean };

const INTEGRATIONS: { key: keyof Status | 'firebase'; name: string; purpose: string; setup: string }[] = [
  { key: 'firebase', name: 'Firebase', purpose: 'Sign-in, database, image storage and hosting.', setup: 'Connected.' },
  { key: 'github', name: 'GitHub Actions', purpose: 'Rebuilds and deploys the storefront when you press Publish.', setup: 'Add the GITHUB_TOKEN secret. See the setup guide, step C and D.' },
  { key: 'resend', name: 'Resend', purpose: 'Sends team invite emails.', setup: 'Add the RESEND_API_KEY secret. See the setup guide, step B and D.' },
  { key: 'stripe', name: 'Stripe', purpose: 'Checkout and payments. Orders will flow in automatically.', setup: 'Planned for phase 2. Add Stripe IDs to products in the meantime.' },
];

export default function SettingsPage() {
  return (
    <AdminShell title="Settings" description="Publishing, storage and connected platforms.">
      <div className="a-two-col">
        <div className="a-stack">
          <PublishPanel />
          <StorageCard />
        </div>
        <Integrations />
      </div>
    </AdminShell>
  );
}

function StorageCard() {
  const notify = useToast();
  const { loading, data: stats } = useLiveDoc<StorageStats>('stats/storage');
  const [busy, setBusy] = useState(false);
  const used = stats?.bytes ?? 0;
  const percent = Math.min(100, (used / STORAGE_FREE_BYTES) * 100);

  async function recalculate() {
    setBusy(true);
    try {
      await callable('recalculateStorage')();
      notify('Storage usage recalculated.');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
    setBusy(false);
  }

  if (loading) {
    return (
      <Card title="Storage">
        <Spinner />
      </Card>
    );
  }

  return (
    <Card title="Storage">
      <p className="a-storage-figure">
        <strong>{bytes(used)}</strong> of {bytes(STORAGE_FREE_BYTES)} included
      </p>
      <div className="a-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-label="Storage used">
        <span style={{ width: `${Math.max(percent, used ? 1 : 0)}%` }} />
      </div>
      <dl className="a-meta">
        <div>
          <dt>Files</dt>
          <dd>{stats?.files ?? 0}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{date(stats?.updatedAt, true) || 'Never'}</dd>
        </div>
      </dl>
      <p className="a-muted">Usage updates automatically as images are uploaded or removed. Recalculate to recount every file.</p>
      <Button variant="secondary" onClick={recalculate} busy={busy}>
        Recalculate
      </Button>
    </Card>
  );
}

function Integrations() {
  const [status, setStatus] = useState<Status | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callable<void, Status>('integrationStatus')()
      .then(({ data }) => setStatus(data))
      .catch(() => setFailed(true));
  }, []);

  const connected = (key: keyof Status | 'firebase') => (key === 'firebase' ? true : status?.[key]);

  return (
    <Card title="Integrations">
      {failed && <p className="a-notice a-notice--error">Could not reach the server functions{usingEmulators ? '. Is the emulator running?' : '. They may not be deployed yet.'}</p>}
      <ul className="a-integrations">
        {INTEGRATIONS.map((item) => {
          const isOn = connected(item.key);
          return (
            <li key={item.key}>
              <div>
                <strong>{item.name}</strong>
                <p className="a-muted">{item.purpose}</p>
                {isOn === false && <p className="a-field-hint">{item.setup}</p>}
              </div>
              {isOn === undefined ? (
                <Badge value={failed ? 'draft' : 'pending'} label={failed ? 'Unknown' : 'Checking'} />
              ) : isOn ? (
                <Badge value="connected" label="Connected" />
              ) : (
                <Badge value="draft" label="Not connected" />
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
