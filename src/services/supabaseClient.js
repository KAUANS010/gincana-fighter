import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigurado = Boolean(url && chave)

// Só a chave pública (anon) é usada no navegador. A segurança vem das políticas RLS do banco.
export const supabase = createClient(url ?? 'http://localhost', chave ?? 'sem-chave')
