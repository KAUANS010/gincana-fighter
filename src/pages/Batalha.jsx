import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import BarraStatus from '../components/BarraStatus'
import Lutador from '../components/Lutador'
import { useSom } from '../contexts/SomContext'
import { usePartida } from '../contexts/PartidaContext'
import { imagemDoCenario, sortearCenario } from '../game/cenarios'
import { buscarPersonagem, sortearRival } from '../game/personagens'
import { CONFIG } from '../game/regras'
import { useBatalha } from '../hooks/useBatalha'

export default function Batalha() {
  const { selecao } = usePartida()
  if (!selecao) return <Navigate to="/selecao" replace />
  return <Luta selecao={selecao} />
}

const TECLAS = { a: 'atacar', s: 'defender', d: 'especial' }

function animacaoDe(lutador, estado) {
  if (estado.status === 'fim') return (estado.vencedor === 'jogador') === (lutador === estado.jogador) ? 'win' : 'lose'
  if (lutador.animAte > estado.relogio) return lutador.anim
  return lutador.defendeAte > estado.relogio ? 'defend' : 'idle' // continua com o escudo enquanto a defesa vale
}

// Dano flutuando sobre quem levou o golpe (some depois de ~0,9 s)
function Impacto({ estado, alvo }) {
  const i = estado.impacto
  if (!i || i.alvo !== alvo || estado.relogio - i.em > 900) return null
  return (
    <span key={i.seq} className={`impacto ${i.tipo}`}>
      {i.texto}
    </span>
  )
}

function Luta({ selecao }) {
  const navigate = useNavigate()
  const { registrarPartida } = usePartida()
  const { tocar, ativo, alternar } = useSom()
  const [jogadorDados] = useState(() => buscarPersonagem(selecao.personagemId))
  const [rivalDados] = useState(() => sortearRival(selecao.personagemId))
  const [cenario] = useState(sortearCenario)
  const imagemCenario = imagemDoCenario(cenario.id)
  const { estado, agir, pausar, retomar } = useBatalha(jogadorDados, rivalDados, selecao.dificuldadeId)
  const { jogador, rival, status } = estado

  // Teclado: A, S, D e P/Esc para pausar
  useEffect(() => {
    function aoTeclar(e) {
      const tecla = e.key.toLowerCase()
      if (TECLAS[tecla]) {
        e.preventDefault()
        agir(TECLAS[tecla])
      } else if (tecla === 'p' || tecla === 'escape') {
        if (status === 'rodando') pausar()
        else if (status === 'pausado') retomar()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [agir, pausar, retomar, status])

  // Sons conforme o que aconteceu
  useEffect(() => {
    const mapa = { acerto: 'atacar', dano: 'dano', aviso: 'defender' }
    if (mapa[estado.log.tipo]) tocar(mapa[estado.log.tipo])
  }, [estado.log, tocar])

  // Fim da luta: guarda o resultado em memória e vai para a tela de resultado
  useEffect(() => {
    if (status !== 'fim') return
    tocar('fim')
    const id = setTimeout(() => {
      registrarPartida({
        resultado: estado.vencedor === 'jogador' ? 'vitoria' : 'derrota',
        pontos: estado.pontos,
        comboMax: estado.comboMax,
        tempoRestanteMs: estado.tempoRestante,
        tempoLutaMs: CONFIG.duracaoMs - estado.tempoRestante,
        vidaFinal: jogador.vida,
        personagemId: jogadorDados.id,
        rivalId: rivalDados.id,
        dificuldadeId: selecao.dificuldadeId,
      })
      navigate('/resultado', { replace: true })
    }, 1300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const popupVisivel = estado.popup && estado.relogio - estado.popup.id < 1000
  const flashEspecial = estado.impacto?.tipo === 'especial' && estado.relogio - estado.impacto.em < 500
  const segundos = Math.ceil(estado.tempoRestante / 1000)
  const energiaBaixa = jogador.energia < CONFIG.custoEspecial
  const bloqueado = status !== 'rodando'

  return (
    <main className="tela tela-batalha">
      <header className="placar">
        <section className="ficha" style={{ '--cor': jogadorDados.cor }}>
          <span className="icone-ficha" aria-hidden="true">{jogadorDados.icone}</span>
          <div className="ficha-dados">
            <h2>{jogadorDados.nome} <small>você</small></h2>
            <BarraStatus rotulo="Vida" valor={jogador.vida} tipo="vida" />
            <BarraStatus rotulo="Energia" valor={jogador.energia} tipo="energia" />
          </div>
        </section>

        <div className="centro-placar">
          <strong className="tempo" aria-label="Tempo restante em segundos">{segundos}</strong>
          <span>segundos</span>
          <span className="pontos">Pontos <strong>{estado.pontos.toLocaleString('pt-BR')}</strong></span>
        </div>

        <section className="ficha rival" style={{ '--cor': rivalDados.cor }}>
          <span className="icone-ficha" aria-hidden="true">{rivalDados.icone}</span>
          <div className="ficha-dados">
            <h2>{rivalDados.nome} <small>rival</small></h2>
            <BarraStatus rotulo="Vida" valor={rival.vida} tipo="vida" />
            <BarraStatus rotulo="Energia" valor={rival.energia} tipo="energia" />
          </div>
        </section>
      </header>

      <section
        className={`arena ${imagemCenario ? 'com-imagem' : ''} ${flashEspecial ? 'tremor' : ''}`}
        aria-label={`Arena: ${cenario.nome}`}
        style={
          imagemCenario
            ? { backgroundImage: `url(${imagemCenario})` }
            : { background: `linear-gradient(${cenario.cores[0]}, ${cenario.cores[1]})` }
        }
      >
        {flashEspecial && <div className="flash-tela" key={estado.impacto.seq} />}
        <div className="arena-topo">
          <span className="chip"><strong>{estado.dificuldade.nome}</strong> · {cenario.nome}</span>
          <div className="arena-controles">
            <button type="button" className="chip" onClick={status === 'pausado' ? retomar : pausar} disabled={status === 'fim'} aria-label={status === 'pausado' ? 'Retomar partida' : 'Pausar partida'}>
              {status === 'pausado' ? '▶' : '⏸'}
            </button>
            <button type="button" className="chip" onClick={alternar} aria-pressed={ativo} aria-label={ativo ? 'Silenciar som' : 'Ativar som'}>
              {ativo ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        {!imagemCenario && cenario.lua && <div className="lua" aria-hidden="true" />}
        {popupVisivel && (
          <div className="feedback" key={estado.popup.id}>
            <strong className="feedback-texto">{estado.popup.texto}</strong>
            {jogador.combo >= 2 && <span className="combo">Combo x{jogador.combo}</span>}
          </div>
        )}

        <div className="palco">
          <div className="slot">
            <Impacto estado={estado} alvo="jogador" />
            <Lutador personagem={jogadorDados} estado={animacaoDe(jogador, estado)} />
          </div>
          <div className="slot">
            <Impacto estado={estado} alvo="rival" />
            <Lutador personagem={rivalDados} estado={animacaoDe(rival, estado)} espelhar />
          </div>
        </div>

        {status === 'pausado' && (
          <div className="sobreposicao" role="dialog" aria-label="Partida pausada">
            <h2>Partida pausada</h2>
            <button type="button" className="btn btn-primario" onClick={retomar}>▶ Continuar</button>
            <Link to="/" className="btn">Voltar ao menu</Link>
          </div>
        )}
      </section>

      <p className={`mensagem-jogada ${estado.log.tipo}`} role="status">{estado.log.texto}</p>

      <div className="acoes">
        <button type="button" className="acao atacar" onClick={() => agir('atacar')} disabled={bloqueado}>
          <span><strong>Atacar</strong><small>ganha energia</small></span><kbd>A</kbd>
        </button>
        <button type="button" className="acao defender" onClick={() => agir('defender')} disabled={bloqueado}>
          <span><strong>Defender</strong><small>reduz 70% do dano</small></span><kbd>S</kbd>
        </button>
        <button type="button" className="acao especial" onClick={() => agir('especial')} disabled={bloqueado || energiaBaixa}>
          <span><strong>Especial</strong><small>custa {CONFIG.custoEspecial} de energia</small></span><kbd>D</kbd>
        </button>
      </div>
    </main>
  )
}
