import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Lutador from '../components/Lutador'
import { useAuth } from '../contexts/AuthContext'
import { usePartida } from '../contexts/PartidaContext'
import { buscarPersonagem } from '../game/personagens'
import { registrarPontuacao } from '../services/rankingService'

const formatarTempo = (ms) => {
  const total = Math.ceil(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export default function Resultado() {
  const { partida } = usePartida()
  if (!partida) return <Navigate to="/" replace />
  return <TelaResultado partida={partida} />
}

function TelaResultado({ partida }) {
  const navigate = useNavigate()
  const { user, nomeExibicao } = useAuth()
  const { selecao, marcarSalva } = usePartida()
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const tentativaRef = useRef(null)

  const vitoria = partida.resultado === 'vitoria'
  const jogador = buscarPersonagem(partida.personagemId)
  const rival = buscarPersonagem(partida.rivalId)

  // Com sessão ativa, registra a pontuação pendente (cria o recorde ou atualiza se for maior).
  useEffect(() => {
    const chave = `${partida.id}-${tentativa}`
    if (!user || partida.salva || tentativaRef.current === chave) return
    tentativaRef.current = chave
    setSalvando(true)
    setErro('')
    registrarPontuacao({
      userId: user.id,
      nomeExibicao: nomeExibicao ?? 'Jogador',
      personagem: jogador.nome,
      pontuacao: partida.pontos,
    })
      .then(({ novoRecorde, recorde }) => marcarSalva(novoRecorde, recorde))
      .catch((e) => setErro(e.message))
      .finally(() => setSalvando(false))
  }, [user, partida, tentativa, nomeExibicao, jogador.nome, marcarSalva])

  function tentarSalvarDeNovo() {
    setTentativa((t) => t + 1)
  }

  return (
    <main className="tela tela-resultado">
      <h1 className={`titulo-resultado ${vitoria ? 'vitoria' : 'derrota'}`}>{vitoria ? 'Vitória!' : 'Derrota'}</h1>
      <p className="vencedor">{vitoria ? jogador.nome : rival.nome} venceu a batalha</p>

      <section className="cartao-resultado">
        <span className="rotulo">Pontuação final</span>
        <strong className={`pontuacao-final ${vitoria ? 'ouro' : ''}`}>{partida.pontos.toLocaleString('pt-BR')} pts</strong>

        {partida.salva && partida.novoRecorde && <span className="selo-recorde pequeno">🏆 Novo recorde</span>}
        {partida.salva && !partida.novoRecorde && (
          <span className="faltam">
            {partida.recorde - partida.pontos > 0
              ? `Faltam ${(partida.recorde - partida.pontos).toLocaleString('pt-BR')} pts para bater seu recorde`
              : 'Mesma pontuação do seu recorde'}
          </span>
        )}
        {salvando && <span className="faltam">Salvando no ranking...</span>}

        <div className="estatisticas">
          <div><strong>x{partida.comboMax}</strong><span>Combo máximo</span></div>
          <div>
            <strong>{formatarTempo(vitoria ? partida.tempoRestanteMs : partida.tempoLutaMs)}</strong>
            <span>{vitoria ? 'Tempo restante' : 'Tempo de luta'}</span>
          </div>
          <div><strong>{partida.vidaFinal}</strong><span>Vida final</span></div>
        </div>

        {!vitoria && <p className="dica-resultado">Dica: use Defender quando a energia do rival passar de 40.</p>}
      </section>

      {!user && (
        <section className="aviso-salvar" aria-live="polite">
          <p>Para registrar essa pontuação no ranking, entre na sua conta ou cadastre-se. Ela fica guardada enquanto você faz isso.</p>
          <div className="linha-botoes">
            <Link to="/login" state={{ de: '/resultado' }} className="btn btn-primario">Entrar</Link>
            <Link to="/cadastro" state={{ de: '/resultado' }} className="btn">Cadastrar</Link>
          </div>
        </section>
      )}

      {user && partida.salva && <p className="ok-salvo">✔ Pontuação registrada no ranking.</p>}
      {erro && (
        <p className="erro-geral" role="alert">
          {erro}{' '}
          <button type="button" className="link" onClick={tentarSalvarDeNovo}>Tentar de novo</button>
        </p>
      )}

      <div className="linha-botoes coluna">
        <button type="button" className="btn btn-primario" onClick={() => navigate(selecao ? '/batalha' : '/selecao')}>
          ↻ {vitoria ? 'Jogar novamente' : 'Tentar novamente'}
        </button>
        {user && partida.salva && <Link to="/ranking" className="btn">Ver ranking</Link>}
        <Link to="/" className="btn">Voltar ao menu</Link>
      </div>

      <div className="palco-resultado" aria-hidden="true">
        <Lutador personagem={jogador} estado={vitoria ? 'win' : 'lose'} />
        <Lutador personagem={rival} estado={vitoria ? 'lose' : 'win'} espelhar />
      </div>
    </main>
  )
}
