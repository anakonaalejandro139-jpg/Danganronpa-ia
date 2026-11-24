import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flashlight } from 'lucide-react';
import { HangmansGambitStep } from '../../types/game';
import { CutInOverlay } from '../CutInOverlay';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface HangmansGambitV3Props {
  step: HangmansGambitStep;
  onDamage: () => void;
  onSuccess: (afterDialogue: HangmansGambitStep['afterDialogue']) => void;
}

interface FloatingLetter {
  id: string;
  char: string;
  x: number;
  y: number;
  isDecoy: boolean;
}

const DECOY_POOL = 'BCDFGHJKLMNPQRSTVWXYZ';

export const HangmansGambitV3: React.FC<HangmansGambitV3Props> = ({
  step,
  onDamage,
  onSuccess,
}) => {
  const target = step.answerWord.toUpperCase();
  const [typedIndex, setTypedIndex] = useState(0);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [lightPos, setLightPos] = useState({ x: 50, y: 50 });
  const [shake, setShake] = useState(false);
  const [showCutIn, setShowCutIn] = useState(false);
  const [msg, setMsg] = useState(
    'Mueve tu linterna por la oscuridad y dispara las letras en orden exacto.'
  );
  const arenaRef = useRef<HTMLDivElement>(null);
  const cutInTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cutInTimerRef.current !== null) window.clearTimeout(cutInTimerRef.current);
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const letters = useMemo<FloatingLetter[]>(() => {
    const chars = target.split('');
    const rawItems: { id: string; char: string; isDecoy: boolean }[] = chars.map(
      (ch, idx) => ({
        id: `t-${idx}`,
        char: ch,
        isDecoy: false,
      })
    );
    for (let d = 0; d < 5; d++) {
      rawItems.push({
        id: `decoy-${d}`,
        char: DECOY_POOL[(d * 7 + target.length) % DECOY_POOL.length],
        isDecoy: true,
      });
    }

    // Build non-overlapping cell slots sized to fit all target + decoy letters
    const cols = Math.max(5, Math.ceil(rawItems.length / 3));
    const rows = Math.max(3, Math.ceil(rawItems.length / cols));
    const slots: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseX = ((c + 0.5) / cols) * 84 + 8;
        const baseY = ((r + 0.5) / rows) * 66 + 14;
        const jitterX = (((r * 3 + c * 5) % 5) - 2) * 1.4;
        const jitterY = (((r * 7 + c * 2) % 5) - 2) * 1.6;
        slots.push({
          x: Math.max(8, Math.min(92, baseX + jitterX)),
          y: Math.max(14, Math.min(80, baseY + jitterY)),
        });
      }
    }

    // Deterministic scramble so target letters aren't ordered left-to-right
    const stride = slots.length > 7 ? 7 : 3;
    return rawItems.map((item, idx) => {
      const slot = slots[(idx * stride + target.length) % slots.length];
      return {
        ...item,
        x: slot.x,
        y: slot.y,
      };
    });
  }, [target]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLightPos({ x, y });
  };

  const handleLetterClick = (letter: FloatingLetter) => {
    if (showCutIn || collectedIds.includes(letter.id)) return;
    const expected = target[typedIndex];
    if (letter.char === expected) {
      sfx.blueCapture();
      const next = typedIndex + 1;
      setCollectedIds((prev) => [...prev, letter.id]);
      setTypedIndex(next);
      setMsg(`¡Letra "${letter.char}" correcta!`);
      if (next >= target.length) {
        sfx.contradictBreak();
        voiceEngine.speak('mateo', '¡Ya lo tengo!', { interrupt: true });
        setShowCutIn(true);
        cutInTimerRef.current = window.setTimeout(() => {
          setShowCutIn(false);
          onSuccess(step.afterDialogue);
        }, 1250);
      }
    } else {
      sfx.error();
      setShake(true);
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => setShake(false), 350);
      setMsg(`¡Letra incorrecta! Buscas la letra "${expected}".`);
      onDamage();
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-amber-500/40 bg-zinc-950 overflow-hidden shadow-2xl ${
        shake ? 'animate-dr-shake' : ''
      }`}
    >
      {showCutIn && (
        <CutInOverlay
          type="ya_lo_tengo"
          subtitle={`Palabra clave: ${target}`}
        />
      )}
      <div className="px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-400 text-zinc-950 font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            AHORCADO V3.0
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">{step.question}</p>
          </div>
        </div>
        <div className="text-xs text-amber-300 flex items-center gap-1.5">
          <Flashlight className="w-4 h-4" />
          <span>Pista: {step.hint}</span>
        </div>
      </div>

      {/* Answer Slots */}
      <div className="py-4 px-5 bg-zinc-900/60 border-b border-zinc-800 flex justify-center gap-2 flex-wrap">
        {target.split('').map((ch, i) => (
          <div
            key={i}
            className={`w-11 h-12 rounded-lg border-2 flex items-center justify-center font-display font-extrabold text-2xl ${
              i < typedIndex
                ? 'bg-amber-400 text-zinc-950 border-amber-200'
                : i === typedIndex
                ? 'bg-zinc-900 text-amber-400 border-amber-400 animate-pulse'
                : 'bg-zinc-950 text-zinc-700 border-zinc-800'
            }`}
          >
            {i < typedIndex ? ch : '?'}
          </div>
        ))}
      </div>

      {/* Dark Flashlight Arena */}
      <div
        ref={arenaRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        className="relative h-72 w-full bg-black overflow-hidden cursor-crosshair select-none touch-none"
      >
        {/* Spotlight cone */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle 125px at ${lightPos.x}% ${lightPos.y}%, rgba(251,191,36,0.22), rgba(0,0,0,0.95) 85%)`,
          }}
        />

        {letters.map((item) => {
          if (collectedIds.includes(item.id)) return null;
          const dist = Math.hypot(item.x - lightPos.x, item.y - lightPos.y);
          const illuminated = dist < 24;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleLetterClick(item)}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl font-display font-extrabold text-2xl transition-all cursor-crosshair ${
                illuminated
                  ? 'bg-amber-400 text-zinc-950 border-2 border-white scale-110 shadow-[0_0_24px_rgba(251,191,36,0.75)] opacity-100'
                  : 'bg-zinc-900/40 text-zinc-600/35 border border-zinc-800/30 opacity-35 hover:opacity-100'
              }`}
            >
              {item.char}
            </button>
          );
        })}

        <div className="absolute bottom-2 left-3 right-3 text-xs text-zinc-300 bg-zinc-950/90 px-3 py-1.5 rounded border border-zinc-800 pointer-events-none">
          {msg}
        </div>
      </div>
    </div>
  );
};
