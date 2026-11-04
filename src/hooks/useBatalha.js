import { useCallback, useEffect, useReducer } from 'react'
import { batalhaReducer, estadoInicial } from '../game/batalhaReducer'
import { CONFIG } from '../game/regras'

export function useBatalha(jogador, rival, dificuldadeId) {
  const [estado, dispatch] = useReducer(batalhaReducer, undefined, () => estadoInicial(jogador, rival, dificuldadeId))
  const rodando = estado.status === 'rodando'

  // Relógio do jogo
  useEffect(() => {
    if (!rodando) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), CONFIG.tickMs)
    return () => clearInterval(id)
  }, [rodando])

  // IA do rival: age em intervalos que dependem da dificuldade
  useEffect(() => {
    if (!rodando) return
    const id = setInterval(() => dispatch({ type: 'RIVAL_TURNO', r: Math.random() }), estado.dificuldade.intervaloRivalMs)
    return () => clearInterval(id)
  }, [rodando, estado.dificuldade])

  const agir = useCallback((tipo) => dispatch({ type: 'JOGADOR_AGE', tipo }), [])
  const pausar = useCallback(() => dispatch({ type: 'PAUSAR' }), [])
  const retomar = useCallback(() => dispatch({ type: 'RETOMAR' }), [])

  return { estado, agir, pausar, retomar }
}
