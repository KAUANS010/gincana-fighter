import { CONFIG, DIFICULDADES, calcularDano, escolherAcaoRival } from './regras'

const lutadorInicial = (dados) => ({
  dados,
  vida: dados.vida,
  energia: CONFIG.energiaInicial,
  combo: 0,
  defendeAte: 0,
  bloqueadoAte: 0,
  anim: 'idle',
  animAte: 0,
})

export function estadoInicial(jogador, rival, dificuldadeId) {
  return {
    dificuldade: DIFICULDADES[dificuldadeId] ?? DIFICULDADES.normal,
    jogador: lutadorInicial(jogador),
    rival: lutadorInicial(rival),
    relogio: 0, // tempo de jogo em ms (congela na pausa)
    tempoRestante: CONFIG.duracaoMs,
    comboMax: 0,
    pontos: 0,
    status: 'rodando', // rodando | pausado | fim
    vencedor: null, // 'jogador' | 'rival'
    log: { tipo: 'info', texto: 'Luta iniciada! Use A, S e D.' },
    popup: null,
    impacto: null, // último golpe: mostra o dano flutuando sobre quem apanhou
    seq: 0,
  }
}

const NOMES = { atacar: 'atacou', especial: 'usou o especial em' }

function finalizar(estado, vencedor) {
  let pontos = estado.pontos
  if (vencedor === 'jogador') {
    const segundos = Math.ceil(estado.tempoRestante / 1000)
    const bonus = CONFIG.bonusVitoria + segundos * CONFIG.bonusPorSegundo + estado.jogador.vida * CONFIG.bonusPorVida
    pontos += Math.round(bonus * estado.dificuldade.multPontos)
  }
  return { ...estado, status: 'fim', vencedor, pontos }
}

function agir(estado, quem, tipo) {
  if (estado.status !== 'rodando') return estado
  const outro = quem === 'jogador' ? 'rival' : 'jogador'
  const a = estado[quem]
  const d = estado[outro]
  if (a.bloqueadoAte > estado.relogio) return estado
  if (tipo === 'especial' && a.energia < CONFIG.custoEspecial) {
    return quem === 'jogador'
      ? { ...estado, log: { tipo: 'aviso', texto: `Energia insuficiente: o especial custa ${CONFIG.custoEspecial}.` } }
      : estado
  }

  const cooldown = quem === 'jogador' ? CONFIG.cooldownJogadorMs : 0

  if (tipo === 'defender') {
    return {
      ...estado,
      [quem]: { ...a, defendeAte: estado.relogio + CONFIG.duracaoDefesaMs, bloqueadoAte: estado.relogio + cooldown, anim: 'defend', animAte: estado.relogio + CONFIG.duracaoDefesaMs },
      log: { tipo: 'info', texto: `${a.dados.nome} defendeu.` },
    }
  }

  const defendendo = d.defendeAte > estado.relogio
  const mult = quem === 'rival' ? estado.dificuldade.danoRival : 1
  const dano = calcularDano(a.dados, d.dados, tipo, defendendo, mult)
  const novaVidaDefensor = Math.max(0, d.vida - dano)
  const energia = tipo === 'especial'
    ? a.energia - CONFIG.custoEspecial
    : Math.min(CONFIG.energiaMax, a.energia + CONFIG.ganhoEnergiaAtaque)

  const combo = defendendo ? 0 : a.combo + 1
  let pontos = estado.pontos
  let popup = estado.popup
  if (quem === 'jogador' && !defendendo) {
    const ganho = Math.round(CONFIG.pontosPorAcerto * combo * estado.dificuldade.multPontos * (tipo === 'especial' ? 2 : 1))
    pontos += ganho
    popup = { texto: `Acertou! +${ganho}`, id: estado.relogio }
  }

  const texto = defendendo
    ? `${d.dados.nome} defendeu! ${a.dados.nome} causou só ${dano} de dano e o combo foi quebrado.`
    : `Golpe certeiro! ${a.dados.nome} ${NOMES[tipo]} ${d.dados.nome} e tirou ${dano} de vida.`

  const novo = {
    ...estado,
    [quem]: { ...a, energia, combo, bloqueadoAte: estado.relogio + cooldown, anim: tipo === 'especial' ? 'special' : 'attack', animAte: estado.relogio + 600 },
    [outro]: { ...d, vida: novaVidaDefensor, combo: defendendo ? d.combo : 0, anim: 'hit', animAte: estado.relogio + 400 },
    comboMax: quem === 'jogador' ? Math.max(estado.comboMax, combo) : estado.comboMax,
    pontos,
    popup,
    seq: estado.seq + 1,
    impacto: {
      seq: estado.seq + 1,
      em: estado.relogio,
      alvo: outro,
      texto: defendendo ? `🛡 -${dano}` : `-${dano}`,
      tipo: defendendo ? 'bloqueado' : tipo === 'especial' ? 'especial' : 'dano',
    },
    log: { tipo: defendendo ? 'aviso' : quem === 'jogador' ? 'acerto' : 'dano', texto },
  }
  return novaVidaDefensor <= 0 ? finalizar(novo, quem) : novo
}

export function batalhaReducer(estado, acao) {
  switch (acao.type) {
    case 'TICK': {
      if (estado.status !== 'rodando') return estado
      const tempoRestante = Math.max(0, estado.tempoRestante - CONFIG.tickMs)
      const novo = { ...estado, relogio: estado.relogio + CONFIG.tickMs, tempoRestante }
      if (tempoRestante > 0) return novo
      return finalizar(novo, novo.jogador.vida > novo.rival.vida ? 'jogador' : 'rival')
    }
    case 'JOGADOR_AGE':
      return agir(estado, 'jogador', acao.tipo)
    case 'RIVAL_TURNO':
      return agir(estado, 'rival', escolherAcaoRival(estado.dificuldade, estado.rival.energia, acao.r))
    case 'PAUSAR':
      return estado.status === 'rodando' ? { ...estado, status: 'pausado' } : estado
    case 'RETOMAR':
      return estado.status === 'pausado' ? { ...estado, status: 'rodando' } : estado
    default:
      return estado
  }
}
