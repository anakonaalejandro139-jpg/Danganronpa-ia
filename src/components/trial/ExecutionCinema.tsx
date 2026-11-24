import React, { useEffect, useState } from 'react';
import { Music, Pause, Play, RotateCcw, Skull, SkipForward } from 'lucide-react';
import { CharacterId } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterSprite } from '../CharacterSprite';
import { ExecutionCanvas } from './ExecutionCanvas';
import { EXECUTION_OST_MAP, ost } from '../../utils/ost';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface ExecutionCinemaProps {
  culpritId: CharacterId;
  executionTitle: string;
  narration: string[];
  survives?: boolean;
  onViewed?: () => void;
  onFinish: () => void;
  finishLabel?: string;
}

export const ExecutionCinema: React.FC<ExecutionCinemaProps> = ({
  culpritId,
  executionTitle,
  narration,
  survives = false,
  onViewed,
  onFinish,
  finishLabel = 'Continuar tras la Ejecución',
}) => {
  const [phase, setPhase] = useState<
    'gavel' | 'chain_yank' | 'playing' | 'verdict_end'
  >('gavel');
  const [progress, setProgress] = useState(0); // 0 -> 1 over ~11 seconds
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [runId, setRunId] = useState(0);

  const culprit =
    CHARACTERS[culpritId as Exclude<keyof typeof CHARACTERS, never>];
  const ostInfo =
    EXECUTION_OST_MAP[culpritId] || EXECUTION_OST_MAP.sebastian;

  const onViewedRef = React.useRef(onViewed);
  onViewedRef.current = onViewed;

  const startSequence = () => {
    setPhase('gavel');
    setProgress(0);
    setMusicPlaying(true);
    setRunId((r) => r + 1);
    sfx.gavel();
    voiceEngine.speak(
      'monokuma',
      '¡Puhuhu! ¡Ha llegado el castigo definitivo!',
      { interrupt: true }
    );
    ost.playExecutionOst(culpritId);
  };

  useEffect(() => {
    startSequence();
    onViewedRef.current?.();
    return () => {
      ost.stop();
      voiceEngine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [culpritId]);

  // Step through gavel -> chain_yank -> playing -> verdict_end smoothly
  useEffect(() => {
    if (phase === 'gavel') {
      const t = window.setTimeout(() => setPhase('chain_yank'), 1800);
      return () => window.clearTimeout(t);
    }
    if (phase === 'chain_yank') {
      voiceEngine.speak(
        culpritId,
        survives || culpritId === 'mateo'
          ? '¡Esperen! ¡Yo no soy el asesino! ¡Es una trampa de Monokuma!'
          : '¡No... suéltenme! ¡No puede ser!',
        { interrupt: false }
      );
      const t = window.setTimeout(() => setPhase('playing'), 2100);
      return () => window.clearTimeout(t);
    }
    if (phase === 'playing') {
      const durationMs = 11000;
      const start = performance.now();
      const iv = window.setInterval(() => {
        const elapsed = performance.now() - start;
        const p = Math.min(1, elapsed / durationMs);
        setProgress(p);
        if (p >= 1) {
          window.clearInterval(iv);
          sfx.gavel();
          setPhase('verdict_end');
        }
      }, 40);
      return () => window.clearInterval(iv);
    }
  }, [phase, culpritId, survives, runId]);

  const toggleMusic = () => {
    if (musicPlaying) {
      ost.stop();
      setMusicPlaying(false);
    } else {
      ost.playExecutionOst(culpritId);
      setMusicPlaying(true);
    }
  };

  const beatIdx = Math.min(
    narration.length - 1,
    Math.floor(progress * narration.length)
  );

  return (
    <div className="rounded-2xl border-2 border-rose-600/80 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Execution OST Bar */}
      <div className="px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs">
          <Music className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="font-bold text-white">{ostInfo.trackName}</span>
          <span className="text-zinc-400">· {ostInfo.subtitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startSequence}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Repetir
          </button>
          <button
            onClick={toggleMusic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer"
          >
            {musicPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar OST
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Reanudar OST
              </>
            )}
          </button>
          <button
            onClick={() => {
              ost.stop();
              onFinish();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" /> Saltar
          </button>
        </div>
      </div>

      {/* Phase 1: Monokuma Red Gavel Button Slam */}
      {phase === 'gavel' && (
        <div className="min-h-[260px] sm:min-h-[380px] flex flex-col items-center justify-center p-4 sm:p-8 text-center space-y-4 sm:space-y-5 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.28),#09090b_70%)]">
          <CharacterSprite
            characterId="monokuma"
            monokumaPose="gavel"
            size="lg"
          />
          <div className="px-5 py-2.5 sm:px-6 sm:py-3 bg-rose-600 text-white font-display font-extrabold text-2xl sm:text-4xl tracking-wider uppercase -rotate-2 shadow-[0_0_30px_rgba(225,29,72,0.85)]">
            ¡HA LLEGADO EL CASTIGO!
          </div>
          <div className="text-xs sm:text-sm text-zinc-200 font-bold uppercase tracking-widest">
            {culprit?.name} · {executionTitle}
          </div>
        </div>
      )}

      {/* Phase 2-4: Real-Time 60fps Animated Execution Canvas */}
      {phase !== 'gavel' && (
        <div className="p-4 space-y-4 bg-black">
          <ExecutionCanvas
            culpritId={culpritId}
            progress={progress}
            phase={phase}
          />

          {/* Synchronized Narration Strip */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-rose-500/40 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                  survives || culpritId === 'mateo'
                    ? 'text-cyan-400'
                    : 'text-rose-400'
                }`}
              >
                <Skull className="w-4 h-4" />
                {executionTitle} · {culprit?.name}
                {(survives || culpritId === 'mateo') && phase === 'verdict_end'
                  ? ' (¡SOBREVIVIÓ POR LA TRAMPILLA!)'
                  : ''}
              </span>
              <span className="text-xs font-mono-tabular text-zinc-400">
                {Math.round(progress * 100)}%
              </span>
            </div>

            <p className="text-sm sm:text-base text-zinc-100 leading-relaxed">
              {narration[beatIdx] || narration[narration.length - 1]}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex-1 max-w-md h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-75 ${
                    survives || culpritId === 'mateo' ? 'bg-cyan-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {phase === 'verdict_end' && (
                <button
                  onClick={() => {
                    ost.stop();
                    sfx.click();
                    onFinish();
                  }}
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-lg rounded-lg transition-colors cursor-pointer"
                >
                  {finishLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
