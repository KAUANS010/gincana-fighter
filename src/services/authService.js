import { supabase } from './supabaseClient'

const MENSAGENS = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  'User already registered': 'Este e-mail já está cadastrado.',
}

function traduzir(error) {
  return new Error(MENSAGENS[error.message] ?? 'Não foi possível concluir. Tente novamente.')
}

export async function obterSessao() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function observarSessao(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => callback(sessao))
  return () => data.subscription.unsubscribe()
}

// O nome de exibição é guardado nos metadados do usuário (user_metadata.display_name).
export async function cadastrar({ email, senha, nome }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { display_name: nome } },
  })
  if (error) throw traduzir(error)
  // Com confirmação de e-mail ligada, e-mail repetido volta sem erro e sem identities.
  if (data.user && data.user.identities?.length === 0) throw new Error(MENSAGENS['User already registered'])
  return { sessao: data.session }
}

export async function entrar({ email, senha }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw traduzir(error)
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw traduzir(error)
}
