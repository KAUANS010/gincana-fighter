import { useCallback, useEffect, useRef, useState } from 'react';
import { chooseRandomStage } from '../game/stages';
import './CharacterSelectPage.css';

const characters = [
  { id: 'boto', left: '42.5%' },
  { id: 'lobisomem', left: '50.4%' },
];

const players = [
  { id: 'player1', className: 'player-one' },
  { id: 'player2', className: 'player-two' },
];

const selectionByKey = {
  a: { player: 'player1', character: 'boto' },
  d: { player: 'player1', character: 'lobisomem' },
  arrowleft: { player: 'player2', character: 'boto' },
  arrowright: { player: 'player2', character: 'lobisomem' },
};

const mapStagePositions = {
  gramado: { x: 44.2, y: 74.1 },
  palco: { x: 47.9, y: 32.9 },
  garagem: { x: 63.4, y: 27.1 },
  quadra: { x: 58.3, y: 50.8 },
};
const mapAnimationBounds = { left: 24, top: 10, width: 44, height: 72 };

function getMapAnimationPosition(position) {
  return {
    x: ((position.x - mapAnimationBounds.left) / mapAnimationBounds.width) * 100,
    y: ((position.y - mapAnimationBounds.top) / mapAnimationBounds.height) * 100,
  };
}

export function CharacterSelectPage({ fixedWinner, onBack, onPlayersConfirmed }) {
  const [selections, setSelections] = useState(() => ({
    player1: fixedWinner?.playerId === 'player1' ? fixedWinner.character : null,
    player2: fixedWinner?.playerId === 'player2' ? fixedWinner.character : null,
  }));
  const [confirmed, setConfirmed] = useState(() => ({
    player1: fixedWinner?.playerId === 'player1' ? fixedWinner.character : null,
    player2: fixedWinner?.playerId === 'player2' ? fixedWinner.character : null,
  }));
  const [lastSelectedPlayer, setLastSelectedPlayer] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [transitionStarted, setTransitionStarted] = useState(false);
  const selectionSoundRef = useRef(null);
  const confirmedSoundRef = useRef(null);
  const carSoundRef = useRef(null);
  const carAudioContextRef = useRef(null);
  const carAudioGainRef = useRef(null);
  const readyRef = useRef(false);
  const carFadeTimeoutRef = useRef(null);
  const stageTransitionTimeoutRef = useRef(null);
  const selectionLocked = players.some((player) => confirmed[player.id]);
  const pointerStart = getMapAnimationPosition(mapStagePositions.gramado);
  const pointerTarget = getMapAnimationPosition(
    mapStagePositions[selectedStage?.id] ?? mapStagePositions.gramado,
  );

  useEffect(() => () => {
    window.clearTimeout(carFadeTimeoutRef.current);
    window.clearTimeout(stageTransitionTimeoutRef.current);
    const audioContext = carAudioContextRef.current;
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch((error) => {
        console.error('Erro ao encerrar o áudio do carro:', error);
      });
    }
  }, []);

  const playSelectionSound = () => {
    const sound = selectionSoundRef.current;
    if (!sound) return;

    sound.volume = 0.8;
    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.error('Erro ao reproduzir som de seleção de personagem:', error);
    });
  };

  const playCarSound = useCallback(() => {
    const sound = carSoundRef.current;
    if (!sound) return;

    if (!carAudioGainRef.current) {
      if (!window.AudioContext) {
        console.error('Este navegador não oferece suporte à amplificação do áudio do carro.');
      } else {
        const audioContext = new window.AudioContext();
        const source = audioContext.createMediaElementSource(sound);
        const gain = audioContext.createGain();
        gain.gain.value = 4;
        source.connect(gain);
        gain.connect(audioContext.destination);
        carAudioContextRef.current = audioContext;
        carAudioGainRef.current = gain;
      }
    }

    sound.volume = 1;
    sound.currentTime = 0;
    carAudioContextRef.current?.resume().catch((error) => {
      console.error('Erro ao ativar a amplificação do áudio do carro:', error);
    });
    sound.play().catch((error) => {
      console.error('Erro ao reproduzir o áudio do carro:', error);
    });
  }, []);

  const confirmPlayer = useCallback((playerId) => {
    if (!selections[playerId] || confirmed[playerId]) return;

    const confirmedSound = confirmedSoundRef.current;
    if (confirmedSound) {
      confirmedSound.currentTime = 0;
      confirmedSound.play().catch((error) => {
        console.error('Erro ao reproduzir som de confirmação do personagem:', error);
      });
    }

    const nextConfirmed = {
      ...confirmed,
      [playerId]: selections[playerId],
    };
    setConfirmed(nextConfirmed);

    const bothPlayersConfirmed = players.every(
      (player) => nextConfirmed[player.id]
        && nextConfirmed[player.id] === selections[player.id],
    );

    if (bothPlayersConfirmed && !readyRef.current) {
      readyRef.current = true;
      const stage = chooseRandomStage();
      setSelectedStage(stage);
      setTransitionStarted(false);
      playCarSound();
      carFadeTimeoutRef.current = window.setTimeout(() => {
        setTransitionStarted(true);
      }, 5000);
      stageTransitionTimeoutRef.current = window.setTimeout(() => {
        onPlayersConfirmed(nextConfirmed, stage);
      }, 7000);
    }
  }, [confirmed, onPlayersConfirmed, playCarSound, selections]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest('.character-select-back')) return;

      const key = event.key.toLowerCase();
      const selection = selectionByKey[key];

      if (selection) {
        event.preventDefault();
        if (confirmed[selection.player]) return;

        playSelectionSound();
        setSelections((current) => ({
          ...current,
          [selection.player]: selection.character,
        }));
        setLastSelectedPlayer(selection.player);
        return;
      }

      const confirmingPlayer = key === 'r'
        ? 'player1'
        : key === '8' || event.code === 'Numpad8'
          ? 'player2'
          : null;

      if (confirmingPlayer) {
        event.preventDefault();
        confirmPlayer(confirmingPlayer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmPlayer, confirmed, selections]);

  return (
    <section
      className="character-select-screen"
      aria-label="Seleção de personagens"
    >
      <audio
        ref={selectionSoundRef}
        src="/assets/sons/selecionando.m4a"
        preload="auto"
      />
      <audio
        ref={confirmedSoundRef}
        src="/assets/sons/personagem-selecionado.m4a"
        preload="auto"
      />
      <audio ref={carSoundRef} src="/assets/sons/carro.mp4" preload="auto" />
      {(!selectionLocked || fixedWinner) && !selectedStage && (
        <button type="button" className="character-select-back" onClick={onBack}>
          Voltar ao menu
        </button>
      )}
      <div className="character-select-artwork">
        <img
          className="character-select-background"
          src="/assets/screens/MAPA.png"
          alt="Mapa da gincana. Escolha entre o Boto cor-de-rosa e o Lobisomem marrom."
        />
        {selectedStage && (
          <div className="map-animation-area" aria-hidden="true">
            <img
              className="map-pointer map-pointer-moving"
              src="/assets/screens/PONTEIRO.png"
              alt=""
              draggable="false"
              style={{
                left: `${pointerStart.x}%`,
                top: `${pointerStart.y}%`,
                '--map-target-x': `${pointerTarget.x}%`,
                '--map-target-y': `${pointerTarget.y}%`,
              }}
            />
          </div>
        )}
        <div className="character-select-options">
          {characters.map((character) => (
            <span
              key={`hover-${character.id}`}
              className="character-select-hover-target"
              style={{ left: character.left }}
              onMouseEnter={playSelectionSound}
              aria-hidden="true"
            />
          ))}
          {characters.flatMap((character) => players
            .filter((player) => selections[player.id] === character.id)
            .map((player) => (
              <span
                key={`${character.id}-${player.id}`}
                className={`character-choice ${player.className}`}
                style={{
                  left: character.left,
                  zIndex: player.id === lastSelectedPlayer ? 2 : 1,
                }}
                aria-hidden="true"
              />
            )))}
        </div>
      </div>
      {players.map((player) => {
        const character = characters.find(
          (item) => item.id === selections[player.id],
        );
        if (!character) return null;

        return (
          <div
            key={player.id}
            className={`character-select-player ${player.className}`}
          >
            <div className={`character-select-name name-${character.id}`}>
              <img
                src={`/assets/personagens/${character.id}/${character.id}.png`}
                alt={`Nome do personagem ${character.id === 'boto' ? 'Boto' : 'Lobisomem'}`}
              />
            </div>
            <img
              className="character-select-portrait"
              src={`/assets/personagens/${character.id}/20-${character.id}.png`}
              alt={`${character.id === 'boto' ? 'Boto' : 'Lobisomem'} do ${player.id === 'player1' ? 'jogador 1' : 'jogador 2'}`}
            />
          </div>
        );
      })}
      {transitionStarted && (
        <div className="map-transition-fade" aria-hidden="true" />
      )}
    </section>
  );
}
