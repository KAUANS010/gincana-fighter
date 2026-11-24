import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function ProtectedPage() {
  const { session, logout, profile } = useAuth();

  if (!session) {
    return (
      <section className="room-screen">
        <div className="panel">
          <p className="eyebrow">Área protegida</p>
          <h1>Você precisa estar logado</h1>
          <Link to="/login" className="button primary">
            Fazer login
          </Link>
          <Link to="/menu" className="room-button">Voltar ao menu</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="room-screen">
      <div className="panel protected-panel">
        <p className="eyebrow">Área protegida</p>
        <h1>Bem-vindo</h1>
        <p>Você está autenticado como {profile?.display_name || session.user?.email}.</p>
        <p className="session-info">Sessão ativa: {session.user?.email}</p>

        <button type="button" className="button secondary" onClick={logout}>
          Sair
        </button>
        <Link to="/menu" className="room-button">Voltar ao menu</Link>
      </div>
    </section>
  );
}
