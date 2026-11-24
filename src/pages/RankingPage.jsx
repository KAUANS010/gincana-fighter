import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRanking } from '../services/supabaseService';
import './RankingPage.css';

export function RankingPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadRanking = async () => {
      const { data, error } = await fetchRanking();
      setList(data ?? []);
      setLoading(false);

      if (error) {
        console.error('Erro ao consultar ranking:', error);
        setErrorMessage('Não foi possível carregar o ranking agora.');
      }
    };

    loadRanking();
  }, []);

  return (
    <section className="room-screen ranking-screen">
      <div className="panel ranking-panel">
        <div className="ranking-heading">
          <p className="eyebrow">Gincana Fighter</p>
          <h1>Hall da Vitória</h1>
          <p className="ranking-subtitle">Os melhores lutadores da arena</p>
        </div>

        {loading ? (
          <p className="ranking-state" role="status">Carregando ranking...</p>
        ) : errorMessage ? (
          <p className="ranking-state" role="alert">{errorMessage}</p>
        ) : list.length === 0 ? (
          <div className="ranking-empty">
            <span className="ranking-empty-icon" aria-hidden="true">★</span>
            <h2>A arena ainda está vazia</h2>
            <p>Seja o primeiro a lutar e registrar uma pontuação!</p>
          </div>
        ) : (
          <>
            <div className="ranking-columns" aria-hidden="true">
              <span>POSIÇÃO</span>
              <span>JOGADOR</span>
              <span>RECORDE</span>
            </div>
            <ol className="ranking-list">
              {list.map((entry, index) => (
                <li key={entry.id ?? `${entry.user_id}-${index}`} className="ranking-item">
                  <span className="place">{String(index + 1).padStart(2, '0')}</span>
                  <span className="name">{entry.display_name}</span>
                  <strong>{entry.score.toLocaleString('pt-BR')} <small>PTS</small></strong>
                </li>
              ))}
            </ol>
          </>
        )}
        <div className="room-actions">
          <Link to="/menu" className="button secondary">Voltar ao menu</Link>
          <Link to="/login" className="text-link">Login</Link>
          <Link to="/cadastro" className="text-link">Cadastro</Link>
        </div>
      </div>
    </section>
  );
}
