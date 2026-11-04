// Atributos vindos do protótipo de APS (tela "Escolha seu guerreiro").
export const PERSONAGENS = [
  { id: 'kael',  nome: 'Kael',  elemento: 'Chamas',  estilo: 'Ofensivo',    vida: 100, ataque: 90, defesa: 70, cor: '#ff6a3d', icone: '🔥' },
  { id: 'nyra',  nome: 'Nyra',  elemento: 'Gelo',    estilo: 'Defensivo',   vida: 100, ataque: 55, defesa: 85, cor: '#4cc2ff', icone: '❄️' },
  { id: 'zarek', nome: 'Zarek', elemento: 'Raios',   estilo: 'Velocidade',  vida: 100, ataque: 70, defesa: 60, cor: '#ffc93c', icone: '⚡' },
  { id: 'veyra', nome: 'Veyra', elemento: 'Sombras', estilo: 'Equilibrado', vida: 100, ataque: 70, defesa: 70, cor: '#a468ff', icone: '🌙' },
]

export const buscarPersonagem = (id) => PERSONAGENS.find((p) => p.id === id)

// O rival é sorteado entre os personagens que o jogador não escolheu.
export function sortearRival(idJogador) {
  const opcoes = PERSONAGENS.filter((p) => p.id !== idJogador)
  return opcoes[Math.floor(Math.random() * opcoes.length)]
}
