import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

// Compartilha sessão e usuário com todas as páginas. A sessão em si é mantida
// pelo cliente do Supabase, o que garante a continuidade ao recarregar a página.
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    authService
      .obterSessao()
      .then(setSessao)
      .catch(() => setSessao(null))
      .finally(() => setCarregando(false))
    return authService.observarSessao(setSessao)
  }, [])

  const valor = useMemo(() => {
    const user = sessao?.user ?? null
    return {
      user,
      carregando,
      nomeExibicao: user?.user_metadata?.display_name ?? null,
      cadastrar: authService.cadastrar,
      entrar: authService.entrar,
      sair: authService.sair,
    }
  }, [sessao, carregando])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
