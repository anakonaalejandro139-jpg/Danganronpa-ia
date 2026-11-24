import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pickaxe, Eye } from 'lucide-react';
import { MindMineStep } from '../../types/game';
import { CutInOverlay } from '../CutInOverlay';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface MindMineProps {
  step: MindMineStep;
  onDamage: () => void;
  onSuccess: (afterDialogue: MindMineStep['afterDialogue']) => void;
}

const COLORS = [
  'bg-cyan-500 border-cyan-300',
  'bg-rose-500 border-rose-300',
  'bg-amber-400 border-amber-200',
  'bg-emerald-500 border-emerald-300',
];

const EVIDENCE_EMOJI: Record<MindMineStep['iconType'], string> = {
  tejo: '🥏',
  veneno: '🧪',
  laptop: '💻',
  pendulo: '⏱️',
  prensa: '⚙️',
  grabadora: '🎙️',
  llave_icfes: '🗝️',
};

export const MindMine: React.FC<MindMineProps> = ({
  step,
  onDamage,
  onSuccess,
}) => {
  const rows = 4;
  const cols = 6;

  // Deterministic initial 4x6 grid of colored blocks
  const initialGrid = useMemo(() => {
    const g: (number | null)[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: (number | null)[] = [];
      for (let c = 0; c < cols; c++) {
        row.push((r * 2 + c + step.title.length) % 4);
      }
      g.push(row);
    }
    return g;
  }, [step.title.length]);

  const [grid, setGrid] = useState<(number | null)[][]>(initialGrid);
  const [clearedCount, setClearedCount] = useState(0);
  const [showCutIn, setShowCutIn] = useState(false);
  const [msg, setMsg] = useState(
    'Haz clic en los bloques para excavar tu mente y revelar el objeto oculto.'
  );
  const cutInTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cutInTimerRef.current !== null) window.clearTimeout(cutInTimerRef.current);
    };
  }, []);

  const totalCells = rows * cols;
  const revealedEnough = clearedCount >= 10;

  const handleBreakBlock = (r: number, c: number) => {
    if (showCutIn) return;
    const targetColor = grid[r][c];
    if (targetColor === null) return;

    sfx.slash();
    // Flood fill connected blocks of same color
    const visited = new Set<string>();
    const queue: [number, number][] = [[r, c]];
    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      const key = `${cr}-${cc}`;
      if (visited.has(key)) continue;
      if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
      if (grid[cr][cc] !== targetColor) continue;
      visited.add(key);
      queue.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
    }

    let newlyCleared = 0;
    const nextGrid = grid.map((row, ri) =>
      row.map((val, ci) => {
        if (visited.has(`${ri}-${ci}`)) {
          newlyCleared++;
          return null;
        }
        return val;
      })
    );

    setGrid(nextGrid);
    setClearedCount((prev) => prev + newlyCleared);
    setMsg(`Excavaste ${newlyCleared} bloque(s). ¡Identifica la evidencia abajo!`);
  };

  const handleGuess = (idx: number) => {
    if (showCutIn) return;
    if (idx === step.correctIndex) {
      sfx.contradictBreak();
      voiceEngine.speak('mateo', '¡Ya lo tengo!', { interrupt: true });
      setShowCutIn(true);
      cutInTimerRef.current = window.setTimeout(() => {
        setShowCutIn(false);
        onSuccess(step.afterDialogue);
      }, 1250);
    } else {
      sfx.error();
      onDamage();
      setMsg('¡No es esa evidencia! Excava un poco más para ver el contorno.');
    }
  };

  return (
    <div className="relative rounded-xl border border-emerald-500/40 bg-zinc-950 overflow-hidden shadow-2xl">
      {showCutIn && (
        <CutInOverlay
          type="ya_lo_tengo"
          subtitle={step.options[step.correctIndex]}
        />
      )}
      <div className="px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-400 text-zinc-950 font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            EXCAVACIÓN MENTAL (MIND MINE)
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">{step.question}</p>
          </div>
        </div>
        <div className="text-xs font-mono-tabular text-emerald-300 flex items-center gap-1.5">
          <Pickaxe className="w-4 h-4" />
          <span>Excavado: {Math.round((clearedCount / totalCells) * 100)}%</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 gap-5 sm:gap-6 items-center">
        {/* Excavation Grid */}
        <div className="relative rounded-xl bg-zinc-900 border-2 border-zinc-800 p-3 overflow-hidden">
          {/* Hidden silhouette behind grid */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="text-7xl">{EVIDENCE_EMOJI[step.iconType]}</div>
            <div className="mt-2 px-3 py-1 bg-zinc-950/90 border border-emerald-500/40 rounded text-xs font-bold text-emerald-300">
              {revealedEnough ? step.hiddenLabel : 'Objeto Oculto'}
            </div>
          </div>

          {/* 4x6 Block Layer */}
          <div className="relative z-10 grid grid-cols-6 gap-1.5">
            {grid.map((row, ri) =>
              row.map((cell, ci) => (
                <button
                  key={`${ri}-${ci}`}
                  type="button"
                  disabled={cell === null}
                  onClick={() => handleBreakBlock(ri, ci)}
                  className={`h-11 rounded-md border transition-all ${
                    cell === null
                      ? 'opacity-0 pointer-events-none'
                      : `${COLORS[cell]} hover:brightness-110 active:scale-90 cursor-pointer shadow-md`
                  }`}
                  aria-label="Bloque de excavación"
                />
              ))
            )}
          </div>
        </div>

        {/* Evidence Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Eye className="w-4 h-4" />
            <span>¿Qué prueba estaba enterrada?</span>
          </div>

          <div className="space-y-2.5">
            {step.options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => handleGuess(idx)}
                className="w-full text-left p-3.5 rounded-xl bg-zinc-900 hover:bg-emerald-950/50 border border-zinc-700 hover:border-emerald-400 text-sm font-semibold text-white transition-all cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded border border-zinc-800">
            {msg}
          </div>
        </div>
      </div>
    </div>
  );
};
