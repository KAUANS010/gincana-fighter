import { useCallback, useEffect, useRef, useState } from 'react';

export const ARENA_WIDTH = 2560;
export const ARENA_HEIGHT = 1440;
export const ARENA_FLOOR = 1120;
export const CAMERA_WIDTH = 1600;
export const CAMERA_HEIGHT = 900;
export const FIGHTER_WIDTH = 250;
export const CAMERA_MARGIN = 50;
export const MIN_CAMERA_WIDTH = FIGHTER_WIDTH + 180 + CAMERA_MARGIN * 2;

const MATCH_DURATION = 99;
const FIGHTER_LIMIT = 130;
const FIGHTER_MIN_DISTANCE = 180;
const WALK_SPEED = 440;
const JUMP_DURATION = 650;
const PERFECT_GUARD_WINDOW = 140;
const GUARD_CHIP_DAMAGE = 3;
const DEFEND_DURATION = 280;
const SPECIAL_START_DURATION = 250;
const SPECIAL_END_DURATION = 250;
const SPECIAL_COOLDOWN = 1400;
const WEREWOLF_SPECIAL_COOLDOWN = 1800;
const WEREWOLF_SPECIAL_RANGE = FIGHTER_WIDTH;
const WEREWOLF_SPECIAL_STARTUP = 120;
const WEREWOLF_SPECIAL_FRAME_DURATION = 90;
const WEREWOLF_SPECIAL_LANDING_DURATION = 220;
const WEREWOLF_SPECIAL_FALL_DURATION = 540;
const WEREWOLF_KNOCKBACK_DISTANCE = 360;
const WEREWOLF_FALL_SEQUENCE_DURATION =
  WEREWOLF_SPECIAL_LANDING_DURATION + WEREWOLF_SPECIAL_FALL_DURATION;
const WEREWOLF_SPECIAL_DAMAGE = 35;
const WEREWOLF_SPECIAL_FRAMES = [8, 9, 10, 11, 8, 9, 10, 11];
const WEREWOLF_SPECIAL_OFFSETS = [-120, -35, 120, 35];
const DEFEAT_ANIMATION_DURATION = 4000;
const DEFEAT_KNOCKBACK_DISTANCE = 360;
const VICTORY_FRAME_DURATION = 700;
const VICTORY_ANIMATION_DURATION = VICTORY_FRAME_DURATION * 2;
const BOTOUKEN_HITSTUN_DURATION = 600;
const BOTOUKEN_ANIMATION_DURATION = 700;
const BOTOUKEN_FRAME_DURATION = BOTOUKEN_ANIMATION_DURATION / 4;
const BOTOUKEN_SPEED = 360;
const BOTOUKEN_DAMAGE = 35;
const BOTOUKEN_GUARD_DAMAGE = 3;
const BOTOUKEN_HIT_RADIUS = 70;
const BOTOUKEN_COLLISION_DISTANCE = 170;
const BOTOUKEN_HAND_X_OFFSET = 180;
const BOTOUKEN_TOP = ARENA_FLOOR - 310;

const movementKeys = new Set(['a', 'd', 'arrowleft', 'arrowright']);
const attackKeys = {
  r: { player: 'player1', pose: 'punch', damage: 12, range: 235 },
  t: { player: 'player1', pose: 'kick', damage: 20, range: 285 },
  2: { player: 'player2', pose: 'punch', damage: 12, range: 235 },
  3: { player: 'player2', pose: 'kick', damage: 20, range: 285 },
};
const specialPunchKeys = {
  player1: 'r',
  player2: '2',
};
const specialDownKeys = {
  player1: ['s', 'arrowdown'],
  player2: ['arrowdown'],
};
const jumpKeys = {
  w: 'player1',
  arrowup: 'player2',
};
const backwardKeys = {
  player1: 'a',
  player2: 'arrowright',
};
const werewolfSpecialInputs = ['forward', 'down', 'backward', 'up', 'forward'];
const werewolfDownKeys = {
  player1: 's',
  player2: 'arrowdown',
};
const werewolfUpKeys = {
  player1: 'w',
  player2: 'arrowup',
};

function createFighters(characters, cameraWidth) {
  const startingGap = Math.max(
    FIGHTER_MIN_DISTANCE,
    Math.min(
      1320,
      cameraWidth - FIGHTER_WIDTH - CAMERA_MARGIN * 2,
    ),
  );
  const firstPosition = ARENA_WIDTH / 2 - startingGap / 2;
  const secondPosition = ARENA_WIDTH / 2 + startingGap / 2;

  return {
    player1: {
      character: characters?.player1 ?? 'boto',
      x: firstPosition,
      health: 100,
      score: 0,
      facing: 1,
      pose: 'idle',
      attackUntil: 0,
      jumpStartedAt: 0,
      jumpUntil: 0,
      defendUntil: 0,
      specialStartUntil: 0,
      specialUntil: 0,
      grabbedUntil: 0,
      impactStartedAt: 0,
      damageUntil: 0,
    },
    player2: {
      character: characters?.player2 ?? 'lobisomem',
      x: secondPosition,
      health: 100,
      score: 0,
      facing: -1,
      pose: 'idle',
      attackUntil: 0,
      jumpStartedAt: 0,
      jumpUntil: 0,
      defendUntil: 0,
      specialStartUntil: 0,
      specialUntil: 0,
      grabbedUntil: 0,
      impactStartedAt: 0,
      damageUntil: 0,
    },
  };
}

export function useFightingGame(
  characters,
  cameraWidth,
  onAttackSound,
  onSpecialSound,
  onWerewolfSpecialSound,
  onDefeatSound,
  onPauseSound,
) {
  const [fighters, setFightersState] = useState(
    () => createFighters(characters, cameraWidth),
  );
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
  const [status, setStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [projectiles, setProjectiles] = useState([]);
  const [message, setMessage] = useState('A luta começou! Avance e ataque o adversário.');
  const fightersRef = useRef(fighters);
  const projectilesRef = useRef([]);
  const keysDownRef = useRef(new Set());
  const lastAttackRef = useRef({ player1: 0, player2: 0 });
  const lastSpecialRef = useRef({
    player1: Number.NEGATIVE_INFINITY,
    player2: Number.NEGATIVE_INFINITY,
  });
  const nextProjectileIdRef = useRef(0);
  const guardStartedAtRef = useRef({ player1: null, player2: null });
  const werewolfInputRef = useRef({ player1: null, player2: null });
  const lastWerewolfSpecialRef = useRef({
    player1: Number.NEGATIVE_INFINITY,
    player2: Number.NEGATIVE_INFINITY,
  });
  const werewolfSpecialRef = useRef(null);
  const endSequenceRef = useRef(null);
  const [cameraImpactAt, setCameraImpactAt] = useState(0);
  const statusRef = useRef('playing');

  const updateFighters = useCallback((update) => {
    const next = update(fightersRef.current);
    fightersRef.current = next;
    setFightersState(next);
  }, []);

  const clearFightActions = useCallback(() => {
    keysDownRef.current.clear();
    projectilesRef.current = [];
    setProjectiles([]);
    guardStartedAtRef.current = { player1: null, player2: null };
    werewolfInputRef.current = { player1: null, player2: null };
    werewolfSpecialRef.current = null;
  }, []);

  const beginVictory = useCallback((winnerId, finishMessage, loserId = null) => {
    statusRef.current = 'victory';
    setStatus('victory');
    setWinner(winnerId);
    setMessage(finishMessage);
    clearFightActions();
    endSequenceRef.current = {
      phase: 'victory',
      winnerId,
      loserId,
      startedAt: performance.now(),
    };
    updateFighters((current) => ({
      ...current,
      [winnerId]: {
        ...current[winnerId],
        pose: 'victory1',
        attackUntil: 0,
        jumpUntil: 0,
        specialUntil: 0,
      },
      ...(loserId ? {
        [loserId]: {
          ...current[loserId],
          pose: 'defeatFall3',
        },
      } : {}),
    }));
  }, [clearFightActions, updateFighters]);

  const beginDefeat = useCallback((winnerId, loserId, finishMessage) => {
    if (statusRef.current !== 'playing') return;

    const now = performance.now();
    const loser = fightersRef.current[loserId];
    statusRef.current = 'defeating';
    setStatus('defeating');
    setWinner(winnerId);
    setMessage(`${loserId === 'player1' ? 'Jogador 1' : 'Jogador 2'} foi derrotado!`);
    clearFightActions();
    endSequenceRef.current = {
      phase: 'defeat',
      winnerId,
      loserId,
      finishMessage,
      startedAt: now,
      startX: loser.x,
      direction: -loser.facing,
    };
    onDefeatSound?.(loser.character);
    updateFighters((current) => ({
      ...current,
      [winnerId]: {
        ...current[winnerId],
        pose: 'idle',
        attackUntil: 0,
        jumpUntil: 0,
      },
      [loserId]: {
        ...current[loserId],
        health: 0,
        pose: 'defeatFall1',
        attackUntil: 0,
        jumpUntil: 0,
        specialUntil: 0,
        grabbedUntil: 0,
        damageUntil: 0,
      },
    }));
  }, [clearFightActions, onDefeatSound, updateFighters]);

  const finishMatch = useCallback((winnerId, finishMessage) => {
    if (statusRef.current !== 'playing') return;
    if (winnerId) {
      beginVictory(winnerId, finishMessage);
      return;
    }

    statusRef.current = 'finished';
    setStatus('finished');
    setWinner(null);
    setMessage(finishMessage);
    clearFightActions();
    endSequenceRef.current = null;
  }, [beginVictory, clearFightActions]);

  const resetRound = useCallback((roundNumber) => {
    const nextFighters = createFighters(characters, cameraWidth);
    fightersRef.current = nextFighters;
    setFightersState(nextFighters);
    projectilesRef.current = [];
    setProjectiles([]);
    keysDownRef.current.clear();
    lastAttackRef.current = { player1: 0, player2: 0 };
    lastSpecialRef.current = {
      player1: Number.NEGATIVE_INFINITY,
      player2: Number.NEGATIVE_INFINITY,
    };
    guardStartedAtRef.current = { player1: null, player2: null };
    werewolfInputRef.current = { player1: null, player2: null };
    lastWerewolfSpecialRef.current = {
      player1: Number.NEGATIVE_INFINITY,
      player2: Number.NEGATIVE_INFINITY,
    };
    werewolfSpecialRef.current = null;
    endSequenceRef.current = null;
    statusRef.current = 'playing';
    setStatus('playing');
    setWinner(null);
    setTimeLeft(MATCH_DURATION);
    setCameraImpactAt(0);
    setMessage(`Round ${roundNumber}! A luta começou.`);
  }, [cameraWidth, characters]);

  const togglePause = useCallback(() => {
    if (statusRef.current !== 'playing' && statusRef.current !== 'paused') return;

    const nextStatus = statusRef.current === 'paused' ? 'playing' : 'paused';
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    keysDownRef.current.clear();
    guardStartedAtRef.current = { player1: null, player2: null };
    werewolfInputRef.current = { player1: null, player2: null };
    onPauseSound?.();
  }, [onPauseSound]);

  const updateProjectiles = useCallback((next) => {
    projectilesRef.current = next;
    setProjectiles(next);
  }, []);

  useEffect(() => {
    const maximumFighterDistance = Math.max(
      FIGHTER_MIN_DISTANCE,
      cameraWidth - FIGHTER_WIDTH - CAMERA_MARGIN * 2,
    );
    const currentDistance = fightersRef.current.player2.x - fightersRef.current.player1.x;

    if (currentDistance > maximumFighterDistance) {
      const midpoint = (fightersRef.current.player1.x + fightersRef.current.player2.x) / 2;
      const firstX = Math.max(
        FIGHTER_LIMIT,
        Math.min(
          ARENA_WIDTH - FIGHTER_LIMIT - maximumFighterDistance,
          midpoint - maximumFighterDistance / 2,
        ),
      );

      updateFighters((current) => ({
        ...current,
        player1: { ...current.player1, x: firstX },
        player2: { ...current.player2, x: firstX + maximumFighterDistance },
      }));
    }
  }, [cameraWidth, updateFighters]);

  const attack = useCallback((playerId, attackType) => {
    if (statusRef.current !== 'playing') return;

    const now = performance.now();
    if (
      now < fightersRef.current[playerId].specialUntil
      || now < fightersRef.current[playerId].grabbedUntil
      || now < fightersRef.current[playerId].damageUntil
    ) return;
    if (now - lastAttackRef.current[playerId] < 420) return;
    lastAttackRef.current[playerId] = now;
    onAttackSound?.(attackType.pose);

    const opponentId = playerId === 'player1' ? 'player2' : 'player1';
    let connected = false;
    let damage = 0;
    let perfectGuard = false;
    let opponentDefeated = false;

    updateFighters((current) => {
      const attacker = current[playerId];
      const opponent = current[opponentId];
      const distance = opponent.x - attacker.x;
      const facing = distance >= 0 ? 1 : -1;
      const inRange = Math.abs(distance) <= attackType.range;
      connected = inRange && facing === attacker.facing;
      const guarding = keysDownRef.current.has(backwardKeys[opponentId]);
      const guardedHit = connected && guarding;
      const guardStartedAt = guardStartedAtRef.current[opponentId];
      perfectGuard = connected
        && guarding
        && guardStartedAt !== null
        && now - guardStartedAt <= PERFECT_GUARD_WINDOW;
      damage = connected
        ? guarding
          ? perfectGuard ? 0 : GUARD_CHIP_DAMAGE
          : attackType.damage
        : 0;
      opponentDefeated = damage > 0 && damage >= opponent.health;

      return {
        ...current,
        [playerId]: {
          ...attacker,
          facing,
          pose: attackType.pose,
          attackUntil: now + 280,
          score: attacker.score + damage,
        },
        [opponentId]: guardedHit
          ? {
            ...opponent,
            health: Math.max(0, opponent.health - damage),
            pose: 'defend',
            attackUntil: 0,
            defendUntil: now + DEFEND_DURATION,
            jumpUntil: 0,
          }
          : damage > 0
            ? { ...opponent, health: Math.max(0, opponent.health - damage) }
            : opponent,
      };
    });

    if (opponentDefeated) {
      beginDefeat(
        playerId,
        opponentId,
        `${playerId === 'player1' ? 'Jogador 1' : 'Jogador 2'} venceu!`,
      );
    } else if (perfectGuard) {
      setMessage(`${opponentId === 'player1' ? 'Jogador 1' : 'Jogador 2'} fez uma defesa perfeita!`);
    } else if (connected && damage > 0 && damage < attackType.damage) {
      setMessage(`${opponentId === 'player1' ? 'Jogador 1' : 'Jogador 2'} defendeu, mas sofreu dano.`);
    } else if (connected) {
      setMessage(`${playerId === 'player1' ? 'Jogador 1' : 'Jogador 2'} acertou um golpe!`);
    } else {
      setMessage(`${playerId === 'player1' ? 'Jogador 1' : 'Jogador 2'} atacou, mas errou.`);
    }
  }, [beginDefeat, onAttackSound, updateFighters]);

  const special = useCallback((playerId) => {
    if (statusRef.current !== 'playing') return;

    const now = performance.now();
    const fighter = fightersRef.current[playerId];
    if (
      fighter.character !== 'boto'
      || now - lastSpecialRef.current[playerId] < SPECIAL_COOLDOWN
      || now < fighter.attackUntil
      || now < fighter.jumpUntil
      || now < fighter.defendUntil
      || now < fighter.specialUntil
      || now < fighter.damageUntil
    ) return;

    lastSpecialRef.current[playerId] = now;
    onSpecialSound?.();
    updateFighters((current) => ({
      ...current,
      [playerId]: {
        ...current[playerId],
        pose: 'specialStart',
        attackUntil: 0,
        jumpUntil: 0,
        specialStartUntil: now + SPECIAL_START_DURATION,
        specialUntil: now + SPECIAL_START_DURATION + SPECIAL_END_DURATION,
      },
    }));
    updateProjectiles([
      ...projectilesRef.current,
      {
        id: nextProjectileIdRef.current++,
        owner: playerId,
        x: fighter.x + fighter.facing * BOTOUKEN_HAND_X_OFFSET,
        y: BOTOUKEN_TOP,
        facing: fighter.facing,
        startedAt: now,
        frame: 0,
      },
    ]);
  }, [onSpecialSound, updateFighters, updateProjectiles]);

  const werewolfSpecial = useCallback((playerId) => {
    if (statusRef.current !== 'playing') return false;

    const now = performance.now();
    const opponentId = playerId === 'player1' ? 'player2' : 'player1';
    const fighter = fightersRef.current[playerId];
    const opponent = fightersRef.current[opponentId];
    const direction = Math.sign(opponent.x - fighter.x);
    if (
      fighter.character !== 'lobisomem'
      || Math.abs(opponent.x - fighter.x) > WEREWOLF_SPECIAL_RANGE
      || fighter.facing !== direction
      || now - lastWerewolfSpecialRef.current[playerId] < WEREWOLF_SPECIAL_COOLDOWN
      || now < fighter.attackUntil
      || now < fighter.jumpUntil
      || now < fighter.defendUntil
      || now < fighter.specialUntil
      || now < fighter.grabbedUntil
      || now < fighter.damageUntil
      || now < fighter.damageUntil
      || now < opponent.specialUntil
      || now < opponent.grabbedUntil
    ) return false;

    const airStartedAt = now + WEREWOLF_SPECIAL_STARTUP;
    const landingAt = airStartedAt
      + WEREWOLF_SPECIAL_FRAMES.length * WEREWOLF_SPECIAL_FRAME_DURATION;
    const landingPoseUntil = landingAt + WEREWOLF_SPECIAL_LANDING_DURATION;
    const finishAt = landingAt + WEREWOLF_FALL_SEQUENCE_DURATION;
    lastWerewolfSpecialRef.current[playerId] = now;
    onWerewolfSpecialSound?.();
    werewolfSpecialRef.current = {
      attackerId: playerId,
      victimId: opponentId,
      direction,
      anchorX: opponent.x,
      airStartedAt,
      landingAt,
      landingPoseUntil,
      finishAt,
      didImpact: false,
      pendingWinner: null,
    };
    updateFighters((current) => ({
      ...current,
      [playerId]: {
        ...current[playerId],
        pose: 'werewolfSpecial1',
        attackUntil: 0,
        jumpStartedAt: airStartedAt,
        jumpUntil: landingAt,
        specialUntil: landingPoseUntil,
      },
      [opponentId]: {
        ...current[opponentId],
        pose: 'grabbed',
        attackUntil: 0,
        jumpUntil: 0,
        grabbedUntil: finishAt,
      },
    }));
    werewolfInputRef.current[playerId] = null;
    setMessage(`${playerId === 'player1' ? 'Jogador 1' : 'Jogador 2'} iniciou o especial do lobisomem!`);
    return true;
  }, [onWerewolfSpecialSound, updateFighters]);

  const jump = useCallback((playerId) => {
    if (statusRef.current !== 'playing') return;

    const now = performance.now();
    updateFighters((current) => {
      const fighter = current[playerId];
      if (
        now < fighter.jumpUntil
        || now < fighter.defendUntil
        || now < fighter.specialUntil
        || now < fighter.grabbedUntil
        || now < fighter.damageUntil
      ) return current;

      return {
        ...current,
        [playerId]: {
          ...fighter,
          pose: 'jump',
          attackUntil: 0,
          jumpStartedAt: now,
          jumpUntil: now + JUMP_DURATION,
        },
      };
    });
  }, [updateFighters]);

  useEffect(() => {
    const registerWerewolfInput = (playerId, key, now) => {
      const fighter = fightersRef.current[playerId];
      if (fighter.character !== 'lobisomem') return null;

      const forwardKey = playerId === 'player1'
        ? fighter.facing > 0 ? 'd' : 'a'
        : fighter.facing > 0 ? 'arrowright' : 'arrowleft';
      const backwardKey = playerId === 'player1'
        ? fighter.facing > 0 ? 'a' : 'd'
        : fighter.facing > 0 ? 'arrowleft' : 'arrowright';
      const direction = key === forwardKey
        ? 'forward'
        : key === backwardKey
          ? 'backward'
          : key === werewolfDownKeys[playerId]
            ? 'down'
            : key === werewolfUpKeys[playerId]
              ? 'up'
              : null;
      if (!direction) return null;

      const previous = werewolfInputRef.current[playerId];
      const progress = previous && now - previous.lastAt <= 1000
        ? previous.index
        : 0;
      const expected = werewolfSpecialInputs[progress];
      const nextProgress = direction === expected
        ? progress + 1
        : direction === werewolfSpecialInputs[0] ? 1 : 0;
      werewolfInputRef.current[playerId] = {
        index: nextProgress,
        lastAt: now,
        readyUntil: nextProgress === werewolfSpecialInputs.length ? now + 500 : 0,
      };
      return direction;
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const now = performance.now();
      if (key === 'escape' || key === '8' || event.code === 'Numpad8') {
        event.preventDefault();
        if (!event.repeat) togglePause();
        return;
      }
      if (statusRef.current !== 'playing') {
        event.preventDefault();
        return;
      }
      if (key === 'arrowdown') {
        event.preventDefault();
      }
      if (key === 's' || key === 'arrowdown') keysDownRef.current.add(key);
      if (movementKeys.has(key)) {
        event.preventDefault();
        if (
          Object.values(backwardKeys).includes(key)
          && !keysDownRef.current.has(key)
        ) {
          const playerId = Object.keys(backwardKeys)
            .find((id) => backwardKeys[id] === key);
          if (playerId) guardStartedAtRef.current[playerId] = performance.now();
        }
        keysDownRef.current.add(key);
      }
      if (Object.values(specialPunchKeys).includes(key)) {
        keysDownRef.current.add(key);
      }

      if (!event.repeat) {
        let matchedUpInput = false;
        for (const playerId of ['player1', 'player2']) {
          const direction = registerWerewolfInput(playerId, key, now);
          if (direction === 'up') matchedUpInput = true;
          const fighter = fightersRef.current[playerId];
          const forwardKey = playerId === 'player1'
            ? fighter.facing > 0 ? 'd' : 'a'
            : fighter.facing > 0 ? 'arrowright' : 'arrowleft';
          const combo = specialDownKeys[playerId]
            .some((downKey) => keysDownRef.current.has(downKey))
            && keysDownRef.current.has(forwardKey)
            && keysDownRef.current.has(specialPunchKeys[playerId]);
          if (combo) {
            special(playerId);
          }
        }

        const jumpPlayer = jumpKeys[key];
        if (jumpPlayer) {
          event.preventDefault();
          const input = werewolfInputRef.current[jumpPlayer];
          const isSpecialUp = matchedUpInput
            && input
            && now - input.lastAt < 50
            && input.index === 4;
          if (!isSpecialUp) {
            jump(jumpPlayer);
          }
        }
      }

      const attackType = attackKeys[key];
      if (attackType && !event.repeat) {
        event.preventDefault();
        const input = werewolfInputRef.current[attackType.player];
        if (
          input
          && input.index === werewolfSpecialInputs.length
          && now <= input.readyUntil
          && werewolfSpecial(attackType.player)
        ) {
          werewolfInputRef.current[attackType.player] = null;
        } else {
          attack(attackType.player, attackType);
        }
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      keysDownRef.current.delete(key);
      const guardingPlayer = Object.keys(backwardKeys)
        .find((id) => backwardKeys[id] === key);
      if (guardingPlayer) guardStartedAtRef.current[guardingPlayer] = null;
    };

    const clearKeys = () => {
      keysDownRef.current.clear();
      guardStartedAtRef.current = { player1: null, player2: null };
      werewolfInputRef.current = { player1: null, player2: null };
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearKeys);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, [attack, jump, special, togglePause, werewolfSpecial]);

  useEffect(() => {
    let frameId;
    let previousTime = performance.now();

    const updateMovement = (now) => {
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      const keys = keysDownRef.current;

      if (statusRef.current === 'playing') {
        updateFighters((current) => {
          const maximumFighterDistance = Math.max(
            FIGHTER_MIN_DISTANCE,
            cameraWidth - FIGHTER_WIDTH - CAMERA_MARGIN * 2,
          );
          const firstDirection = now < current.player1.defendUntil
            || now < current.player1.specialUntil
            || now < current.player1.grabbedUntil
            || now < current.player1.damageUntil
            ? 0
            : Number(keys.has('d')) - Number(keys.has('a'));
          const secondDirection = now < current.player2.defendUntil
            || now < current.player2.specialUntil
            || now < current.player2.grabbedUntil
            || now < current.player2.damageUntil
            ? 0
            : Number(keys.has('arrowright')) - Number(keys.has('arrowleft'));
          let firstX = Math.min(
            ARENA_WIDTH - FIGHTER_LIMIT,
            Math.max(FIGHTER_LIMIT, current.player1.x + firstDirection * WALK_SPEED * delta),
          );
          let secondX = Math.min(
            ARENA_WIDTH - FIGHTER_LIMIT,
            Math.max(FIGHTER_LIMIT, current.player2.x + secondDirection * WALK_SPEED * delta),
          );

          if (secondX - firstX < FIGHTER_MIN_DISTANCE) {
            const midpoint = (firstX + secondX) / 2;
            firstX = Math.max(FIGHTER_LIMIT, midpoint - FIGHTER_MIN_DISTANCE / 2);
            secondX = Math.min(
              ARENA_WIDTH - FIGHTER_LIMIT,
              firstX + FIGHTER_MIN_DISTANCE,
            );
          }

          if (secondX - firstX > maximumFighterDistance) {
            if (firstDirection < 0 && secondDirection > 0) {
              firstX = current.player1.x;
              secondX = current.player2.x;
            } else if (firstDirection < 0) {
              firstX = secondX - maximumFighterDistance;
            } else if (secondDirection > 0) {
              secondX = firstX + maximumFighterDistance;
            }
          }

          const next = { ...current };
          let changed = false;

          for (const [playerId, direction] of [
            ['player1', firstDirection],
            ['player2', secondDirection],
          ]) {
            const fighter = current[playerId];
            const x = playerId === 'player1' ? firstX : secondX;
            const opponentId = playerId === 'player1' ? 'player2' : 'player1';
            const facing = current[opponentId].x >= x ? 1 : -1;
            const pose = now < fighter.damageUntil
              ? 'specialDamage'
              : now < fighter.attackUntil
                ? fighter.pose
              : now < fighter.specialStartUntil
                ? 'specialStart'
                : now < fighter.specialUntil
                  ? 'specialEnd'
              : now < fighter.defendUntil
                ? 'defend'
                : now < fighter.jumpUntil
                  ? 'jump'
                  : direction === 0
                    ? 'idle'
                    : direction === (facing > 0 ? 1 : -1)
                      ? 'walkForward'
                      : 'walkBackward';

            if (
              x !== fighter.x
              || pose !== fighter.pose
              || facing !== fighter.facing
              || (now >= fighter.jumpUntil && fighter.pose === 'jump')
              || (now >= fighter.defendUntil && fighter.pose === 'defend')
              || (now >= fighter.specialUntil && (fighter.pose === 'specialStart' || fighter.pose === 'specialEnd'))
            ) {
              next[playerId] = { ...fighter, x, pose, facing };
              changed = true;
            }
          }

          const specialSequence = werewolfSpecialRef.current;
          if (specialSequence) {
            const {
              attackerId,
              victimId,
              direction: specialDirection,
              anchorX,
              airStartedAt,
              landingAt,
              landingPoseUntil,
              finishAt,
            } = specialSequence;
            const attackerX = (value) => Math.max(
              FIGHTER_LIMIT,
              Math.min(ARENA_WIDTH - FIGHTER_LIMIT, value),
            );
            const victim = current[victimId];
            let justImpacted = false;

            if (!specialSequence.didImpact && now >= landingAt) {
              justImpacted = true;
              specialSequence.didImpact = true;
              specialSequence.impactStartedAt = now;
              specialSequence.pendingWinner = WEREWOLF_SPECIAL_DAMAGE >= victim.health
                ? attackerId
                : null;
              setCameraImpactAt(now);
            }

            if (now < landingAt) {
              const isAirborne = now >= airStartedAt;
              const elapsedInAir = Math.max(0, now - airStartedAt);
              const cycleProgress = elapsedInAir / WEREWOLF_SPECIAL_FRAME_DURATION;
              const frameIndex = Math.min(
                WEREWOLF_SPECIAL_FRAMES.length - 1,
                Math.floor(cycleProgress),
              );
              const frame = isAirborne
                ? WEREWOLF_SPECIAL_FRAMES[frameIndex]
                : 7;
              const offsetIndex = frameIndex % WEREWOLF_SPECIAL_OFFSETS.length;
              const nextOffsetIndex = (offsetIndex + 1) % WEREWOLF_SPECIAL_OFFSETS.length;
              const frameProgress = isAirborne ? cycleProgress % 1 : 0;
              const offset = WEREWOLF_SPECIAL_OFFSETS[offsetIndex]
                + (WEREWOLF_SPECIAL_OFFSETS[nextOffsetIndex]
                  - WEREWOLF_SPECIAL_OFFSETS[offsetIndex]) * frameProgress;
              const attackerPosition = frame === 7
                ? anchorX - specialDirection * 80
                : anchorX - specialDirection * offset;

              const attackerPositionX = attackerX(attackerPosition);
              const victimPositionX = attackerX(anchorX);
              next[attackerId] = {
                ...current[attackerId],
                x: attackerPositionX,
                facing: specialDirection,
                pose: `werewolfSpecial${frame === 7 ? 1 : frame - 6}`,
              };
              next[victimId] = {
                ...victim,
                x: victimPositionX,
                facing: -specialDirection,
                pose: isAirborne ? 'grabbed' : 'idle',
              };
              changed = true;
            } else {
              if (now < landingPoseUntil) {
                next[attackerId] = {
                  ...current[attackerId],
                  x: attackerX(anchorX + specialDirection * 80),
                  facing: specialDirection,
                  pose: 'werewolfSpecial6',
                };
              }
              const fallProgress = Math.min(1, (now - landingAt) / (finishAt - landingAt));
              const fallFrame = fallProgress < 1 / 3 ? 1 : fallProgress < 2 / 3 ? 2 : 3;
              next[victimId] = {
                ...victim,
                x: attackerX(anchorX + specialDirection * WEREWOLF_KNOCKBACK_DISTANCE * fallProgress),
                pose: now >= finishAt ? 'idle' : `fall${fallFrame}`,
                grabbedUntil: now >= finishAt ? 0 : victim.grabbedUntil,
              };
              changed = true;
            }

            if (justImpacted) {
              next[attackerId] = {
                ...next[attackerId],
                score: current[attackerId].score + WEREWOLF_SPECIAL_DAMAGE,
                impactStartedAt: specialSequence.impactStartedAt,
              };
              next[victimId] = {
                ...next[victimId],
                health: Math.max(0, victim.health - WEREWOLF_SPECIAL_DAMAGE),
              };
            }
          }

          return changed ? next : current;
        });

        const specialSequence = werewolfSpecialRef.current;
        if (specialSequence?.pendingWinner) {
          const { attackerId, victimId } = specialSequence;
          werewolfSpecialRef.current = null;
          beginDefeat(
            attackerId,
            victimId,
            `${attackerId === 'player1' ? 'Jogador 1' : 'Jogador 2'} venceu!`,
          );
        } else if (specialSequence && now >= specialSequence.finishAt) {
          werewolfSpecialRef.current = null;
        }
      }

      if (statusRef.current === 'playing' && projectilesRef.current.length > 0) {
        const advancedProjectiles = projectilesRef.current.map((projectile) => ({
          ...projectile,
          x: projectile.x + projectile.facing * BOTOUKEN_SPEED * delta,
          frame: Math.min(
            3,
            Math.floor((now - projectile.startedAt) / BOTOUKEN_FRAME_DURATION),
          ),
        }));
        const cancelledProjectiles = new Set();
        for (let firstIndex = 0; firstIndex < advancedProjectiles.length; firstIndex += 1) {
          const first = advancedProjectiles[firstIndex];
          for (let secondIndex = firstIndex + 1; secondIndex < advancedProjectiles.length; secondIndex += 1) {
            const second = advancedProjectiles[secondIndex];
            if (
              first.owner !== second.owner
              && Math.abs(first.x - second.x) <= BOTOUKEN_COLLISION_DISTANCE
            ) {
              cancelledProjectiles.add(first.id);
              cancelledProjectiles.add(second.id);
            }
          }
        }

        const remainingProjectiles = [];
        for (const projectile of advancedProjectiles) {
          if (statusRef.current !== 'playing') break;
          if (cancelledProjectiles.has(projectile.id)) continue;
          const { x } = projectile;
          const opponentId = projectile.owner === 'player1' ? 'player2' : 'player1';
          const opponent = fightersRef.current[opponentId];
          const hit = now >= opponent.jumpUntil
            && Math.abs(x - opponent.x) <= FIGHTER_WIDTH / 2 + BOTOUKEN_HIT_RADIUS;
          const outsideArena = x < 0 || x > ARENA_WIDTH;

          if (hit) {
            const guarding = keysDownRef.current.has(backwardKeys[opponentId]);
            const guardStartedAt = guardStartedAtRef.current[opponentId];
            const perfectGuard = guarding
              && guardStartedAt !== null
              && now - guardStartedAt <= PERFECT_GUARD_WINDOW;
            const damage = guarding
              ? perfectGuard ? 0 : BOTOUKEN_GUARD_DAMAGE
              : BOTOUKEN_DAMAGE;
            const defeated = damage > 0 && damage >= opponent.health;

            updateFighters((current) => ({
              ...current,
              [projectile.owner]: {
                ...current[projectile.owner],
                score: current[projectile.owner].score + damage,
              },
              [opponentId]: {
                ...current[opponentId],
                health: Math.max(0, current[opponentId].health - damage),
                ...(damage > 0 ? {
                  pose: 'specialDamage',
                  damageUntil: now + BOTOUKEN_HITSTUN_DURATION,
                  attackUntil: 0,
                  jumpUntil: 0,
                } : guarding ? {
                  pose: 'defend',
                  attackUntil: 0,
                  defendUntil: now + DEFEND_DURATION,
                  jumpUntil: 0,
                } : {}),
              },
            }));

            if (defeated) {
              beginDefeat(
                projectile.owner,
                opponentId,
                `${projectile.owner === 'player1' ? 'Jogador 1' : 'Jogador 2'} venceu!`,
              );
            } else if (perfectGuard) {
              setMessage(`${opponentId === 'player1' ? 'Jogador 1' : 'Jogador 2'} fez uma defesa perfeita!`);
            } else if (guarding) {
              setMessage(`${opponentId === 'player1' ? 'Jogador 1' : 'Jogador 2'} defendeu o botouken, mas sofreu dano.`);
            } else {
              setMessage(`${projectile.owner === 'player1' ? 'Jogador 1' : 'Jogador 2'} acertou o botouken!`);
            }
          } else if (!outsideArena) {
            remainingProjectiles.push(projectile);
          }
        }
        updateProjectiles(remainingProjectiles);
      }

      if (statusRef.current === 'defeating') {
        const sequence = endSequenceRef.current;
        if (sequence?.phase === 'defeat') {
          const progress = Math.min(1, (now - sequence.startedAt) / DEFEAT_ANIMATION_DURATION);
          const fallFrame = Math.min(3, Math.floor(progress * 3) + 1);
          const pose = progress >= 1 ? 'defeatFall3' : `defeatFall${fallFrame}`;
          const x = Math.max(
            FIGHTER_LIMIT,
            Math.min(
              ARENA_WIDTH - FIGHTER_LIMIT,
              sequence.startX + sequence.direction * DEFEAT_KNOCKBACK_DISTANCE * progress,
            ),
          );
          const loser = fightersRef.current[sequence.loserId];
          if (loser.x !== x || loser.pose !== pose) {
            updateFighters((current) => ({
              ...current,
              [sequence.loserId]: { ...current[sequence.loserId], x, pose },
            }));
          }

          if (progress >= 1) {
            beginVictory(sequence.winnerId, sequence.finishMessage, sequence.loserId);
          }
        }
      } else if (statusRef.current === 'victory') {
        const sequence = endSequenceRef.current;
        if (sequence?.phase === 'victory') {
          const elapsed = now - sequence.startedAt;
          if (elapsed >= VICTORY_ANIMATION_DURATION) {
            statusRef.current = 'finished';
            setStatus('finished');
            setMessage(sequence.finishMessage);
            endSequenceRef.current = null;
          } else {
            const pose = elapsed < VICTORY_FRAME_DURATION ? 'victory1' : 'victory2';
            if (fightersRef.current[sequence.winnerId].pose !== pose) {
              updateFighters((current) => ({
                ...current,
                [sequence.winnerId]: { ...current[sequence.winnerId], pose },
              }));
            }
          }
        }
      }

      frameId = window.requestAnimationFrame(updateMovement);
    };

    frameId = window.requestAnimationFrame(updateMovement);
    return () => window.cancelAnimationFrame(frameId);
  }, [beginDefeat, beginVictory, cameraWidth, finishMatch, updateFighters, updateProjectiles]);

  useEffect(() => {
    if (status !== 'playing') return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((remaining) => {
        if (remaining <= 1) {
          const current = fightersRef.current;
          const winnerId = current.player1.health === current.player2.health
            ? null
            : current.player1.health > current.player2.health ? 'player1' : 'player2';
          finishMatch(
            winnerId,
            winnerId
              ? `Tempo esgotado! ${winnerId === 'player1' ? 'Jogador 1' : 'Jogador 2'} venceu por ter mais vida.`
              : 'Tempo esgotado! A luta terminou empatada.',
          );
          return 0;
        }

        return remaining - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishMatch, status]);

  return {
    fighters,
    cameraImpactAt,
    message,
    projectiles,
    resetRound,
    status,
    timeLeft,
    togglePause,
    winner,
  };
}
