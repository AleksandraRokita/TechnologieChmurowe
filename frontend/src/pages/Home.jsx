import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../api/lib/auth-client";
import OrderManagement from "../components/OrderManagement";
import ProductManagement from "../components/ProductManagement";
import UserManagement from "../components/UserManagement";
import { useAuth } from "../hooks/useAuth";

const tabsByRole = {
  admin: ["Orders", "Products", "Users"],
  worker: ["Orders", "Products"],
};

function AccessScreen() {
  return (
    <div className="grid h-full min-h-0 place-items-center">
      <div className="w-full max-w-xl rounded-[1.75rem] border border-dashed border-border bg-white/45 p-8 text-center shadow-inner shadow-white">
        <h2 className="text-2xl font-semibold text-text-primary">Waiting for access</h2>
        <p className="mt-3 text-sm text-text-secondary">
          Your account does not have access to management tabs yet.
        </p>
      </div>
    </div>
  );
}

function HomePage() {
  const { user } = useAuth();
  const role = user?.role || '';
  const displayName = user?.name || 'User';
  const displayRole = role || 'no access';
  const tabs = tabsByRole[role] || [];
  const defaultTab = tabs[0] || null;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const allowedTabs = tabsByRole[role] || [];

    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [activeTab, defaultTab, role]);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      navigate("/login", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] p-4 text-text-primary sm:p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-border-strong bg-surface-soft shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:flex-row">
        <aside className="flex w-full flex-col border-b border-border bg-primary px-4 py-5 text-text-inverse sm:px-5 lg:max-w-xs lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold uppercase text-text-inverse">
              {displayName.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-inverse">
                {displayName}
              </p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-text-inverse-soft">
                {displayRole}
              </p>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-surface text-text-primary shadow-lg shadow-black/10"
                      : "text-text-inverse-soft hover:bg-white/8 hover:text-text-inverse"
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-success" : "bg-slate-700"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-text-inverse-soft transition hover:bg-white/10 hover:text-text-inverse disabled:cursor-not-allowed disabled:opacity-60 lg:mt-auto"
          >
            {isSigningOut ? "Signing out..." : "Logout"}
          </button>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(241,245,249,0.9))]">
          <div className="h-full min-h-0 p-6 sm:p-10">
            {activeTab === "Orders" ? (
              <OrderManagement />
            ) : activeTab === "Products" ? (
              <ProductManagement />
            ) : activeTab === "Users" ? (
              <UserManagement />
            ) : (
              <AccessScreen />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
