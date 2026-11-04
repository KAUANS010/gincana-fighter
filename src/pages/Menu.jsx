import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PainelUsuario from '../components/PainelUsuario'
import { useAuth } from '../contexts/AuthContext'
import { buscarRecorde } from '../services/rankingService'

export default function Menu() {
  const { user } = useAuth()
  const [recorde, setRecorde] = useState(null)

  useEffect(() => {
    if (!user) return
    let ativo = true
    buscarRecorde(user.id)
      .then((r) => ativo && setRecorde(r?.pontuacao ?? null))
      .catch(() => ativo && setRecorde(null))
    return () => {
      ativo = false
    }
  }, [user])

  return (
    <main className="tela tela-menu">
      <PainelUsuario />
      {user && recorde !== null && (
        <p className="selo-recorde">
          🏆 Seu recorde <strong>{recorde.toLocaleString('pt-BR')} pts</strong>
        </p>
      )}
      <h1 className="titulo-jogo">
        GINCANA
        <span>FIGHTER</span>
      </h1>
      <p className="subtitulo">Uma batalha. Um vencedor.</p>
      <nav className="menu-botoes" aria-label="Menu principal">
        <Link to="/selecao" className="btn btn-primario">
          ▶ Iniciar jogo
        </Link>
        <Link to="/ranking" className="btn">
          🏆 Ranking
        </Link>
        <Link to="/como-jogar" className="btn">
          ? Como jogar
        </Link>
      </nav>
      <ol className="passos">
        <li>
          <strong>1. Escolha</strong> um guerreiro e a dificuldade
        </li>
        <li>
          <strong>2. Lute</strong> ataque, defenda e use o especial
        </li>
        <li>
          <strong>3. Vença</strong> zere a vida do rival antes do tempo
        </li>
      </ol>
    </main>
  )
}
