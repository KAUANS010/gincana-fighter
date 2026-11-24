import { Navigate, Route, Routes } from 'react-router-dom';
import {
  CharacterSelectPage,
  GamePage,
  LoginPage,
  MenuPage,
  NotFoundPage,
  ProtectedPage,
  RankingPage,
  RegisterPage,
} from '../pages';
import { TutorialPage } from '../pages/TutorialPage';
import { IntroPage } from '../pages/IntroPage';
import { VersusPage } from '../pages/VersusPage';
import { useGameFlow } from '../game/useGameFlow';
import '../pages/RoomPage.css';

export function AppRoutes() {
  const {
    exitToIntro,
    finishVersus,
    fixedWinner,
    introPhase,
    returnToMenu,
    selectionMusicRef,
    showMenu,
    startCharacterSelect,
    startRematchSelection,
    startVideo,
    startVersus,
    transitioningToGame,
    transitioningToSelection,
    selectedStage,
    versusCharacters,
    versusMusicRef,
    videoRef,
  } = useGameFlow();

  return (
    <main className="app">
      <audio
        ref={selectionMusicRef}
        src="/assets/musicas/1-02. Character Select [CPS-1].mp3"
        loop
        preload="auto"
      />
      <audio
        ref={versusMusicRef}
        src="/assets/musicas/1-03. Versus Screen [CPS-1].mp3"
        preload="auto"
        onEnded={finishVersus}
      />

      <Routes>
        <Route
          path="/"
          element={(
            <IntroPage
              phase={introPhase}
              videoRef={videoRef}
              onStart={startVideo}
              onTransition={showMenu}
            />
          )}
        />
        <Route
          path="/menu"
          element={(
            <MenuPage
              onExit={exitToIntro}
              onStart={startCharacterSelect}
            />
          )}
        />
        <Route
          path="/selecao"
          element={(
            <CharacterSelectPage
              fixedWinner={fixedWinner}
              onBack={returnToMenu}
              onPlayersConfirmed={startVersus}
            />
          )}
        />
        <Route
          path="/versus"
          element={(
            <VersusPage
              characters={versusCharacters}
            />
          )}
        />
        <Route
          path="/jogo"
          element={(
            <GamePage
              characters={versusCharacters}
              stage={selectedStage}
              onReturnToMenu={returnToMenu}
              onStartRematch={startRematchSelection}
            />
          )}
        />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/perfil" element={<ProtectedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      {(transitioningToSelection
        || transitioningToGame) && (
        <div className="tela-escura menu-transition" aria-hidden="true" />
      )}
    </main>
  );
}
