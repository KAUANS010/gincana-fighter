import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buscarRecorde } from '../services/rankingService'

// Área protegida: só aparece para quem tem sessão ativa.
export default function Conta() {
  const { user, nomeExibicao, sair } = useAuth()
  const navigate = useNavigate()
  const [recorde, setRecorde] = useState(undefined)

  useEffect(() => {
    let ativo = true
    buscarRecorde(user.id)
      .then((r) => ativo && setRecorde(r))
      .catch(() => ativo && setRecorde(null))
    return () => {
      ativo = false
    }
  }, [user.id])

  async function aoSair() {
    await sair()
    navigate('/', { replace: true })
  }

  return (
    <main className="tela tela-form">
      <h1>Minha conta</h1>
      <section className="cartao-resultado">
        <span className="rotulo">Nome de exibição</span>
        <strong className="nome-conta">{nomeExibicao ?? 'Jogador'}</strong>
        <span className="rotulo">E-mail (visível só para você)</span>
        <span>{user.email}</span>
        <span className="rotulo">Seu recorde</span>
        <strong className="ouro">
          {recorde === undefined ? 'Carregando...' : recorde ? `${recorde.pontuacao.toLocaleString('pt-BR')} pts com ${recorde.personagem}` : 'Ainda sem recorde'}
        </strong>
      </section>
      <div className="linha-botoes coluna">
        <Link to="/selecao" className="btn btn-primario">▶ Jogar</Link>
        <button type="button" className="btn" onClick={aoSair}>Sair da conta</button>
        <Link to="/" className="btn">Voltar ao menu</Link>
      </div>
    </main>
  )
}
