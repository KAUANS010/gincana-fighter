// Regras do jogo. APS não define fórmulas numéricas, então elas ficam todas aqui:
// para balancear a partida basta mexer neste arquivo.
export const CONFIG = {
  duracaoMs: 60000,
  energiaInicial: 50,
  energiaMax: 100,
  ganhoEnergiaAtaque: 10,
  custoEspecial: 40,
  reducaoDefesa: 0.7, // Defender reduz 70% do dano (tela "Como jogar")
  duracaoDefesaMs: 1000,
  cooldownJogadorMs: 700,
  pontosPorAcerto: 50, // pontos = 50 x combo x multiplicador da dificuldade
  bonusVitoria: 500,
  bonusPorSegundo: 10,
  bonusPorVida: 5,
  tickMs: 100,
}

export const DIFICULDADES = {
  facil:   { id: 'facil',   nome: 'Fácil',   intervaloRivalMs: 1700, danoRival: 0.8, multPontos: 1,   pesos: { atacar: 55, defender: 30, especial: 15 } },
  normal:  { id: 'normal',  nome: 'Normal',  intervaloRivalMs: 1200, danoRival: 1.2, multPontos: 1.5, pesos: { atacar: 55, defender: 25, especial: 20 } },
  dificil: { id: 'dificil', nome: 'Difícil', intervaloRivalMs: 800,  danoRival: 1.6, multPontos: 2,   pesos: { atacar: 50, defender: 25, especial: 25 } },
}

export function calcularDano(atacante, defensor, tipo, defendendo, multiplicador = 1) {
  let dano = atacante.ataque * 0.1 * (1 - defensor.defesa / 250)
  if (tipo === 'especial') dano *= 2
  if (defendendo) dano *= 1 - CONFIG.reducaoDefesa
  return Math.max(1, Math.round(dano * multiplicador))
}

// Escolhe a ação do rival a partir dos pesos da dificuldade e de um número aleatório (0 a 1).
export function escolherAcaoRival(dificuldade, energia, r) {
  const pesos = { ...dificuldade.pesos }
  if (energia < CONFIG.custoEspecial) pesos.especial = 0
  const total = pesos.atacar + pesos.defender + pesos.especial
  let alvo = r * total
  for (const tipo of ['atacar', 'defender', 'especial']) {
    if (alvo < pesos[tipo]) return tipo
    alvo -= pesos[tipo]
  }
  return 'atacar'
}
