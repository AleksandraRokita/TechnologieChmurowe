import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const roleOptions = ['admin', 'worker', 'user'];

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (accountId, role) => {
    try {
      setSavingId(accountId);
      const response = await api.put(`/users/change/${accountId}/userrole`, {
        role,
      });

      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.account_id === accountId ? response.data : currentUser,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || 'Could not update user role.',
      );
    } finally {
      setSavingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-surface/70">
        <div className="rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-text-primary">
            Users are available only for admin role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-5 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Users</h2>

        </div>
        <button
          type="button"
          onClick={loadUsers}
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
        ) : users.length === 0 ? (
          <div className="grid min-h-full place-items-center rounded-[1.5rem] border border-dashed border-border bg-secondary">
            <p className="text-sm text-text-secondary">No users found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-border">
            <div className="hidden grid-cols-[0.7fr_1.1fr_1.1fr_0.9fr] gap-3 border-b border-border bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary md:grid">
              <span>ID</span>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
            </div>

            <div className="divide-y divide-border">
              {users.map((listedUser) => (
                <div
                  key={listedUser.id}
                  className="grid gap-3 px-4 py-4 text-sm text-text-primary md:grid-cols-[0.7fr_1.1fr_1.1fr_0.9fr] md:items-center"
                >
                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      ID
                    </span>
                    <p className="mt-1 font-semibold">{listedUser.account_id}</p>
                  </div>
                  <span className="hidden font-semibold md:block">
                    {listedUser.account_id}
                  </span>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Name
                    </span>
                    <p className="mt-1">{listedUser.name}</p>
                  </div>
                  <span className="hidden md:block">{listedUser.name}</span>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Email
                    </span>
                    <p className="mt-1 break-all">{listedUser.email}</p>
                  </div>
                  <span className="hidden break-all md:block">{listedUser.email}</span>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary md:hidden">
                      Role
                    </span>
                    <select
                      value={listedUser.role}
                      disabled={savingId === listedUser.account_id}
                      onChange={(event) =>
                        handleRoleChange(listedUser.account_id, event.target.value)
                      }
                      className="w-full rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
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
  );
}

export default UserManagement;
