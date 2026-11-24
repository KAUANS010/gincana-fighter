import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="room-screen">
      <div className="panel not-found-panel">
        <p className="eyebrow">404</p>
        <h1>Página não encontrada</h1>
        <Link to="/" className="button primary">
          Voltar para a intro
        </Link>
        <Link to="/menu" className="room-button">Ir ao menu principal</Link>
      </div>
    </section>
  );
}
