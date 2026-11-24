import React, { useEffect, useRef, useState } from 'react';
import { Sword } from 'lucide-react';
import { RebuttalShowdownStep, TruthBullet } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterSprite } from '../CharacterSprite';
import { CutInOverlay } from '../CutInOverlay';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface RebuttalShowdownProps {
  step: RebuttalShowdownStep;
  bullets: TruthBullet[];
  onDamage: () => void;
  onSuccess: (counterDialogue: RebuttalShowdownStep['counterDialogue']) => void;
}

export const RebuttalShowdown: React.FC<RebuttalShowdownProps> = ({
  step,
  bullets,
  onDamage,
  onSuccess,
}) => {
  const availableBullets = bullets.filter((b) =>
    step.availableBulletIds.includes(b.id)
  );
  const [lineIdx, setLineIdx] = useState(0);
  const [selectedBladeId, setSelectedBladeId] = useState(
    () => availableBullets[0]?.id || step.availableBulletIds[0] || ''
  );
  const [clashAdvantage, setClashAdvantage] = useState(50);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState(
    'Corta los argumentos blancos para avanzar y parte el Punto Débil DORADO con tu Espada de Verdad.'
  );
  const [showCounter, setShowCounter] = useState(false);
  const timerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  const opp =
    CHARACTERS[step.opponent as Exclude<keyof typeof CHARACTERS, never>];
  const currentLine = step.lines[lineIdx];

  useEffect(() => {
    if (
      availableBullets.length > 0 &&
      !availableBullets.some((b) => b.id === selectedBladeId)
    ) {
      setSelectedBladeId(availableBullets[0].id);
    }
  }, [availableBullets, selectedBladeId]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    voiceEngine.speak(step.opponent, currentLine.text);
  }, [step.opponent, currentLine.text]);

  const handleSlash = () => {
    if (showCounter) return;
    if (!currentLine.isWeakPoint) {
      sfx.slash();
      setClashAdvantage((a) => Math.min(90, a + 10));
      setLineIdx((i) => (i + 1) % step.lines.length);
      setMsg('¡Corte limpio! Sigue avanzando hasta encontrar la grieta dorada.');
      return;
    }

    if (selectedBladeId === step.correctBulletId) {
      sfx.contradictBreak();
      voiceEngine.speak('mateo', '¡Cortaré tus palabras! ¡Contraataque!');
      setShowCounter(true);
      timerRef.current = window.setTimeout(() => {
        setShowCounter(false);
        onSuccess(step.counterDialogue);
      }, 1250);
    } else {
      sfx.error();
      setShake(true);
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => setShake(false), 350);
      setClashAdvantage((a) => Math.max(15, a - 15));
      setMsg('¡Equivocaste la Espada de Verdad! Cambia la prueba seleccionada.');
      onDamage();
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-rose-500/50 bg-zinc-950 overflow-hidden shadow-2xl ${
        shake ? 'animate-dr-shake' : ''
      }`}
    >
      {showCounter && <CutInOverlay type="counter" />}
      <div className="px-5 py-3 bg-gradient-to-r from-rose-950/70 via-zinc-900 to-cyan-950/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-rose-500 text-white font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            DUELO DE REFUTACIÓN
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-300">
              ¡1 contra 1 frente a {opp?.name}! “{step.introQuote}”
            </p>
          </div>
        </div>
        <div className="text-xs font-mono-tabular text-cyan-300">
          Ventaja del Duelo: {clashAdvantage}%
        </div>
      </div>

      {/* Clash Meter */}
      <div className="h-2 bg-rose-950">
        <div
          className="h-full bg-cyan-400 transition-all duration-200"
          style={{ width: `${clashAdvantage}%` }}
        />
      </div>

      {/* Orientation-Adaptive Duel Stage */}
      <div className="p-4 sm:p-5 flex flex-col-reverse landscape:flex-row md:flex-row items-center justify-between gap-4 sm:gap-6 bg-[radial-gradient(circle_at_right,rgba(244,63,94,0.18),#09090b_70%)]">
        <div className="flex-1 space-y-4 text-center landscape:text-left md:text-left">
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
            Embestida {lineIdx + 1} de {step.lines.length}
          </div>

          <div
            className={`p-5 rounded-xl border-2 transition-all -skew-x-3 ${
              currentLine.isWeakPoint
                ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]'
                : 'bg-zinc-900/90 border-zinc-700'
            }`}
          >
            <p
              className={`font-display font-extrabold text-2xl md:text-3xl ${
                currentLine.isWeakPoint ? 'text-amber-300' : 'text-white'
              }`}
            >
              “{currentLine.text}”
            </p>
          </div>

          <button
            onClick={handleSlash}
            className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-extrabold text-xl tracking-wide transition-transform active:scale-95 cursor-pointer ${
              currentLine.isWeakPoint
                ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
            }`}
          >
            <Sword className="w-5 h-5" />
            {currentLine.isWeakPoint
              ? '¡CORTAR TUS PALABRAS!'
              : '¡Tajar Argumento!'}
          </button>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <CharacterSprite
            key={`${step.opponent}-${lineIdx}`}
            characterId={step.opponent}
            expression="angry"
            monokumaPose={step.opponent === 'monokuma' ? 'angry' : undefined}
            size="lg"
            flip={step.opponent !== 'monokuma'}
            isSpeaking={!showCounter}
            animateEnter
          />
          <span className="mt-1 text-xs font-bold text-rose-300">{opp?.name}</span>
        </div>
      </div>

      {/* Equipped Truth Blade */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Equipa tu Espada de Verdad (necesaria para el corte dorado):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {availableBullets.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                sfx.click();
                setSelectedBladeId(b.id);
              }}
              className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                selectedBladeId === b.id
                  ? 'bg-amber-500/20 border-amber-400 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <div className="font-bold text-xs text-white">{b.title}</div>
              <div className="text-[11px] text-zinc-400 line-clamp-1">{b.summary}</div>
            </button>
          ))}
        </div>
        <div className="text-xs text-zinc-300">{msg}</div>
      </div>
    </div>
  );
};
