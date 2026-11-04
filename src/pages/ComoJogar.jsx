import { Link } from 'react-router-dom'
import { CONFIG } from '../game/regras'

const CARTOES = [
  { titulo: 'Atacar', tecla: 'A', icone: '🗡️', classe: 'vermelho', texto: 'Causa dano no rival, recarrega sua energia e aumenta a pontuação. Acertos seguidos formam combo.' },
  { titulo: 'Defender', tecla: 'S', icone: '🛡️', classe: 'azul', texto: 'Reduz 70% do dano recebido neste turno. Bom para esperar o rival gastar energia.' },
  { titulo: 'Especial', tecla: 'D', icone: '⭐', classe: 'roxo', texto: `Custa ${CONFIG.custoEspecial} de energia e causa dano muito maior. Use quando o rival estiver fraco.` },
  { titulo: 'Vencer', icone: '🏆', classe: 'dourado', texto: 'Zere a vida do rival antes do tempo acabar e antes que a sua chegue a zero.' },
]

export default function ComoJogar() {
  return (
    <main className="tela tela-conteudo">
      <h1>Como jogar</h1>
      <p className="subtitulo-pagina">Aprenda os comandos antes da batalha.</p>
      <div className="grade-cartoes">
        {CARTOES.map((c) => (
          <article key={c.titulo} className="cartao-info">
            <span className={`icone-quadro ${c.classe}`} aria-hidden="true">
              {c.icone}
            </span>
            <div>
              <h2>
                {c.titulo} {c.tecla && <kbd>{c.tecla}</kbd>}
              </h2>
              <p>{c.texto}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="dica">ℹ️ Dica: um combo x4 vale mais pontos. Defender quebra o combo do rival.</p>
      <Link to="/" className="btn btn-voltar">
        ← Voltar ao menu
      </Link>
    </main>
  )
}
