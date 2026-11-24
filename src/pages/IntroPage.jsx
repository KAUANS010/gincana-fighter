import './IntroPage.css';

export function IntroPage({ phase, videoRef, onStart, onTransition }) {
  return (
    <section className="intro-screen">
      {(phase === 'inicio' || phase === 'video' || phase === 'transicao') && (
        <>
          <video
            ref={videoRef}
            className="video-inicio"
            src="/assets/videos/INICIO.mp4"
            loop
            playsInline
            onClick={onTransition}
          />

          {phase === 'inicio' && (
            <button className="botao-iniciar" onClick={onStart}>
              INICIAR
            </button>
          )}

          {phase === 'transicao' && <div className="tela-escura" />}
        </>
      )}
    </section>
  );
}
