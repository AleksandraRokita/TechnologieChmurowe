import { authClient } from '../api/lib/auth-client';

export function useAuth() {
  const sessionState = authClient.useSession();
  const sessionData = sessionState.data ?? null;

  return {
    user: sessionData?.user ?? null,
    session: sessionData?.session ?? null,
    isAuthenticated: Boolean(sessionData?.session),
    isLoading: sessionState.isPending,
    refetchSession: sessionState.refetch,
  };
}
