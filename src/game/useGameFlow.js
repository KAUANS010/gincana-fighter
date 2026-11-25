import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGameFlow() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const selectionMusicRef = useRef(null);
  const versusMusicRef = useRef(null);
  const [introPhase, setIntroPhase] = useState('inicio');
  const [transitioningToSelection, setTransitioningToSelection] = useState(false);
  const [transitioningToGame, setTransitioningToGame] = useState(false);
  const [versusCharacters, setVersusCharacters] = useState({
    player1: null,
    player2: null,
  });
  const [fixedWinner, setFixedWinner] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const versusStartedRef = useRef(false);
  const gameTransitionStartedRef = useRef(false);

  const startVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    video.currentTime = 0;
    video.play()
      .then(() => setIntroPhase('video'))
      .catch((error) => console.error('Erro ao reproduzir vídeo:', error));
  };

  const showMenu = () => {
    if (introPhase !== 'video') return;

    setIntroPhase('transicao');

    window.setTimeout(() => {
      videoRef.current?.pause();
      setIntroPhase('menu');
      navigate('/menu');
    }, 1000);
  };

  const exitToIntro = () => {
    setFixedWinner(null);
    selectionMusicRef.current?.pause();
    if (selectionMusicRef.current) selectionMusicRef.current.currentTime = 0;

    setIntroPhase('inicio');
    navigate('/');
  };

  const startCharacterSelect = () => {
    if (transitioningToSelection) return;
    setTransitioningToSelection(true);
    setFixedWinner(null);
    versusStartedRef.current = false;
    gameTransitionStartedRef.current = false;

    const versusMusic = versusMusicRef.current;
    if (versusMusic) {
      versusMusic.pause();
      versusMusic.currentTime = 0;
    }

    const selectionMusic = selectionMusicRef.current;
    if (selectionMusic) {
      selectionMusic.currentTime = 0;
      selectionMusic.volume = 0;
      selectionMusic.play().catch((error) => {
        console.error('Erro ao reproduzir música de seleção:', error);
      });
    }

    window.setTimeout(() => {
      navigate('/selecao');
      setTransitioningToSelection(false);
      if (selectionMusic) selectionMusic.volume = 0.35;
    }, 1000);
  };

  const returnToMenu = () => {
    setFixedWinner(null);
    const selectionMusic = selectionMusicRef.current;
    if (selectionMusic) {
      selectionMusic.pause();
      selectionMusic.currentTime = 0;
    }

    navigate('/menu');
  };

  const startRematchSelection = (winner) => {
    if (transitioningToSelection) return;
    setFixedWinner(winner);
    setTransitioningToSelection(true);
    versusStartedRef.current = false;
    gameTransitionStartedRef.current = false;

    const selectionMusic = selectionMusicRef.current;
    if (selectionMusic) {
      selectionMusic.currentTime = 0;
      selectionMusic.volume = 0;
      selectionMusic.play().catch((error) => {
        console.error('Erro ao reproduzir música de seleção:', error);
      });
    }

    window.setTimeout(() => {
      navigate('/selecao');
      setTransitioningToSelection(false);
      if (selectionMusic) selectionMusic.volume = 0.35;
    }, 1000);
  };

  const startVersus = (characters, stage) => {
    if (versusStartedRef.current) return;
    versusStartedRef.current = true;
    gameTransitionStartedRef.current = false;
    setVersusCharacters(characters);
    setSelectedStage(stage);

    const selectionMusic = selectionMusicRef.current;
    if (selectionMusic) {
      selectionMusic.pause();
      selectionMusic.currentTime = 0;
    }

    const versusMusic = versusMusicRef.current;
    if (versusMusic) {
      versusMusic.currentTime = 0;
      versusMusic.play().catch((error) => {
        console.error('Erro ao reproduzir música da tela versus:', error);
      });
    }

    navigate('/versus');
  };

  const finishVersus = () => {
    if (gameTransitionStartedRef.current) return;
    gameTransitionStartedRef.current = true;
    setTransitioningToGame(true);

    window.setTimeout(() => {
      const versusMusic = versusMusicRef.current;
      if (versusMusic) {
        versusMusic.pause();
        versusMusic.currentTime = 0;
      }

      navigate('/jogo');
      setTransitioningToGame(false);
    }, 1000);
  };

  return {
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
  };
}
