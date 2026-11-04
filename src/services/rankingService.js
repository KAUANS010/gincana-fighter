import { supabase } from './supabaseClient'

// Ranking público, do maior para o menor recorde.
export async function buscarRanking(limite = 50) {
  const { data, error } = await supabase
    .from('ranking')
    .select('user_id, display_name, personagem, pontuacao')
    .order('pontuacao', { ascending: false })
    .order('updated_at', { ascending: true }) // desempate: quem chegou primeiro
    .limit(limite)
  if (error) throw new Error('Não foi possível carregar o ranking.')
  return data
}

export async function buscarRecorde(userId) {
  const { data, error } = await supabase
    .from('ranking')
    .select('pontuacao, personagem')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error('Não foi possível consultar seu recorde.')
  return data // null se o jogador ainda não tem recorde
}

// Cria o registro do jogador ou atualiza o recorde se a nova pontuação for maior.
// Retorna { novoRecorde, recorde } (recorde = melhor pontuação depois da operação).
export async function registrarPontuacao({ userId, nomeExibicao, personagem, pontuacao }) {
  const atual = await buscarRecorde(userId)

  if (!atual) {
    const { error } = await supabase.from('ranking').insert({
      user_id: userId,
      display_name: nomeExibicao,
      personagem,
      pontuacao,
    })
    if (error) throw new Error('Não foi possível salvar sua pontuação.')
    return { novoRecorde: true, recorde: pontuacao }
  }

  if (pontuacao > atual.pontuacao) {
    const { error } = await supabase
      .from('ranking')
      .update({ pontuacao, personagem })
      .eq('user_id', userId)
    if (error) throw new Error('Não foi possível atualizar seu recorde.')
    return { novoRecorde: true, recorde: pontuacao }
  }

  return { novoRecorde: false, recorde: atual.pontuacao }
}
