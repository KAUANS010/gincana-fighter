import { useEffect, useState } from 'react'
import { FPS, obterFrames, temAnimacao } from '../game/sprites'

const ROTULOS = { attack: 'ATAQUE!', defend: 'DEFESA!', special: 'ESPECIAL!' }

// Toca os quadros em ordem. O componente é recriado (key) a cada troca de animação,
// então cada animação sempre começa do primeiro quadro.
function Quadros({ frames, alt }) {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    if (frames.length < 2) return
    const id = setInterval(() => setIndice((i) => (i + 1) % frames.length), 1000 / FPS)
    return () => clearInterval(id)
  }, [frames])

  return <img className="lutador-img" src={frames[indice % frames.length]} alt={alt} draggable={false} />
}

// Mostra o lutador. Se existirem imagens em src/assets/sprites/<id>/<estado>/,
// toca a animação; senão desenha um boneco provisório em CSS.
// Os efeitos (avanço do golpe, escudo, aura, rótulo da ação) valem para os dois casos
// e deixam claro o que está acontecendo mesmo sem sprites prontos.
export default function Lutador({ personagem, estado = 'idle', espelhar = false }) {
  const frames = obterFrames(personagem.id, estado)
  // Se o personagem não tem imagens para essa ação, o "avanço" em CSS compensa.
  const semAnimacaoPropria = !temAnimacao(personagem.id, estado)

  return (
    <div
      className={`lutador ${espelhar ? 'espelhado' : ''}`}
      data-estado={estado}
      data-sem-animacao={semAnimacaoPropria}
      style={{ '--cor': personagem.cor }}
    >
      {ROTULOS[estado] && <span className={`rotulo-acao ${estado}`}>{ROTULOS[estado]}</span>}
      {estado === 'defend' && <span className="efeito-escudo" />}
      {estado === 'special' && <span className="efeito-aura" />}
      {(estado === 'attack' || estado === 'special') && <span className="efeito-golpe" />}

      {frames.length > 0 ? (
        <Quadros key={`${personagem.id}-${estado}`} frames={frames} alt={`${personagem.nome} (${estado})`} />
      ) : (
        <div className="boneco" aria-label={personagem.nome} role="img">
          <span className="boneco-cabeca" />
          <span className="boneco-tronco" />
          <span className="boneco-braco" />
          <span className="boneco-perna esq" />
          <span className="boneco-perna dir" />
        </div>
      )}
      <span className="lutador-sombra" />
    </div>
  )
}
