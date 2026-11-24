import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContextValue';
import {
  getCurrentSession,
  signIn,
  signOut,
  signUp,
  submitPlayerScore,
} from '../services/supabaseService';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingScore, setPendingScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const current = await getCurrentSession();
        setSession(current?.session ?? null);
        setProfile(current?.profile ?? null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const persistPendingScore = async (scoreValue) => {
    if (!Number.isFinite(scoreValue) || scoreValue <= 0) {
      return { saved: false, pending: false };
    }

    if (!session) {
      setPendingScore(scoreValue);
      return { saved: false, pending: true };
    }

    const userDisplayName =
      profile?.display_name ||
      session.user?.user_metadata?.display_name ||
      session.user?.email?.split('@')[0] ||
      'Jogador';

    const result = await submitPlayerScore({
      userId: session.user.id,
      displayName: userDisplayName,
      score: scoreValue,
    });

    if (!result?.error) {
      setPendingScore(null);
    }

    return { saved: !result?.error, pending: false, data: result };
  };

  const login = async ({ email, password }) => {
    const result = await signIn({ email, password });

    if (!result?.error && result.session) {
      setSession(result.session);
      setProfile(result.profile ?? null);

      if (pendingScore) {
        await persistPendingScore(pendingScore);
      }
    }

    return result;
  };

  const register = async ({ email, password, displayName }) => {
    const result = await signUp({ email, password, displayName });

    if (!result?.error && result.session) {
      setSession(result.session);
      setProfile(result.profile ?? null);

      if (pendingScore) {
        await persistPendingScore(pendingScore);
      }
    }

    return result;
  };

  const logout = async () => {
    await signOut();
    setSession(null);
    setProfile(null);
    setPendingScore(null);
  };

  const registerScore = async (scoreValue) => {
    if (!session) {
      setPendingScore(scoreValue);
      return { saved: false, pending: true };
    }

    return persistPendingScore(scoreValue);
  };

  const value = {
    session,
    profile,
    pendingScore,
    setPendingScore,
    loading,
    login,
    register,
    logout,
    registerScore,
    persistPendingScore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
