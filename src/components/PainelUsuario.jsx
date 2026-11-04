import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSom } from '../contexts/SomContext'

export default function PainelUsuario() {
  const { user, nomeExibicao, sair, carregando } = useAuth()
  const { ativo, alternar } = useSom()

  return (
    <div className="painel-usuario">
      {!carregando &&
        (user ? (
          <>
            <Link to="/conta" className="chip">
              {nomeExibicao ?? 'Minha conta'}
            </Link>
            <button type="button" className="chip" onClick={() => sair()}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="chip">
              Entrar
            </Link>
            <Link to="/cadastro" className="chip">
              Cadastrar
            </Link>
          </>
        ))}
      <button type="button" className="chip" onClick={alternar} aria-pressed={ativo} aria-label={ativo ? 'Silenciar som' : 'Ativar som'}>
        {ativo ? '🔊' : '🔇'}
      </button>
    </div>
  )
}
