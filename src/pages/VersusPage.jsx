import './VersusPage.css';

export function VersusPage({ characters }) {
  return (
    <section className="versus-screen" aria-label="Versus">
      <div className="versus-artwork">
        <img className="versus-background" src="/assets/screens/VS.png" alt="" />
        {['player1', 'player2'].map((player) => {
          const character = characters[player];
          if (!character) return null;

          const playerClass = player === 'player1' ? 'player-one' : 'player-two';

          return (
            <div key={player} className={`versus-player ${playerClass}`}>
              <img
                className="versus-portrait"
                src={`/assets/personagens/${character}/20-${character}.png`}
                alt={`Personagem escolhido pelo jogador ${player === 'player1' ? '1' : '2'}`}
              />
              <div className={`versus-name name-${character}`}>
                <img
                  src={`/assets/personagens/${character}/${character}.png`}
                  alt={`Nome do personagem ${character === 'boto' ? 'Boto' : 'Lobisomem'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
