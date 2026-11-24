import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const demoUsers = [
  {
    id: 'demo-user-1',
    email: 'aluno@gincana.com',
    password: '123456',
    display_name: 'Ninja do Folclore',
  },
];

let inMemorySession = null;
let inMemoryRanking = [];

const getDisplayName = (sessionOrUser) => {
  const metadataName = sessionOrUser?.user_metadata?.display_name;
  const profileName = sessionOrUser?.display_name;
  const emailName = sessionOrUser?.email?.split('@')[0];

  return metadataName || profileName || emailName || 'Jogador';
};

export async function getCurrentSession() {
  if (!supabase) {
    return { session: inMemorySession, profile: inMemorySession?.user ?? null };
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, profile: null, error };
  }

  const profile = data.session?.user
    ? { display_name: getDisplayName(data.session.user) }
    : null;

  return { session: data.session, profile, error: null };
}

export async function signUp({ email, password, displayName }) {
  if (!supabase) {
    const existingUser = demoUsers.find((user) => user.email === email);

    if (existingUser) {
      return { error: { message: 'Usuário já cadastrado. Tente fazer login.' } };
    }

    const profile = {
      id: `demo-user-${Date.now()}`,
      email,
      display_name: displayName,
      password,
    };

    demoUsers.push(profile);
    inMemorySession = {
      access_token: 'demo-session-token',
      user: {
        id: profile.id,
        email: profile.email,
        user_metadata: { display_name: profile.display_name },
      },
    };

    return {
      session: inMemorySession,
      profile: { display_name: profile.display_name },
      user: inMemorySession.user,
      error: null,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { error };
  }

  return {
    session: data.session,
    user: data.user,
    profile: data.user ? { display_name: getDisplayName(data.user) } : null,
    error: null,
  };
}

export async function signIn({ email, password }) {
  if (!supabase) {
    const user = demoUsers.find(
      (candidate) => candidate.email === email && candidate.password === password
    );

    if (!user) {
      return { error: { message: 'Credenciais inválidas. Verifique e-mail e senha.' } };
    }

    inMemorySession = {
      access_token: 'demo-session-token',
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { display_name: user.display_name },
      },
    };

    return {
      session: inMemorySession,
      user: inMemorySession.user,
      profile: { display_name: user.display_name },
      error: null,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error };
  }

  return {
    session: data.session,
    user: data.user,
    profile: data.user ? { display_name: getDisplayName(data.user) } : null,
    error: null,
  };
}

export async function signOut() {
  if (!supabase) {
    inMemorySession = null;
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function fetchRanking() {
  if (!supabase) {
    return {
      data: [...inMemoryRanking].sort((a, b) => b.score - a.score).slice(0, 10),
      error: null,
    };
  }

  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  return { data: data ?? [], error };
}

export async function submitPlayerScore({ userId, displayName, score }) {
  if (!userId || !Number.isFinite(score)) {
    return { error: { message: 'Pontuação inválida.' } };
  }

  if (!supabase) {
    const previous = inMemoryRanking.find((record) => record.user_id === userId);

    if (previous) {
      if (score <= previous.score) {
        return {
          data: previous,
          error: null,
          message: 'Pontuação inferior ao recorde atual, então não foi sobrescrita.',
        };
      }

      previous.score = score;
      previous.display_name = displayName;
      previous.updated_at = new Date().toISOString();
      return { data: previous, error: null };
    }

    const record = {
      id: `demo-${Date.now()}`,
      user_id: userId,
      display_name: displayName,
      score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryRanking.push(record);
    return { data: record, error: null };
  }

  const { data, error } = await supabase
    .from('ranking')
    .select('score, user_id, display_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { error };
  }

  if (!data) {
    const insertResult = await supabase.from('ranking').insert({
      user_id: userId,
      display_name: displayName,
      score,
    });

    return insertResult;
  }

  if (score <= data.score) {
    return { data, error: null, message: 'Pontuação inferior ao recorde atual, então não foi sobrescrita.' };
  }

  const updateResult = await supabase
    .from('ranking')
    .update({ score, display_name: displayName, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  return updateResult;
}
