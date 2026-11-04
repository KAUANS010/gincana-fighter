import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePartida } from '../contexts/PartidaContext'
import { DIFICULDADES } from '../game/regras'
import { PERSONAGENS } from '../game/personagens'

export default function Selecao() {
  const navigate = useNavigate()
  const { selecao, setSelecao } = usePartida()
  const [personagemId, setPersonagemId] = useState(selecao?.personagemId ?? 'kael')
  const [dificuldadeId, setDificuldadeId] = useState(selecao?.dificuldadeId ?? 'normal')

  const personagem = PERSONAGENS.find((p) => p.id === personagemId)

  function confirmar() {
    setSelecao({ personagemId, dificuldadeId })
    navigate('/batalha')
  }

  return (
    <main className="tela tela-conteudo">
      <h1>Escolha seu guerreiro</h1>
      <p className="subtitulo-pagina">Cada elemento muda seu estilo de luta.</p>

      <div className="grade-personagens" role="radiogroup" aria-label="Guerreiro">
        {PERSONAGENS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={p.id === personagemId}
            className={`cartao-personagem ${p.id === personagemId ? 'selecionado' : ''}`}
            style={{ '--cor': p.cor }}
            onClick={() => setPersonagemId(p.id)}
          >
            <span className="icone-personagem" aria-hidden="true">
              {p.icone}
            </span>
            <strong className="nome-personagem">{p.nome}</strong>
            <span className="elemento">{p.elemento}</span>
            <span className="estilo">{p.estilo}</span>
            <dl className="atributos">
              {[['Vida', p.vida], ['Ataque', p.ataque], ['Defesa', p.defesa]].map(([nome, valor]) => (
                <div key={nome}>
                  <dt>{nome}</dt>
                  <dd>
                    <span className="mini-barra">
                      <span style={{ width: `${valor}%` }} />
                    </span>
                    {valor}
                  </dd>
                </div>
              ))}
            </dl>
          </button>
        ))}
      </div>

      <div className="dificuldades" role="radiogroup" aria-label="Dificuldade">
        {Object.values(DIFICULDADES).map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={d.id === dificuldadeId}
            className={`chip ${d.id === dificuldadeId ? 'ativo' : ''}`}
            onClick={() => setDificuldadeId(d.id)}
          >
            {d.nome}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primario btn-largo" onClick={confirmar}>
        ▶ Confirmar e lutar
      </button>
      <p className="legenda">
        {personagem.nome} · {DIFICULDADES[dificuldadeId].nome}
      </p>
    </main>
  )
}
