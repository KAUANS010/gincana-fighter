import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const SomContext = createContext(null)

const TONS = { atacar: 220, defender: 160, especial: 440, dano: 120, fim: 330 }

// Sons simples gerados pelo navegador (sem arquivos de áudio).
export function SomProvider({ children }) {
  const [ativo, setAtivo] = useState(true)
  const audioRef = useRef(null)

  const tocar = useCallback(
    (tipo) => {
      if (!ativo) return
      try {
        audioRef.current ??= new (window.AudioContext || window.webkitAudioContext)()
        const ctx = audioRef.current
        const osc = ctx.createOscillator()
        const ganho = ctx.createGain()
        osc.frequency.value = TONS[tipo] ?? 200
        osc.type = tipo === 'especial' ? 'sawtooth' : 'square'
        ganho.gain.setValueAtTime(0.05, ctx.currentTime)
        ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
        osc.connect(ganho).connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } catch {
        // Sem suporte a áudio: o jogo segue sem som.
      }
    },
    [ativo],
  )

  const valor = useMemo(() => ({ ativo, alternar: () => setAtivo((a) => !a), tocar }), [ativo, tocar])
  return <SomContext.Provider value={valor}>{children}</SomContext.Provider>
}

export function useSom() {
  const ctx = useContext(SomContext)
  if (!ctx) throw new Error('useSom deve ser usado dentro de <SomProvider>')
  return ctx
}
