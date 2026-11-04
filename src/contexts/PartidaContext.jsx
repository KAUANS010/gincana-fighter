import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const PartidaContext = createContext(null)

// Dados da partida compartilhados entre Seleção, Batalha, Resultado, Login e Cadastro.
// A pontuação pendente (partida terminada e ainda não salva) vive só em memória:
// nada é gravado em localStorage ou similar.
export function PartidaProvider({ children }) {
  const [selecao, setSelecao] = useState(null) // { personagemId, dificuldadeId }
  const [partida, setPartida] = useState(null) // resultado da última partida

  const registrarPartida = useCallback((dados) => {
    setPartida({ ...dados, id: Date.now(), salva: false, novoRecorde: false })
  }, [])

  const marcarSalva = useCallback((novoRecorde, recorde) => {
    setPartida((p) => (p ? { ...p, salva: true, novoRecorde, recorde } : p))
  }, [])

  const valor = useMemo(
    () => ({
      selecao,
      setSelecao,
      partida,
      registrarPartida,
      marcarSalva,
      pontuacaoPendente: Boolean(partida && !partida.salva),
    }),
    [selecao, partida, registrarPartida, marcarSalva],
  )

  return <PartidaContext.Provider value={valor}>{children}</PartidaContext.Provider>
}

export function usePartida() {
  const ctx = useContext(PartidaContext)
  if (!ctx) throw new Error('usePartida deve ser usado dentro de <PartidaProvider>')
  return ctx
}
