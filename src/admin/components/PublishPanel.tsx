import { useState } from 'react';
import { callable } from '../lib/firebase';
import { useLiveDoc, type PublishState } from '../lib/data';
import { date, errorMessage } from '../lib/format';
import { Badge, Button, Card, Spinner, useToast } from './ui';

/** Shows whether the storefront has unpublished catalog changes and starts a rebuild. */
export function PublishPanel() {
  const { loading, data: state } = useLiveDoc<PublishState>('site/publish');
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  if (loading) {
    return (
      <Card title="Storefront">
        <Spinner />
      </Card>
    );
  }

  const status = state?.status ?? 'idle';
  const building = status === 'building';

  async function publish() {
    setBusy(true);
    try {
      await callable('publishSite')();
      notify('Publishing started. The live site updates in about two minutes.');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
    setBusy(false);
  }

  return (
    <Card title="Storefront" actions={<Badge value={building ? 'building' : state?.pendingChanges ? 'pending' : 'published'} label={building ? 'Publishing' : state?.pendingChanges ? 'Unpublished changes' : 'Up to date'} />}>
      <p className="a-muted">
        Product and category edits are saved instantly here. Publish rebuilds the public site so shoppers see them.
      </p>
      <dl className="a-meta">
        <div>
          <dt>Last published</dt>
          <dd>{date(state?.lastPublishedAt, true) || 'Not yet'}</dd>
        </div>
        <div>
          <dt>Last change</dt>
          <dd>{date(state?.lastChangeAt, true) || 'None'}</dd>
        </div>
        {status === 'failed' && (
          <div>
            <dt>Status</dt>
            <dd>
              <Badge value="failed" label="Last publish failed" />
            </dd>
          </div>
        )}
      </dl>
      <Button onClick={publish} busy={busy || building}>
        {building ? 'Publishing' : 'Publish storefront'}
      </Button>
    </Card>
  );
}
