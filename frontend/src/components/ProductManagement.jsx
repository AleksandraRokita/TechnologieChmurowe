import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const allowedRoles = ['admin', 'worker'];

const initialFormData = {
  name: '',
  price: '',
  stock: '',
};

function formatMoney(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value;
  }

  return amount.toFixed(2);
}

function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const canManageProducts = allowedRoles.includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const loadProducts = useCallback(async () => {
    if (!canManageProducts) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }, [canManageProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (formError) {
      setFormError('');
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    const hasInvalidValues =
      !payload.name || Number.isNaN(payload.price) || Number.isNaN(payload.stock);

    if (hasInvalidValues) {
      setFormError('Fill in name, price and stock.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/products', payload);
      setFormData(initialFormData);
      await loadProducts();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.error || 'Could not create product.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockChange = async (productId, stock) => {
    try {
      setSavingId(productId);
      const response = await api.put(`/products/${productId}`, {
        stock: Number(stock),
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? response.data : product,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || 'Could not update stock.',
      );
    } finally {
      setSavingId(null);
    }
  };

  const handlePriceChange = async (productId, price) => {
    try {
      setSavingId(productId);
      const response = await api.put(`/products/${productId}/price`, {
        price: Number(price),
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? response.data : product,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || 'Could not update price.',
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setSavingId(productId);
      await api.delete(`/products/${productId}`);
      setProducts((current) =>
        current.filter((product) => product.id !== productId),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || 'Could not delete product.',
      );
    } finally {
      setSavingId(null);
    }
  };

  if (!canManageProducts) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-surface/70">
        <div className="rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-text-primary">
            Products are available only for admin and worker roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">New product</h2>
        </div>

        <form onSubmit={handleCreateProduct} className="flex flex-1 flex-col gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">
              Name
            </span>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:bg-surface"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">
              Price
            </span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleFormChange}
              className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:bg-surface"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">
              Stock
            </span>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleFormChange}
              className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:bg-surface"
            />
          </label>

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
              {isSubmitting ? 'Saving...' : 'Create product'}
            </button>
          </div>
        </form>
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Products</h2>
          </div>
          <button
            type="button"
            onClick={loadProducts}
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
          ) : products.length === 0 ? (
            <div className="grid min-h-full place-items-center rounded-[1.5rem] border border-dashed border-border bg-secondary">
              <p className="text-sm text-text-secondary">No products yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-[1.5rem] border border-border bg-secondary p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Product #{product.id}
                      </p>
                      <h3 className="mt-1 truncate text-lg font-semibold text-text-primary">
                        {product.name}
                      </h3>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[120px_120px_auto]">
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          Stock
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={product.stock}
                          disabled={savingId === product.id}
                          onBlur={(event) =>
                            handleStockChange(product.id, event.target.value)
                          }
                          className="w-full rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          Price
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={formatMoney(product.price)}
                          disabled={!isAdmin || savingId === product.id}
                          onBlur={(event) =>
                            isAdmin && handlePriceChange(product.id, event.target.value)
                          }
                          className="w-full rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-secondary"
                        />
                      </label>

                      <div className="flex items-end">
                        <button
                          type="button"
                          disabled={!isAdmin || savingId === product.id}
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-full rounded-2xl border border-danger-border bg-surface px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger-bg disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductManagement;
