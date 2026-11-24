import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, CheckCircle2, AlertTriangle, RotateCcw, Mic } from 'lucide-react';
import { AlibiPuzzleData, AlibiWord } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';
import { CutInOverlay } from './CutInOverlay';
import { VOICE_PROFILES, voiceEngine } from '../utils/voice';
import { sfx } from '../utils/sound';

interface AlibiPuzzleProps {
  puzzle: AlibiPuzzleData;
  onComplete: (bulletId: string) => void;
}

interface ActiveWordState {
  word: AlibiWord;
  index: number;
  xPercent: number; // 0 (left) to 105 (exited right)
  status: 'flying' | 'captured' | 'passed';
}

export const AlibiPuzzle: React.FC<AlibiPuzzleProps> = ({
  puzzle,
  onComplete,
}) => {
  const witness = CHARACTERS[puzzle.witnessId as Exclude<keyof typeof CHARACTERS, never>];
  const voiceProfile = VOICE_PROFILES[puzzle.witnessId];
  const [phase, setPhase] = useState<'briefing' | 'playing' | 'completed'>(
    'briefing'
  );
  const [focus, setFocus] = useState(100);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<string>(
    'Deja pasar las palabras BLANCAS. ¡Dispara solo a las AZULES!'
  );
  const [wordStates, setWordStates] = useState<ActiveWordState[]>([]);
  const [spawnCursor, setSpawnCursor] = useState(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const [reticlePos, setReticlePos] = useState({ x: 50, y: 50 });
  const [meSirveStamp, setMeSirveStamp] = useState<string | null>(null);
  const [showCompleteCutIn, setShowCompleteCutIn] = useState(false);

  const missedBlueTickRef = useRef(false);
  const completedRef = useRef(false);
  const stampTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (stampTimerRef.current) window.clearTimeout(stampTimerRef.current);
    if (completeTimerRef.current) window.clearTimeout(completeTimerRef.current);
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
  };

  useEffect(() => {
    voiceEngine.speak(puzzle.witnessId, puzzle.introText);
    return () => {
      voiceEngine.stop();
      clearTimers();
    };
  }, [puzzle.witnessId, puzzle.introText]);

  const startGame = () => {
    clearTimers();
    completedRef.current = false;
    missedBlueTickRef.current = false;
    setShowCompleteCutIn(false);
    setMeSirveStamp(null);
    sfx.click();
    const fullTestimony = puzzle.words.map((w) => w.text).join(' ');
    voiceEngine.speak(puzzle.witnessId, fullTestimony);
    setFocus(100);
    setSpawnCursor(1);
    setFeedback(
      '¡Atento! Las palabras BLANCAS pasan solas al cartel. ¡Dispara a las AZULES!'
    );
    setWordStates(
      puzzle.words.map((w, idx) => ({
        word: w,
        index: idx,
        xPercent: idx === 0 ? 4 : -999,
        status: 'flying',
      }))
    );
    setPhase('playing');
  };

  // Spawn words sequentially at staggered intervals
  useEffect(() => {
    if (phase !== 'playing') return;
    if (spawnCursor >= puzzle.words.length) return;

    const timer = setInterval(() => {
      setWordStates((prev) =>
        prev.map((item, idx) =>
          idx === spawnCursor && item.xPercent < -100
            ? { ...item, xPercent: -6 }
            : item
        )
      );
      setSpawnCursor((c) => c + 1);
    }, 950);

    return () => clearInterval(timer);
  }, [phase, spawnCursor, puzzle.words.length]);

  // Animation loop moving words from left to right
  useEffect(() => {
    if (phase !== 'playing') return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      setWordStates((prev) => {
        let changed = false;

        const next = prev.map((item) => {
          if (item.status !== 'flying' || item.xPercent < -100) {
            return item;
          }
          changed = true;
          const nextX = item.xPercent + item.word.speed * dt * 15;

          if (nextX >= 94) {
            if (!item.word.isBlueImportant) {
              // White word finished crossing left -> right cleanly!
              return { ...item, xPercent: 96, status: 'passed' as const };
            } else {
              // Blue word escaped unshot: loop back to left so player can catch it!
              missedBlueTickRef.current = true;
              return { ...item, xPercent: -4 };
            }
          }
          return { ...item, xPercent: nextX };
        });

        return changed ? next : prev;
      });

      if (missedBlueTickRef.current) {
        missedBlueTickRef.current = false;
        sfx.error();
        setFocus((f) => Math.max(10, f - 10));
        setFeedback(
          '¡Se escapó una palabra AZUL! Vuelve a cruzar: dispárale antes de que salga.'
        );
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // Check completion: every word is either 'passed' (white) or 'captured' (blue)
  useEffect(() => {
    if (phase !== 'playing' || wordStates.length === 0 || completedRef.current) return;
    const allResolved = wordStates.every(
      (item) => item.status === 'captured' || item.status === 'passed'
    );
    if (allResolved) {
      completedRef.current = true;
      sfx.consentAgree();
      voiceEngine.speak('mateo', '¡Me sirve! ¡Este testimonio está completo!');
      setShowCompleteCutIn(true);
      completeTimerRef.current = window.setTimeout(() => {
        setShowCompleteCutIn(false);
        setPhase('completed');
      }, 1350);
    }
  }, [wordStates, phase]);

  const handleShootWord = (index: number) => {
    if (phase !== 'playing' || showCompleteCutIn) return;
    const target = wordStates[index];
    if (!target || target.status !== 'flying') return;

    if (target.word.isBlueImportant) {
      sfx.blueCapture();
      voiceEngine.speak('mateo', `¡Me sirve! ${target.word.text}`, {
        interrupt: true,
      });
      setMeSirveStamp(target.word.text);
      if (stampTimerRef.current) window.clearTimeout(stampTimerRef.current);
      stampTimerRef.current = window.setTimeout(() => setMeSirveStamp(null), 900);
      setWordStates((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, status: 'captured' } : item
        )
      );
      setFeedback(
        `¡ME SIRVE! Palabra clave "${target.word.text}" fijada en el Cartel.`
      );
    } else {
      sfx.error();
      setShake(true);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => setShake(false), 360);
      setFocus((f) => Math.max(10, f - 12));
      setFeedback(
        `"${target.word.text}" es palabra normal (blanca). ¡Déjala cruzar sola!`
      );
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setReticlePos({ x, y });
  };

  const blueTotal = puzzle.words.filter((w) => w.isBlueImportant).length;
  const blueCaptured = wordStates.filter(
    (w) => w.word.isBlueImportant && w.status === 'captured'
  ).length;
  const whiteTotal = puzzle.words.filter((w) => !w.isBlueImportant).length;
  const whitePassed = wordStates.filter(
    (w) => !w.word.isBlueImportant && w.status === 'passed'
  ).length;

  return (
    <div
      className={`relative w-full rounded-xl border border-cyan-500/40 bg-zinc-950/95 overflow-hidden shadow-2xl ${
        shake ? 'animate-dr-shake' : ''
      }`}
    >
      {showCompleteCutIn && (
        <CutInOverlay
          type="me_sirve"
          subtitle="¡Testimonio armado en el Cartel!"
        />
      )}
      {/* Top Alibi Puzzle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-cyan-500 text-zinc-950 font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            ALIBI PUZZLE
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white leading-tight">
              Testimonio de {witness?.name} · {puzzle.location}
            </h3>
            <p className="text-xs text-zinc-400">{puzzle.contextHint}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono-tabular">
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-300">
            <Mic className="w-3.5 h-3.5" />
            <span>Voz: {voiceProfile.label}</span>
          </div>
          <div className="text-cyan-400">
            Azules capturadas: <span className="font-bold">{blueCaptured}/{blueTotal}</span>
          </div>
          <div className="text-zinc-300">
            Blancas completadas: <span className="font-bold">{whitePassed}/{whiteTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Concentración</span>
            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${focus}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orientation-Adaptive Kinetic Stage */}
      {phase === 'briefing' && (
        <div className="p-5 sm:p-6 flex flex-col landscape:flex-row md:flex-row items-center gap-5 sm:gap-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-cyan-950/30">
          <CharacterSprite
            characterId={puzzle.witnessId}
            expression="worried"
            size="lg"
            className="shrink-0"
          />
          <div className="space-y-4 max-w-2xl">
            <div className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
              Mecánica de Investigación · Coartada en Movimiento
            </div>
            <h4 className="font-display text-3xl font-extrabold text-white">
              Armar el Cartel de Testimonio
            </h4>
            <p className="text-zinc-300 leading-relaxed">{puzzle.introText}</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm bg-zinc-900/90 p-4 rounded-lg border border-zinc-800">
              <div className="space-y-1">
                <div className="font-bold text-white">1. Palabras Blancas (Normales)</div>
                <p className="text-zinc-400 text-xs">
                  Cruzan de izquierda a derecha. No les dispares: déjalas pasar y entrarán solas al cartel.
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-cyan-400">2. Palabras Azules (Importantes)</div>
                <p className="text-zinc-400 text-xs">
                  Son los puntos clave contradecibles en el juicio. ¡Dispárales antes de que salgan por la derecha!
                </p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-lg tracking-wide rounded-lg transition-colors cursor-pointer"
            >
              Iniciar Alibi Puzzle
            </button>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="grid grid-cols-1 landscape:grid-cols-12 lg:grid-cols-12">
          {/* Kinetic Left-to-Right Shooting Arena */}
          <div
            ref={arenaRef}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            className="landscape:col-span-8 lg:col-span-8 relative h-60 sm:h-68 lg:h-72 w-full bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.16),#09090b_75%)] overflow-hidden select-none cursor-crosshair border-b landscape:border-b-0 landscape:border-r lg:border-b-0 lg:border-r border-zinc-800"
          >
            {/* Witness silhouette on right background */}
            <div className="absolute right-4 bottom-0 opacity-35 pointer-events-none">
              <CharacterSprite
                characterId={puzzle.witnessId}
                expression="pointing"
                size="md"
              />
            </div>

            {/* Lane guide lines */}
            <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-zinc-800/70 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-zinc-800/70 pointer-events-none" />

            {/* Right edge capture gate */}
            <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-emerald-500/20 to-transparent border-l border-emerald-500/40 flex items-center justify-center pointer-events-none">
              <span className="[writing-mode:vertical-rl] text-[10px] font-mono-tabular tracking-widest uppercase text-emerald-300">
                ENTRADA AL CARTEL
              </span>
            </div>

            {/* Flying Words (Left -> Right) */}
            {wordStates.map((item, idx) => {
              if (item.status !== 'flying' || item.xPercent < -40) return null;
              const laneTop =
                item.word.lane === 0 ? '18%' : item.word.lane === 1 ? '46%' : '74%';
              return (
                <button
                  key={item.word.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShootWord(idx);
                  }}
                  style={{
                    left: `${item.xPercent}%`,
                    top: laneTop,
                    transform: 'translate(-50%, -50%) skewX(-6deg)',
                  }}
                  className={`absolute px-3.5 py-1.5 font-display font-extrabold text-xl md:text-2xl tracking-wide transition-transform active:scale-90 whitespace-nowrap cursor-crosshair ${
                    item.word.isBlueImportant
                      ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.45)] hover:bg-cyan-400 hover:text-zinc-950'
                      : 'bg-zinc-900/80 text-white border border-zinc-600/80 hover:border-rose-400'
                  }`}
                >
                  {item.word.text}
                </button>
              );
            })}

            {/* Custom Aim Reticle */}
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-cyan-400/80"
              style={{ left: `${reticlePos.x}%`, top: `${reticlePos.y}%` }}
            >
              <Crosshair className="w-7 h-7" />
            </div>

            {/* "¡ME SIRVE!" Dynamic Cut-in Stamp on Blue Word Hit */}
            {meSirveStamp && (
              <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20 px-6 py-2 bg-emerald-400 text-zinc-950 font-display font-extrabold text-3xl tracking-wider uppercase -skew-x-12 border-2 border-white shadow-[0_0_30px_rgba(52,211,153,0.85)] animate-bounce">
                ¡ME SIRVE! · {meSirveStamp}
              </div>
            )}

            {/* Feedback Banner */}
            <div className="absolute bottom-2 left-3 right-12 flex items-center gap-2 text-xs text-zinc-200 bg-zinc-950/85 px-3 py-1.5 rounded border border-zinc-800 pointer-events-none">
              <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{feedback}</span>
            </div>
          </div>

          {/* Live Cartel de Testimonio */}
          <div className="landscape:col-span-4 lg:col-span-4 p-4 bg-zinc-900/95 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
                Cartel de Testimonio en Construcción
              </span>
              <button
                onClick={startGame}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
              </button>
            </div>
            <div className="min-h-20 p-4 rounded-lg bg-zinc-950 border-2 border-amber-500/40 flex flex-wrap items-center gap-x-2 gap-y-2 leading-relaxed">
              {wordStates.map((item) => {
                const isLocked =
                  item.status === 'captured' || item.status === 'passed';
                if (!isLocked) {
                  return (
                    <span
                      key={item.word.id}
                      className={`px-2 py-0.5 rounded text-sm border border-dashed ${
                        item.word.isBlueImportant
                          ? 'border-cyan-500/50 text-cyan-500/50'
                          : 'border-zinc-700 text-zinc-700'
                      }`}
                    >
                      {'_'.repeat(Math.max(3, Math.min(8, item.word.text.length)))}
                    </span>
                  );
                }
                return (
                  <span
                    key={item.word.id}
                    className={
                      item.word.isBlueImportant
                        ? 'px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'text-white font-medium'
                    }
                  >
                    {item.word.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {phase === 'completed' && (
        <div className="p-6 md:p-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/30 space-y-5">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-display font-extrabold text-2xl tracking-wide uppercase">
              ¡Cartel de Testimonio Completado!
            </span>
          </div>

          {/* Final Framed Cartel */}
          <div className="p-5 rounded-xl bg-amber-50 text-zinc-950 border-4 border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b-2 border-zinc-900/20 pb-2">
              <span className="font-display font-extrabold text-lg uppercase tracking-wide">
                Testimonio Oficial · {witness?.name}
              </span>
              <span className="text-xs font-mono-tabular font-bold text-zinc-600">
                ICFES-COARTADA
              </span>
            </div>
            <p className="text-base md:text-lg leading-relaxed flex flex-wrap gap-x-1.5 gap-y-1.5 items-center">
              {puzzle.words.map((w) => (
                <span
                  key={w.id}
                  className={
                    w.isBlueImportant
                      ? 'px-2 py-0.5 bg-cyan-600 text-white font-bold rounded shadow-sm'
                      : 'text-zinc-900 font-medium'
                  }
                >
                  {w.text}
                </span>
              ))}
            </p>
            <div className="pt-2 border-t border-zinc-900/15 text-xs text-zinc-700">
              Las palabras resaltadas en <strong>azul</strong> quedan listas para ser refutadas en el Juicio Escolar.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 p-4 rounded-lg border border-cyan-500/30">
            <div>
              <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                Nueva Bala de Verdad Obtenida
              </div>
              <div className="font-bold text-white">{puzzle.rewardBullet.title}</div>
              <div className="text-xs text-zinc-400">{puzzle.rewardBullet.summary}</div>
            </div>
            <button
              onClick={() => {
                sfx.click();
                onComplete(puzzle.rewardBullet.id);
              }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-display font-extrabold text-lg rounded-lg transition-colors cursor-pointer"
            >
              Guardar en ICFES-Pad
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
