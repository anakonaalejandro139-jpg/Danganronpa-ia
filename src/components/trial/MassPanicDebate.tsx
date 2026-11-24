import React, { useEffect, useRef, useState } from 'react';
import { Flame, Crosshair } from 'lucide-react';
import { MassPanicStep, TruthBullet } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterSprite } from '../CharacterSprite';
import { CutInOverlay } from '../CutInOverlay';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface MassPanicDebateProps {
  step: MassPanicStep;
  bullets: TruthBullet[];
  onDamage: () => void;
  onSuccess: (counterDialogue: MassPanicStep['counterDialogue']) => void;
}

export const MassPanicDebate: React.FC<MassPanicDebateProps> = ({
  step,
  bullets,
  onDamage,
  onSuccess,
}) => {
  const availableBullets = bullets.filter((b) =>
    step.availableBulletIds.includes(b.id)
  );
  const [selectedBulletId, setSelectedBulletId] = useState<string>(
    availableBullets[0]?.id || step.availableBulletIds[0] || bullets[0]?.id || ''
  );
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCounter, setShowCounter] = useState(false);
  const timerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      availableBullets.length > 0 &&
      !availableBullets.some((b) => b.id === selectedBulletId)
    ) {
      setSelectedBulletId(availableBullets[0].id);
    }
  }, [availableBullets, selectedBulletId]);

  useEffect(() => {
    const targetPanel = step.panels.find((p) => p.isTarget) || step.panels[0];
    if (targetPanel) {
      voiceEngine.speak(targetPanel.speaker, targetPanel.statement);
    }
  }, [step.panels]);

  const handleShootPanel = (isTarget: boolean) => {
    if (showCounter) return;
    if (!isTarget) {
      sfx.error();
      setShake(true);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => setShake(false), 360);
      setErrorMsg('¡Ese estudiante solo está gritando ruido! Encuentra al que tiene el dato falso.');
      onDamage();
      return;
    }

    if (selectedBulletId !== step.correctBulletId) {
      sfx.error();
      setShake(true);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => setShake(false), 360);
      setErrorMsg('¡Identificaste al hablante correcto, pero necesitas otra Bala de Verdad!');
      onDamage();
      return;
    }

    sfx.contradictBreak();
    voiceEngine.speak('mateo', '¡No es cierto! ¡Contraataque!');
    setShowCounter(true);
    timerRef.current = window.setTimeout(() => {
      setShowCounter(false);
      onSuccess(step.counterDialogue);
    }, 1250);
  };

  return (
    <div
      className={`relative rounded-xl border border-rose-500/40 bg-zinc-950/95 overflow-hidden shadow-2xl ${
        shake ? 'animate-dr-shake' : ''
      }`}
    >
      {showCounter && <CutInOverlay type="counter" />}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-rose-950/70 via-zinc-900 to-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-rose-500 text-white font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            DEBATE DE PÁNICO MASIVO
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">{step.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold">
          <Flame className="w-4 h-4" />
          <span>¡3 voces simultáneas! Dispara al punto débil real</span>
        </div>
      </div>

      {/* 3-Way Orientation-Adaptive Split Courtroom Shouting Panels */}
      <div className="grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-3 gap-3 p-3 sm:p-4 bg-zinc-950">
        {step.panels.map((panel, idx) => {
          const char =
            CHARACTERS[panel.speaker as Exclude<keyof typeof CHARACTERS, never>];
          return (
            <div
              key={`${panel.speaker}-${idx}`}
              className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/60 transition-all overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <CharacterSprite
                  characterId={panel.speaker}
                  expression={panel.expression}
                  monokumaPose={panel.monokumaPose}
                  size="sm"
                />
                <div>
                  <div className="font-display font-bold text-base text-white">
                    {char?.name}
                  </div>
                  <div className="text-[11px] text-zinc-400">{char?.ultimate}</div>
                </div>
              </div>

              <p className="text-sm md:text-base text-zinc-100 font-medium leading-relaxed mb-4">
                “{panel.statement}”
              </p>

              <button
                onClick={() => handleShootPanel(panel.isTarget)}
                className="w-full py-2.5 px-3 rounded-lg bg-zinc-950 hover:bg-amber-400 hover:text-zinc-950 text-amber-300 border border-amber-400/50 font-display font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 cursor-crosshair"
              >
                <Crosshair className="w-4 h-4" />
                {panel.weakSpotText
                  ? `Refutar: "${panel.weakSpotText}"`
                  : 'Refutar este panel'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bullet Selector */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Selecciona tu Bala de Verdad antes de disparar al panel correcto:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {availableBullets.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                sfx.click();
                setSelectedBulletId(b.id);
              }}
              className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                selectedBulletId === b.id
                  ? 'bg-cyan-950/60 border-cyan-400 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-xs text-white">{b.title}</div>
              <div className="text-[11px] text-zinc-400 line-clamp-1">{b.summary}</div>
            </button>
          ))}
        </div>
        {errorMsg && (
          <div className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 px-3 py-2 rounded">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
