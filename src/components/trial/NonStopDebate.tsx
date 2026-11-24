import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Mic, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { NonStopDebateStep, TruthBullet } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterSprite } from '../CharacterSprite';
import { CutInOverlay, CutInType } from '../CutInOverlay';
import { VOICE_PROFILES, voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface NonStopDebateProps {
  step: NonStopDebateStep;
  bullets: TruthBullet[];
  onDamage: () => void;
  onSuccess: (counterDialogue: NonStopDebateStep['lines'][number]['counterDialogue']) => void;
}

export const NonStopDebate: React.FC<NonStopDebateProps> = ({
  step,
  bullets,
  onDamage,
  onSuccess,
}) => {
  const availableBullets = bullets.filter((b) =>
    step.availableBulletIds.includes(b.id)
  );
  const [lineIndex, setLineIndex] = useState(0);
  const [selectedBulletId, setSelectedBulletId] = useState<string>(
    availableBullets[0]?.id || step.availableBulletIds[0] || bullets[0]?.id || ''
  );
  const [lieMode, setLieMode] = useState(false);
  const [clearedNoise, setClearedNoise] = useState<Record<string, boolean>>({});
  const [statusMsg, setStatusMsg] = useState<string>(
    'Apunta al Punto Débil (amarillo para contradecir, azul para apoyar) y dispara la Bala correcta.'
  );
  const [shake, setShake] = useState(false);
  const [activeCutIn, setActiveCutIn] = useState<CutInType | null>(null);
  const cutInTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  const currentLine = step.lines[lineIndex] || step.lines[0];
  const speaker =
    CHARACTERS[currentLine.speaker as Exclude<keyof typeof CHARACTERS, never>];
  const voiceProfile = VOICE_PROFILES[currentLine.speaker];

  useEffect(() => {
    return () => {
      if (cutInTimerRef.current) window.clearTimeout(cutInTimerRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  // Keep selectedBulletId valid if bullets list changes
  useEffect(() => {
    if (
      availableBullets.length > 0 &&
      !availableBullets.some((b) => b.id === selectedBulletId)
    ) {
      setSelectedBulletId(availableBullets[0].id);
    }
  }, [availableBullets, selectedBulletId]);

  // Voice act current statement whenever lineIndex changes
  useEffect(() => {
    voiceEngine.speak(currentLine.speaker, currentLine.text);
  }, [currentLine.speaker, currentLine.text]);

  // Auto-advance debate loop like Danganronpa (paused during cut-in)
  useEffect(() => {
    if (activeCutIn || step.lines.length <= 1) return;
    const timer = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % step.lines.length);
      setClearedNoise({});
    }, 5200);
    return () => window.clearInterval(timer);
  }, [step.lines.length, activeCutIn, lineIndex]);

  const triggerError = (msg: string) => {
    sfx.error();
    setShake(true);
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = window.setTimeout(() => setShake(false), 360);
    setStatusMsg(msg);
    onDamage();
  };

  const handleShootWeakSpot = () => {
    if (activeCutIn) return;
    if (!currentLine.weakSpotText) {
      triggerError('¡Esa frase no tiene un punto débil!');
      return;
    }

    // Check if white noise is blocking
    const activeNoise = (currentLine.whiteNoise || []).filter(
      (n) => !clearedNoise[`${currentLine.id}-${n}`]
    );
    if (activeNoise.length > 0) {
      triggerError('¡El Ruido Blanco bloquea tu disparo! Haz clic sobre las frases moradas primero.');
      return;
    }

    if (lieMode && currentLine.lieBulletId) {
      if (selectedBulletId === currentLine.lieBulletId) {
        sfx.contradictBreak();
        voiceEngine.speak('mateo', '¡Convertiré esa mentira en verdad!');
        setActiveCutIn('lie');
        cutInTimerRef.current = window.setTimeout(() => {
          setActiveCutIn(null);
          onSuccess(currentLine.counterDialogue);
        }, 1250);
        return;
      }
      triggerError('Esa mentira no encaja con la coartada actual.');
      return;
    }

    if (!lieMode && selectedBulletId === currentLine.correctBulletId) {
      if (currentLine.weakSpotType === 'consent') {
        sfx.consentAgree();
        voiceEngine.speak('mateo', '¡Estoy de acuerdo con eso!');
        setActiveCutIn('consent');
      } else {
        sfx.contradictBreak();
        voiceEngine.speak('mateo', '¡No es cierto! ¡Contraataque!');
        setActiveCutIn('counter');
      }
      cutInTimerRef.current = window.setTimeout(() => {
        setActiveCutIn(null);
        onSuccess(currentLine.counterDialogue);
      }, 1250);
      return;
    }

    triggerError(
      lieMode
        ? '¡Modo Mentira activo! Selecciona la bala correcta o desactiva Mentir.'
        : '¡Esa Bala de Verdad no contradice ni apoya este punto!'
    );
  };

  const handleClearNoise = (noiseText: string) => {
    if (activeCutIn) return;
    sfx.shoot();
    setClearedNoise((prev) => ({
      ...prev,
      [`${currentLine.id}-${noiseText}`]: true,
    }));
    setStatusMsg(`Ruido blanco "${noiseText}" despejado.`);
  };

  const renderPhraseWithWeakSpot = () => {
    const { text, weakSpotText, weakSpotType } = currentLine;
    if (!weakSpotText || !text.includes(weakSpotText)) {
      return (
        <span className="text-white">{text}</span>
      );
    }

    const parts = text.split(weakSpotText);
    const tail = parts.slice(1).join(weakSpotText);
    const isConsent = weakSpotType === 'consent';

    return (
      <span>
        <span className="text-zinc-100">{parts[0]}</span>
        <button
          type="button"
          onClick={handleShootWeakSpot}
          className={`inline-block mx-1 px-2.5 py-0.5 rounded font-extrabold underline decoration-2 underline-offset-4 transition-transform hover:scale-105 cursor-crosshair ${
            isConsent
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.4)]'
              : 'bg-amber-400/25 text-amber-300 border border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
          }`}
        >
          {weakSpotText}
        </button>
        <span className="text-zinc-100">{tail}</span>
      </span>
    );
  };

  return (
    <div
      className={`relative rounded-xl border border-zinc-700 bg-zinc-950/95 overflow-hidden shadow-2xl ${
        shake ? 'animate-dr-shake' : ''
      }`}
    >
      {activeCutIn && <CutInOverlay type={activeCutIn} />}
      {/* Top Trial Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950/50 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-400 text-zinc-950 font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            DEBATE SIN FIN
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">{step.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-tabular text-zinc-300">
          <span>Frase {lineIndex + 1}/{step.lines.length}</span>
          <div className="flex gap-1">
            {step.lines.map((l, idx) => (
              <button
                key={l.id}
                onClick={() => {
                  setLineIndex(idx);
                  setClearedNoise({});
                }}
                className={`w-6 h-6 rounded font-bold transition-colors cursor-pointer ${
                  idx === lineIndex
                    ? 'bg-cyan-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orientation-Adaptive Debate Stage */}
      <div className="relative min-h-56 px-4 sm:px-6 py-4 sm:py-5 flex flex-col landscape:flex-row md:flex-row items-center gap-4 sm:gap-6 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.14),#09090b_70%)] overflow-hidden">
        <div className="shrink-0 flex flex-col items-center">
          <CharacterSprite
            key={`${currentLine.speaker}-${currentLine.expression}-${lineIndex}`}
            characterId={currentLine.speaker}
            expression={currentLine.expression}
            monokumaPose={currentLine.monokumaPose || 'normal'}
            size="lg"
            isSpeaking={!activeCutIn}
            animateEnter
          />
          <div className="mt-1 px-3 py-0.5 bg-zinc-900 border border-zinc-700 text-xs font-bold text-white rounded flex items-center gap-1.5">
            <span>{speaker?.name}</span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
            <Mic className="w-3 h-3" />
            <span>{voiceProfile.label}</span>
          </div>
        </div>

        {/* Kinetic Floating Statement */}
        <div className="relative flex-1 flex flex-col items-center justify-center py-6">
          <div className="animate-dr-kinetic max-w-2xl p-6 rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl text-center">
            <p className="font-display font-bold text-2xl md:text-3xl leading-snug tracking-wide">
              “{renderPhraseWithWeakSpot()}”
            </p>
          </div>

          {/* White Noise Floating Obstacles */}
          {currentLine.whiteNoise && currentLine.whiteNoise.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {currentLine.whiteNoise.map((noise) => {
                const isCleared = clearedNoise[`${currentLine.id}-${noise}`];
                if (isCleared) return null;
                return (
                  <button
                    key={noise}
                    onClick={() => handleClearNoise(noise)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-fuchsia-600/85 hover:bg-fuchsia-500 text-white font-display font-bold text-sm rounded border border-fuchsia-300 shadow-lg -rotate-2 cursor-crosshair"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {noise} (¡Despejar!)
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <span className="text-amber-300 font-semibold">
              Amarillo: ¡Contradecir! (¡NO ES CIERTO!)
            </span>
            <span className="text-cyan-300 font-semibold">
              Azul: ¡Apoyar! (V-Consenso)
            </span>
            {step.allowLieMode && (
              <span className="text-fuchsia-300 font-semibold">
                Morado: ¡Mentira táctica V3!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Truth Bullet Cylinder & Perjury Toggle */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Revólver de Balas de Verdad</span>
          </div>

          {step.allowLieMode && (
            <button
              onClick={() => {
                sfx.click();
                setLieMode((m) => !m);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                lieMode
                  ? 'bg-fuchsia-600 text-white shadow-[0_0_14px_rgba(192,38,211,0.6)]'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {lieMode ? 'Modo Mentira ACTIVO (Perjurio V3)' : 'Activar Bala de Mentira'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {availableBullets.map((b) => {
            const active = selectedBulletId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  sfx.click();
                  setSelectedBulletId(b.id);
                }}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  active
                    ? lieMode
                      ? 'bg-fuchsia-950/60 border-fuchsia-400 text-white'
                      : 'bg-cyan-950/60 border-cyan-400 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="font-bold text-sm text-white truncate">
                  {b.title}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                  {b.summary}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-950 px-3 py-2 rounded border border-zinc-800">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      </div>
    </div>
  );
};
