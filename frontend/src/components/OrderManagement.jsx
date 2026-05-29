import { useCallback, useEffect, useState } from 'react';
import { createOrder, getOrders, orderStatuses, updateOrderStatus } from '../api/orders';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const allowedRoles = ['admin', 'worker'];

const emptyItem = { product_name: '', quantity: '1' };

function formatMoney(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value;
  }

  return amount.toFixed(2);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB');
}

function getOptionLabel(option, primary, secondary) {
  return secondary ? `${primary} - ${secondary}` : primary;
}

function OrderManagement() {s
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ ...emptyItem }],
  });

  const canManageOrders = allowedRoles.includes(user?.role);

  const loadOrders = useCallback(async () => {
    if (!canManageOrders) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, [canManageOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const loadOptions = async () => {
      if (!canManageOrders) {
        return;
      }

      try {
        const [usersResponse, productsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/products'),
        ]);

        setCustomers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.error || 'Could not load customers or products.',
        );
      }
    };

    loadOptions();
  }, [canManageOrders]);

  const handleCustomerChange = (event) => {
    setFormData((current) => ({
      ...current,
      customer_id: event.target.value,
    }));
    if (formError) {
      setFormError('');
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
    if (formError) {
      setFormError('');
    }
  };

  const addItemRow = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { ...emptyItem }],
    }));
  };

  const removeItemRow = (index) => {
    setFormData((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = {
      customer_id: Number(formData.customer_id),
      items: formData.items.map((item) => {
        const matchedProduct = products.find(
          (product) =>
            product.name.trim().toLowerCase() ===
            item.product_name.trim().toLowerCase(),
        );

        return {
          product_id: matchedProduct?.id ?? Number.NaN,
          quantity: Number(item.quantity),
        };
      }),
    };

    const hasInvalidValues =
      !payload.customer_id ||
      payload.items.some((item) => !item.product_id || !item.quantity);

    if (hasInvalidValues) {
      setFormError('Fill in customer id, product name and quantity.');
      setIsSubmitting(false);
      return;
    }

    try {
      await createOrder(payload);
      setFormData({
        customer_id: '',
        items: [{ ...emptyItem }],
      });
      await loadOrders();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.error || 'Could not create order.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setStatusSavingId(orderId);
      await updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, order_status: status } : order,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || 'Could not update order status.',
      );
    } finally {
      setStatusSavingId(null);
    }
  };

  if (!canManageOrders) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-surface/70">
        <div className="rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-text-primary">
            Orders are available only for admin and worker roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">New order</h2>
        </div>

        <form onSubmit={handleCreateOrder} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">
              Customer ID
            </span>
            <input
              type="text"
              list="customers-list"
              value={formData.customer_id}
              onChange={handleCustomerChange}
              className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:bg-surface"
              placeholder="Search customer"
            />
            <datalist id="customers-list">
              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.account_id}
                  label={getOptionLabel(customer.name, customer.email)}
                />
              ))}
            </datalist>
          </label>

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div
                key={`${index}-${item.product_name}`}
                className="rounded-2xl border border-border bg-secondary p-3"
              >
                <div className="min-w-0">
                  <input
                    type="text"
                    list={`products-list-${index}`}
                    placeholder="Search product"
                    value={item.product_name}
                    onChange={(event) =>
                      handleItemChange(index, 'product_name', event.target.value)
                    }
                    className="w-full min-w-0 rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary outline-none transition focus:border-primary"
                  />
                  <datalist id={`products-list-${index}`}>
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.name}
                        label={getOptionLabel(product.name, `stock: ${product.stock}`)}
                      />
                    ))}
                  </datalist>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[140px_auto] sm:items-end">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Quantity
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(index, 'quantity', event.target.value)
                      }
                      className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary outline-none transition focus:border-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    disabled={formData.items.length === 1}
                    className="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItemRow}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-text-muted hover:text-text-primary"
          >
            Add product
          </button>

          {formError ? (
            <p className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
              {formError}
            </p>
          ) : null}

          <div className="mt-auto shrink-0 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-text-muted"
            >
              {isSubmitting ? 'Saving...' : 'Create order'}
            </button>
          </div>
        </form>
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Orders</h2>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-text-muted hover:text-text-primary"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <p className="mb-4 rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="grid min-h-full place-items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="grid min-h-full place-items-center rounded-[1.5rem] border border-dashed border-border bg-secondary">
              <p className="text-sm text-text-secondary">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-border">
              <div className="hidden grid-cols-[0.8fr_0.9fr_1fr_1fr_1.1fr] gap-3 border-b border-border bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary md:grid">
                <span>Order</span>
                <span>Customer</span>
                <span>Date</span>
                <span>Total</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-3 px-4 py-4 text-sm text-text-primary md:grid-cols-[0.8fr_0.9fr_1fr_1fr_1.1fr] md:items-center"
                  >
                    <div className="md:hidden">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Order
                      </span>
                      <p className="mt-1 font-semibold">#{order.id}</p>
                    </div>
                    <span className="hidden font-semibold md:block">#{order.id}</span>

                    <div className="md:contents">
                      <div className="md:hidden">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          Customer
                        </span>
                        <p className="mt-1">{order.customer_id}</p>
                      </div>
                      <span className="hidden md:block">{order.customer_id}</span>

                      <div className="md:hidden">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          Date
                        </span>
                        <p className="mt-1">{formatDate(order.order_date)}</p>
                      </div>
                      <span className="hidden md:block">{formatDate(order.order_date)}</span>

                      <div className="md:hidden">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          Total
                        </span>
                        <p className="mt-1">{formatMoney(order.total_value)}</p>
                      </div>
                      <span className="hidden md:block">{formatMoney(order.total_value)}</span>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary md:hidden">
                        Status
                      </span>
                      <select
                        value={order.order_status}
                        disabled={statusSavingId === order.id}
                        onChange={(event) =>
                          handleStatusChange(order.id, event.target.value)
                        }
                        className="w-full rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default OrderManagement;
