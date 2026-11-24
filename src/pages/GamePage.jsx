import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/useAuth';
import {
  CAMERA_MARGIN,
  CAMERA_HEIGHT,
  CAMERA_WIDTH,
  ARENA_FLOOR,
  ARENA_HEIGHT,
  ARENA_WIDTH,
  FIGHTER_WIDTH,
  MIN_CAMERA_WIDTH,
  useFightingGame,
} from '../game/useFightingGame';
import { stages } from '../game/stages';
import { BattleResult } from '../components/game/BattleResult';
import { BattleStatus } from '../components/game/BattleStatus';
import './GamePage.css';

const FIGHTER_HEIGHT = 375;
const CHARACTER_FRAME_HEIGHTS = {
  boto: {
    idle: 384,
    walkForward: 384,
    walkBackward: 384,
    defend: 384,
    punch: 384,
    kick: 384,
    specialStart: 384,
    specialEnd: 384,
    jump: 448,
    specialDamage: 448,
    fall1: 384,
    fall2: 384,
    fall3: 384,
    defeatFall1: 384,
    defeatFall2: 384,
    defeatFall3: 384,
    victory1: 512,
    victory2: 512,
  },
  lobisomem: {
    idle: 436,
    walkForward: 432,
    walkBackward: 448,
    defend: 424,
    punch: 424,
    kick: 484,
    jump: 340,
    specialDamage: 508,
    werewolfSpecial1: 372,
    werewolfSpecial2: 404,
    werewolfSpecial3: 408,
    werewolfSpecial4: 404,
    werewolfSpecial5: 404,
    werewolfSpecial6: 264,
    fall1: 376,
    fall2: 304,
    fall3: 168,
    defeatFall1: 376,
    defeatFall2: 304,
    defeatFall3: 168,
    victory1: 460,
    victory2: 456,
  },
};
const CHARACTER_DEFAULT_FACING = {
  boto: -1,
  lobisomem: 1,
};

const FIGHTER_IMAGES = {
  idle: '1-parado',
  walkForward: '2-frente',
  walkBackward: '3-tras',
  defend: '4-defesa',
  punch: '5-soco',
  kick: '6-chute',
  specialStart: '7-especial-inicio',
  specialEnd: '8-especial-final',
  jump: '0-pulo',
  werewolfSpecial1: '7-especial-1',
  werewolfSpecial2: '8-especial-2',
  werewolfSpecial3: '9-especial-3',
  werewolfSpecial4: '10-especial-4',
  werewolfSpecial5: '11-especial-5',
  werewolfSpecial6: '12-especial-6',
};

const getFighterSprite = ({ character, pose }) => {
  const fallFrame = /^(?:fall|defeatFall)([123])$/.exec(pose)?.[1];
  const image = fallFrame
    ? character === 'lobisomem'
      ? `${14 + Number(fallFrame)}-queda-${fallFrame}`
      : `${10 + Number(fallFrame)}-queda-${fallFrame}`
    : pose === 'specialDamage'
      ? character === 'lobisomem' ? '14-dano-especial' : '10-dano-especial'
      : pose === 'victory1'
        ? character === 'lobisomem' ? '18-vitoria' : '14-vitoria-1'
        : pose === 'victory2'
          ? character === 'lobisomem' ? '19-vitoria-2' : '15-vitoria-2'
          : FIGHTER_IMAGES[pose] ?? FIGHTER_IMAGES.idle;
  const frameHeights = CHARACTER_FRAME_HEIGHTS[character] ?? CHARACTER_FRAME_HEIGHTS.boto;
  const frameHeight = frameHeights[pose] ?? frameHeights.idle;
  const fighterHeight = character === 'lobisomem'
    ? FIGHTER_HEIGHT * 1.08
    : FIGHTER_HEIGHT;

  return {
    src: `/assets/personagens/${character}/${image}.png`,
    height: fighterHeight * frameHeight / frameHeights.idle,
  };
};

function Fighter({ id, fighter, now }) {
  const defaultFacing = CHARACTER_DEFAULT_FACING[fighter.character] ?? -1;
  const shouldFlip = fighter.facing !== defaultFacing;
  const isJumping = fighter.jumpUntil > now;
  const isWerewolfAirborne = fighter.pose === 'grabbed'
    || /^werewolfSpecial[2-5]$/.test(fighter.pose);
  const isKnockbackFalling = /^(?:fall|defeatFall)[123]$/.test(fighter.pose);
  const isDefeatFalling = /^defeatFall[123]$/.test(fighter.pose);
  const isInverted = fighter.pose === 'grabbed';
  const sprite = getFighterSprite(fighter);

  return (
    <div
      className={`arena-fighter${isJumping ? ' is-jumping' : ''}${isWerewolfAirborne ? ' is-werewolf-airborne' : ''}${isKnockbackFalling ? ' is-knockback-falling' : ''}${isDefeatFalling ? ' is-defeat-falling' : ''}`}
      style={{
        left: `${fighter.x}px`,
        width: `${FIGHTER_WIDTH}px`,
        height: `${fighter.character === 'lobisomem' ? FIGHTER_HEIGHT * 1.08 : FIGHTER_HEIGHT}px`,
      }}
      aria-label={`${id === 'player1' ? 'Jogador 1' : 'Jogador 2'}: ${fighter.character}`}
    >
      <img
        src={sprite.src}
        alt=""
        draggable="false"
        style={{
          height: `${sprite.height}px`,
          transform: [
            shouldFlip ? 'scaleX(-1)' : '',
            isInverted ? 'rotate(180deg)' : '',
          ].filter(Boolean).join(' ') || undefined,
        }}
      />
    </div>
  );
}

function getJumpCameraOffset(fighter, now) {
  const duration = fighter.jumpUntil - fighter.jumpStartedAt;
  if (duration <= 0 || now >= fighter.jumpUntil) return 0;

  const progress = Math.max(0, Math.min(1, (now - fighter.jumpStartedAt) / duration));
  return Math.sin(progress * Math.PI) * 120;
}

export function GamePage({ characters, stage, onReturnToMenu, onStartRematch }) {
  const { registerScore } = useAuth();
  const viewportRef = useRef(null);
  const stageMusicRef = useRef(null);
  const punchSoundRef = useRef(null);
  const kickSoundRef = useRef(null);
  const botoukenSoundRef = useRef(null);
  const botoDefeatSoundRef = useRef(null);
  const werewolfDefeatSoundRef = useRef(null);
  const botoRevengeSoundRef = useRef(null);
  const werewolfRevengeSoundRef = useRef(null);
  const werewolfSpecialSoundRef = useRef(null);
  const pauseSoundRef = useRef(null);
  const botoukenAudioContextRef = useRef(null);
  const botoukenGainRef = useRef(null);
  const scoreRecordedRef = useRef(false);
  const activeStage = stage ?? stages[0];
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [jumpFrameTime, setJumpFrameTime] = useState(() => performance.now());
  const [resultPhase, setResultPhase] = useState('fight');
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundWins, setRoundWins] = useState({ player1: 0, player2: 0 });
  const [matchWinner, setMatchWinner] = useState(null);
  const revengeVideoRef = useRef(null);
  const rematchStartedRef = useRef(false);
  const revengeSelectedRef = useRef(false);
  const scale = viewport.width && viewport.height
    ? Math.min(
      Math.max(viewport.width / CAMERA_WIDTH, viewport.height / CAMERA_HEIGHT),
      viewport.width / MIN_CAMERA_WIDTH,
    )
    : 1;
  const cameraWidth = viewport.width ? viewport.width / scale : CAMERA_WIDTH;
  const playAttackSound = useCallback((pose) => {
    const sound = pose === 'punch' ? punchSoundRef.current : kickSoundRef.current;
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.error(`Erro ao reproduzir som de ${pose === 'punch' ? 'soco' : 'chute'}:`, error);
    });
  }, []);
  const playSpecialSound = useCallback(() => {
    const sound = botoukenSoundRef.current;
    if (!sound) return;

    if (!botoukenGainRef.current) {
      if (!window.AudioContext) {
        console.error('Este navegador não oferece suporte à amplificação do áudio do botouken.');
        return;
      }

      const audioContext = new window.AudioContext();
      const source = audioContext.createMediaElementSource(sound);
      const gain = audioContext.createGain();
      gain.gain.value = 5;
      source.connect(gain);
      gain.connect(audioContext.destination);
      botoukenAudioContextRef.current = audioContext;
      botoukenGainRef.current = gain;
    }

    sound.volume = 1;
    sound.currentTime = 0;
    botoukenAudioContextRef.current.resume().catch((error) => {
      console.error('Erro ao ativar a amplificação do áudio do botouken:', error);
    });
    sound.play().catch((error) => {
      console.error('Erro ao reproduzir o som do botouken:', error);
    });
  }, []);
  const playDefeatSound = useCallback((character) => {
    const sound = character === 'lobisomem'
      ? werewolfDefeatSoundRef.current
      : botoDefeatSoundRef.current;
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.error(`Erro ao reproduzir áudio de derrota de ${character}:`, error);
    });
  }, []);
  const playWerewolfSpecialSound = useCallback(() => {
    const sound = werewolfSpecialSoundRef.current;
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.error('Erro ao reproduzir o som do especial do lobisomem:', error);
    });
  }, []);
  const playPauseSound = useCallback(() => {
    const sound = pauseSoundRef.current;
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.error('Erro ao reproduzir o som de pausa:', error);
    });
  }, []);

  useEffect(() => () => {
    const audioContext = botoukenAudioContextRef.current;
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch((error) => {
        console.error('Erro ao encerrar o áudio do botouken:', error);
      });
    }
  }, []);
  const {
    fighters,
    cameraImpactAt,
    message,
    projectiles,
    resetRound,
    status,
    timeLeft,
    winner,
  } = useFightingGame(
    characters,
    cameraWidth,
    playAttackSound,
    playSpecialSound,
    playWerewolfSpecialSound,
    playDefeatSound,
    playPauseSound,
  );

  const loser = matchWinner === 'player1' ? 'player2' : 'player1';
  const winnerCharacter = matchWinner ? fighters[matchWinner].character : null;
  const loserCharacter = matchWinner ? fighters[loser].character : null;
  const continueToRematch = useCallback(() => {
    if (rematchStartedRef.current) return;
    rematchStartedRef.current = true;
    onStartRematch(matchWinner
      ? { playerId: matchWinner, character: winnerCharacter }
      : null);
  }, [matchWinner, onStartRematch, winnerCharacter]);
  const leaveRevenge = useCallback(() => {
    if (rematchStartedRef.current) return;
    rematchStartedRef.current = true;
    onStartRematch(null);
  }, [onStartRematch]);
  const chooseRevenge = useCallback(() => {
    if (rematchStartedRef.current || revengeSelectedRef.current) return;
    revengeSelectedRef.current = true;
    revengeVideoRef.current?.pause();
    const sound = loserCharacter === 'lobisomem'
      ? werewolfRevengeSoundRef.current
      : loserCharacter === 'boto' ? botoRevengeSoundRef.current : null;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.error('Erro ao reproduzir o som de revanche:', error);
      });
    }
    setResultPhase('revenge-selected');
  }, [loserCharacter]);

  useEffect(() => {
    if (status !== 'finished' || resultPhase !== 'fight') return undefined;

    const nextWins = {
      ...roundWins,
      ...(winner ? { [winner]: roundWins[winner] + 1 } : {}),
    };
    const matchFinished = nextWins.player1 >= 2
      || nextWins.player2 >= 2;
    const timeout = window.setTimeout(() => {
      setRoundWins(nextWins);
      if (matchFinished) {
        setMatchWinner(nextWins.player1 >= 2 ? 'player1' : 'player2');
      }
      setResultPhase(matchFinished ? 'victory' : 'transition-round');
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [resultPhase, roundWins, status, winner]);

  useEffect(() => {
    if (resultPhase !== 'transition-round') return undefined;

    const nextRound = roundNumber + 1;
    const timeout = window.setTimeout(() => {
      setRoundNumber(nextRound);
      resetRound(nextRound);
      setResultPhase('fight');
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [resetRound, resultPhase, roundNumber]);

  useEffect(() => {
    if (resultPhase !== 'victory') return undefined;

    const timeout = window.setTimeout(
      () => setResultPhase('transition-to-revenge'),
      4000,
    );
    return () => window.clearTimeout(timeout);
  }, [resultPhase]);

  useEffect(() => {
    if (resultPhase !== 'transition-to-revenge') return undefined;

    const timeout = window.setTimeout(() => setResultPhase('revenge'), 900);
    return () => window.clearTimeout(timeout);
  }, [resultPhase]);

  useEffect(() => {
    if (resultPhase !== 'revenge-selected') return undefined;

    const timeout = window.setTimeout(
      () => setResultPhase('transition-to-selection'),
      5000,
    );
    return () => window.clearTimeout(timeout);
  }, [resultPhase]);

  useEffect(() => {
    if (resultPhase !== 'transition-to-selection') return undefined;

    const timeout = window.setTimeout(
      revengeSelectedRef.current ? continueToRematch : leaveRevenge,
      900,
    );
    return () => window.clearTimeout(timeout);
  }, [continueToRematch, leaveRevenge, resultPhase]);

  useEffect(() => {
    if (resultPhase !== 'revenge') return;

    const video = revengeVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play().catch((error) => {
      console.error('Erro ao reproduzir vídeo de revanche:', error);
    });
  }, [resultPhase]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return undefined;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(viewportElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let frameId;
    const updateJumpFrame = () => {
      const now = performance.now();
      setJumpFrameTime(now);
      if (
        fighters.player1.jumpUntil > now
        || fighters.player2.jumpUntil > now
        || (cameraImpactAt > 0 && now - cameraImpactAt < 180)
      ) {
        frameId = window.requestAnimationFrame(updateJumpFrame);
      }
    };

    if (
      fighters.player1.jumpUntil <= performance.now()
      && fighters.player2.jumpUntil <= performance.now()
      && !(cameraImpactAt > 0 && performance.now() - cameraImpactAt < 180)
    ) {
      return undefined;
    }

    frameId = window.requestAnimationFrame(updateJumpFrame);
    return () => window.cancelAnimationFrame(frameId);
  }, [cameraImpactAt, fighters.player1.jumpUntil, fighters.player2.jumpUntil]);

  useEffect(() => {
    const music = stageMusicRef.current;
    if (!music) return undefined;

    if (status !== 'playing') {
      music.pause();
      if (status !== 'paused') music.currentTime = 0;
      return undefined;
    }

    music.play().catch((error) => {
      console.error(`Erro ao reproduzir música do mapa ${activeStage.name}:`, error);
    });

    return () => {
      music.pause();
    };
  }, [activeStage.music, activeStage.name, status]);

  const finalScore = winner
    ? fighters[winner].score + 100
    : Math.max(fighters.player1.score, fighters.player2.score);
  const visibleResultPhase = status === 'finished' && resultPhase === 'fight'
    ? 'transition-to-victory'
    : resultPhase;

  useEffect(() => {
    if (
      status !== 'finished'
      || resultPhase !== 'victory'
      || scoreRecordedRef.current
    ) return;
    scoreRecordedRef.current = true;
    if (finalScore > 0) registerScore(finalScore);
  }, [finalScore, registerScore, resultPhase, status]);

  const cameraHeight = viewport.height / scale;
  const centerX = (fighters.player1.x + fighters.player2.x) / 2;
  const maxCameraX = Math.max(0, ARENA_WIDTH - cameraWidth);
  const leftmostFighter = Math.min(fighters.player1.x, fighters.player2.x);
  const rightmostFighter = Math.max(fighters.player1.x, fighters.player2.x);
  const minCameraX = Math.max(
    0,
    rightmostFighter + FIGHTER_WIDTH / 2 + CAMERA_MARGIN - cameraWidth,
  );
  const maxFighterCameraX = Math.min(
    maxCameraX,
    leftmostFighter - FIGHTER_WIDTH / 2 - CAMERA_MARGIN,
  );
  const cameraX = cameraWidth >= ARENA_WIDTH
    ? 0
    : Math.max(
      0,
      Math.min(
        Math.max(minCameraX, centerX - cameraWidth / 2),
        maxFighterCameraX,
      ),
    );
  const maxCameraY = Math.max(0, ARENA_HEIGHT - cameraHeight);
  const jumpCameraOffset = Math.max(
    getJumpCameraOffset(fighters.player1, jumpFrameTime),
    getJumpCameraOffset(fighters.player2, jumpFrameTime),
  );
  const impactProgress = cameraImpactAt > 0
    ? Math.max(0, Math.min(1, (jumpFrameTime - cameraImpactAt) / 180))
    : 1;
  const impactCameraOffset = Math.sin(impactProgress * Math.PI) * 14;
  const baseCameraY = Math.min(
    Math.max(0, ARENA_FLOOR - cameraHeight * 0.79),
    maxCameraY,
  );
  const cameraY = Math.min(
    maxCameraY,
    Math.max(0, baseCameraY - jumpCameraOffset + impactCameraOffset),
  );
  const letterboxY = Math.max(0, (viewport.height - ARENA_HEIGHT * scale) / 2);
  const worldStyle = {
    width: `${ARENA_WIDTH}px`,
    height: `${ARENA_HEIGHT}px`,
    transform: `translate3d(${-cameraX * scale}px, ${letterboxY - cameraY * scale}px, 0) scale(${scale})`,
  };

  return (
    <section className="fight-screen" aria-label="Arena de luta">
      <audio ref={stageMusicRef} src={activeStage.music} loop preload="auto" />
      <audio ref={punchSoundRef} src="/assets/sons/soco.wav" preload="auto" />
      <audio ref={kickSoundRef} src="/assets/sons/chute.wav" preload="auto" />
      <audio ref={botoukenSoundRef} src="/assets/sons/botouken.mpeg" preload="auto" />
      <audio ref={botoDefeatSoundRef} src="/assets/sons/Boto-derrota.m4a" preload="auto" />
      <audio ref={werewolfDefeatSoundRef} src="/assets/sons/Lobisomem-derrota.m4a" preload="auto" />
      <audio ref={botoRevengeSoundRef} src="/assets/sons/boto-revanche.mp3" preload="auto" />
      <audio ref={werewolfRevengeSoundRef} src="/assets/sons/lobisomem-revanche.mp3" preload="auto" />
      <audio ref={werewolfSpecialSoundRef} src="/assets/sons/especial-lobisomem.mp3" preload="auto" />
      <audio ref={pauseSoundRef} src="/assets/sons/pause-opcao.m4a" preload="auto" />
      <div className="fight-viewport" ref={viewportRef}>
        <div className={`fight-world stage-${activeStage.id}`} style={worldStyle}>
          <div
            className={`fight-stage-image stage-${activeStage.id}`}
            role="img"
            aria-label={`Cenário da luta: ${activeStage.name}`}
          >
            <img
              src={activeStage.image}
              alt=""
              draggable="false"
            />
          </div>
          <div className="fight-floor" style={{ top: `${ARENA_FLOOR}px` }} />
          <Fighter id="player1" fighter={fighters.player1} now={jumpFrameTime} />
          <Fighter id="player2" fighter={fighters.player2} now={jumpFrameTime} />
          {projectiles.map((projectile) => (
            <img
              key={projectile.id}
              className="botouken-projectile"
              src={`/assets/personagens/boto/${16 + projectile.frame}-botouken-${projectile.frame + 1}.png`}
              alt=""
              aria-label="Botouken"
              draggable="false"
              style={{
                left: `${projectile.x}px`,
                top: `${projectile.y}px`,
                transform: `translateX(-50%) scaleX(${-projectile.facing})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="fight-hud">
        <BattleStatus timeLeft={timeLeft} fighters={fighters} />
        <p className="fight-round-status">
          ROUND {roundNumber} · J1 {roundWins.player1} × {roundWins.player2} J2
        </p>
        <p className="fight-stage-label">{activeStage.name}</p>
        {status !== 'finished' && (
          <p className="fight-message" role="status" aria-live="polite">{message}</p>
        )}
      </div>

      <div className="fight-controls" aria-label="Controles da luta">
        <span><strong>J1</strong> A/D mover · A recuar/def. · W pular · R soco · T chute · boto: baixo+frente+R · lobo: frente, baixo, trás, cima, frente+R</span>
        <span><strong>J2</strong> ←/→ mover · → recuar/def. · ↑ pular · 2 soco · 3 chute · boto: baixo+frente+2 · lobo: frente, baixo, trás, cima, frente+2</span>
      </div>

      {status === 'paused' && (
        <div className="fight-pause-overlay" role="status" aria-live="polite">
          <p>PAUSE</p>
          <span>ESC ou 8 para continuar</span>
        </div>
      )}

      {status === 'finished' && visibleResultPhase !== 'fight' && (
        <BattleResult
          phase={visibleResultPhase}
          winner={matchWinner}
          winnerCharacter={winnerCharacter}
          loserCharacter={loserCharacter}
          videoRef={revengeVideoRef}
          onLeaveRevenge={leaveRevenge}
          onChooseRevenge={chooseRevenge}
          onReturnToMenu={onReturnToMenu}
        />
      )}
    </section>
  );
}
