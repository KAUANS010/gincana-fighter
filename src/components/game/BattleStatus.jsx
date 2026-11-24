export function BattleStatus({ timeLeft, fighters }) {
  return (
    <div className="fight-scoreboard">
      <div className="fight-player-status">
        <span>JOGADOR 1</span>
        <strong>{fighters.player1.score} PTS</strong>
        <div className="fight-health-bar">
          <span style={{ width: `${fighters.player1.health}%` }} />
        </div>
      </div>
      <div className="fight-clock" aria-label={`${timeLeft} segundos restantes`}>
        {String(timeLeft).padStart(2, '0')}
      </div>
      <div className="fight-player-status player-two-status">
        <span>JOGADOR 2</span>
        <strong>{fighters.player2.score} PTS</strong>
        <div className="fight-health-bar">
          <span style={{ width: `${fighters.player2.health}%` }} />
        </div>
      </div>
    </div>
  );
}
