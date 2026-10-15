import { useEffect, useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { Badge, Button, Card, EmptyState, Field, Spinner, useToast } from '../components/ui';
import { updateOrder, useLiveDoc } from '../lib/data';
import { date, errorMessage, money, titleCase } from '../lib/format';
import { ORDER_STATUSES, type OrderDoc, type OrderStatus } from '../lib/types';

export default function OrderDetailPage() {
  const [id] = useState(() => new URLSearchParams(window.location.search).get('id'));
  return (
    <AdminShell title="Order" back={{ href: '/admin/orders/', label: 'Orders' }}>
      {id ? <OrderDetail id={id} /> : <EmptyState title="No order selected" />}
    </AdminShell>
  );
}

function OrderDetail({ id }: { id: string }) {
  const { loading, data: order, error } = useLiveDoc<OrderDoc>(`orders/${id}`);
  if (loading) return <Spinner />;
  if (error || !order) return <EmptyState title="Order not found" text={error ? errorMessage(error) : undefined} />;

  const { customer, shippingAddress: address, totals } = order;
  const currency = totals.currency;

  return (
    <div className="a-editor">
      <div className="a-editor-main">
        <Card title={order.number} actions={<Badge value={order.status} />}>
          <p className="a-muted">Placed {date(order.createdAt, true)}</p>
          <div className="a-table-wrap">
            <table className="a-table a-table--plain">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col" className="a-num">
                    Qty
                  </th>
                  <th scope="col" className="a-num">
                    Price
                  </th>
                  <th scope="col" className="a-num">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span className="a-stacked">
                        <strong>{item.name}</strong>
                        <span className="a-muted">{[item.sku, item.size, item.color].filter(Boolean).join(' · ')}</span>
                      </span>
                    </td>
                    <td className="a-num">{item.quantity}</td>
                    <td className="a-num">{money(item.unitPrice, currency)}</td>
                    <td className="a-num">{money(item.unitPrice * item.quantity, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="a-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(totals.subtotal, currency)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{totals.shipping ? money(totals.shipping, currency) : 'Free'}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{money(totals.tax, currency)}</dd>
            </div>
            <div className="a-totals-grand">
              <dt>Total</dt>
              <dd>{money(totals.total, currency)}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Payment">
          <dl className="a-meta">
            <div>
              <dt>Provider</dt>
              <dd>{titleCase(order.payment.provider)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{titleCase(order.payment.status)}</dd>
            </div>
            {order.payment.paymentIntentId && (
              <div>
                <dt>Reference</dt>
                <dd className="a-mono">{order.payment.paymentIntentId}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <aside className="a-editor-side">
        <Card title="Customer">
          <address className="a-address">
            <strong>{customer.name}</strong>
            <a href={`mailto:${customer.email}`}>{customer.email}</a>
            {customer.phone && <a href={`tel:${customer.phone}`}>{customer.phone}</a>}
          </address>
        </Card>
        <Card title="Shipping address">
          <address className="a-address">
            <span>{customer.name}</span>
            <span>{address.line1}</span>
            {address.line2 && <span>{address.line2}</span>}
            <span>
              {address.city}, {address.region} {address.postalCode}
            </span>
            <span>{address.country}</span>
          </address>
        </Card>
        <FulfillmentForm order={order} />
      </aside>
    </div>
  );
}

function FulfillmentForm({ order }: { order: OrderDoc }) {
  const notify = useToast();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [carrier, setCarrier] = useState(order.fulfillment?.carrier ?? '');
  const [tracking, setTracking] = useState(order.fulfillment?.trackingNumber ?? '');
  const [notes, setNotes] = useState(order.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => setStatus(order.status), [order.status]);

  async function save() {
    setSaving(true);
    try {
      const shippedAt = order.fulfillment?.shippedAt ?? (status === 'shipped' ? new Date().toISOString() : undefined);
      await updateOrder(order.id, {
        status,
        notes: notes.trim(),
        fulfillment: {
          carrier: carrier.trim(),
          trackingNumber: tracking.trim(),
          ...(shippedAt ? { shippedAt } : {}),
        },
      });
      notify('Order updated.');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
    setSaving(false);
  }

  return (
    <Card title="Fulfilment">
      <div className="a-form">
        <Field label="Status">
          <select className="a-input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Carrier">
          <input className="a-input" placeholder="e.g. UPS" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </Field>
        <Field label="Tracking number">
          <input className="a-input" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </Field>
        <Field label="Internal notes" hint="Only visible to the team.">
          <textarea className="a-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Button onClick={save} busy={saving}>
          Save changes
        </Button>
      </div>
    </Card>
  );
}
