import { useMemo, useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { Icon } from '../components/Icon';
import { Badge, EmptyState, ErrorNotice, Spinner } from '../components/ui';
import { ordersQuery, useLiveQuery } from '../lib/data';
import { date, money, titleCase } from '../lib/format';
import { ORDER_STATUSES, type OrderDoc, type OrderStatus } from '../lib/types';

export default function OrdersPage() {
  return (
    <AdminShell title="Orders" description="Every order with the customer and shipping details.">
      <OrderTable />
    </AdminShell>
  );
}

function OrderTable() {
  const orders = useLiveQuery<OrderDoc>(() => ordersQuery(500));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (orders.data ?? []).filter(
      (o) =>
        (!status || o.status === status) &&
        (!term || [o.number, o.customer.name, o.customer.email].some((v) => v.toLowerCase().includes(term))),
    );
  }, [orders.data, search, status]);

  if (orders.loading) return <Spinner />;
  if (orders.data.length === 0) {
    return <EmptyState title="No orders yet" text="Orders appear here as soon as customers check out." />;
  }

  return (
    <div className="a-card a-card--flush">
      <ErrorNotice error={orders.error} />
      <div className="a-toolbar">
        <label className="a-search">
          <Icon name="search" size={16} />
          <input className="a-input" placeholder="Search order, name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
        </label>
        <select className="a-input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')} aria-label="Filter by status">
          <option value="">Any status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Date</th>
              <th scope="col">Customer</th>
              <th scope="col">Ship to</th>
              <th scope="col">Status</th>
              <th scope="col" className="a-num">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} onClick={() => (window.location.href = `/admin/orders/view/?id=${o.id}`)}>
                <td>
                  <a href={`/admin/orders/view/?id=${o.id}`}>
                    <strong>{o.number}</strong>
                  </a>
                </td>
                <td>{date(o.createdAt)}</td>
                <td>
                  <span className="a-stacked">
                    {o.customer.name}
                    <span className="a-muted">{o.customer.email}</span>
                  </span>
                </td>
                <td>
                  {o.shippingAddress.city}, {o.shippingAddress.region}
                </td>
                <td>
                  <Badge value={o.status} />
                </td>
                <td className="a-num">{money(o.totals.total, o.totals.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="a-muted a-pad">No orders match these filters.</p>}
      </div>
    </div>
  );
}
