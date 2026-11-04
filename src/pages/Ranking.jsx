import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buscarPersonagem } from '../game/personagens'
import { buscarRanking } from '../services/rankingService'

const medalha = (pos) => (pos <= 3 ? ['🥇', '🥈', '🥉'][pos - 1] : null)

export default function Ranking() {
  const { user } = useAuth()
  const [linhas, setLinhas] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    buscarRanking()
      .then((dados) => ativo && setLinhas(dados))
      .catch((e) => ativo && setErro(e.message))
    return () => {
      ativo = false
    }
  }, [])

  return (
    <main className="tela tela-conteudo">
      <h1>Ranking</h1>
      <p className="subtitulo-pagina">Melhores pontuações registradas.</p>

      {erro && <p className="erro-geral" role="alert">{erro}</p>}
      {!erro && linhas === null && <p className="legenda">Carregando ranking...</p>}
      {linhas && linhas.length === 0 && <p className="legenda">Ainda não há pontuações. Jogue uma partida e seja o primeiro!</p>}

      {linhas && linhas.length > 0 && (
        <ol className="ranking">
          <li className="ranking-cabecalho" aria-hidden="true">
            <span>Pos.</span><span>Jogador</span><span>Personagem</span><span>Pontos</span>
          </li>
          {linhas.map((l, i) => {
            const pos = i + 1
            const personagem = buscarPersonagem(String(l.personagem).toLowerCase())
            const voce = user?.id === l.user_id
            return (
              <li key={l.user_id} className={`ranking-linha ${voce ? 'voce' : ''} ${pos <= 3 ? 'podio' : ''}`}>
                <span className="pos">{medalha(pos) ?? `${pos}º`}</span>
                <span className="jogador">
                  {l.display_name} {voce && <em className="selo-voce">você</em>}
                </span>
                <span className="personagem">
                  <i className="ponto" style={{ background: personagem?.cor ?? '#888' }} />
                  {l.personagem}
                </span>
                <span className="pts">{l.pontuacao.toLocaleString('pt-BR')}</span>
              </li>
            )
          })}
        </ol>
      )}

      <Link to="/" className="btn btn-voltar">← Voltar ao menu</Link>
    </main>
  )
}
