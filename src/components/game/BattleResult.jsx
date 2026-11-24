export function BattleResult({
  phase,
  winnerCharacter,
  loserCharacter,
  videoRef,
  onLeaveRevenge,
  onChooseRevenge,
  onReturnToMenu,
}) {
  if (
    phase === 'transition-to-victory'
    || phase === 'transition-to-revenge'
    || phase === 'transition-round'
  ) {
    return <div className="fight-result-transition" aria-hidden="true" />;
  }

  if (phase === 'transition-to-selection') {
    return (
      <section className="fight-result-backdrop revenge-screen revenge-transition-screen" aria-label="Transição para seleção de personagens">
        <video
          ref={videoRef}
          className="revenge-background-video"
          src="/assets/videos/CONTAGEM-REGRESSIVA.mp4"
          playsInline
          preload="auto"
        />
        {loserCharacter && (
          <img
            className="result-fighter revenge-fighter"
            src={`/assets/personagens/${loserCharacter}/22-revanche.png`}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
        )}
        <div className="fight-result-transition" aria-hidden="true" />
      </section>
    );
  }

  if (phase === 'revenge' || phase === 'revenge-selected') {
    return (
      <section className="fight-result-backdrop revenge-screen" aria-label="Tela de revanche">
        <video
          ref={videoRef}
          className="revenge-background-video"
          src="/assets/videos/CONTAGEM-REGRESSIVA.mp4"
          playsInline
          preload="auto"
          onEnded={onLeaveRevenge}
        />
        {loserCharacter && (
          <img
            className="result-fighter revenge-fighter"
            src={`/assets/personagens/${loserCharacter}/${phase === 'revenge' ? '21-derrota' : '22-revanche'}.png`}
            alt={phase === 'revenge' ? 'Personagem derrotado' : 'Personagem pronto para a revanche'}
            draggable="false"
          />
        )}
        {phase === 'revenge' && (
          <button
            type="button"
            className="revenge-click-target"
            onClick={onChooseRevenge}
            aria-label="Iniciar revanche"
          >
            <span>CLIQUE PARA REVANCHE</span>
          </button>
        )}
        <button
          type="button"
          className="revenge-menu-button"
          onClick={onReturnToMenu}
        >
          Voltar ao menu
        </button>
      </section>
    );
  }

  if (!winnerCharacter) return null;

  return (
    <section className="fight-result-backdrop victory-screen" aria-label="Resultado da luta">
      <img
        className="victory-background"
        src={`/assets/screens/VITORIA-${winnerCharacter === 'boto' ? 'BOTO' : 'LOBISOMEM'}.png`}
        alt=""
        aria-hidden="true"
      />
      <img
        className="result-fighter result-loser"
        src={`/assets/personagens/${loserCharacter}/21-derrota.png`}
        alt={`${loserCharacter === 'boto' ? 'Boto' : 'Lobisomem'} derrotado`}
        draggable="false"
      />
      <img
        className="result-fighter result-winner"
        src={`/assets/personagens/${winnerCharacter}/20-${winnerCharacter}.png`}
        alt={`${winnerCharacter === 'boto' ? 'Boto' : 'Lobisomem'} vencedor`}
        draggable="false"
      />
    </section>
  );
}
