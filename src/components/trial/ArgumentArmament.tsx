import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Music, ShieldOff, Sparkles } from 'lucide-react';
import { ArgumentArmamentStep } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import {
  CHARACTERISTIC_DISAPPEAR_LIST,
  CharacterSprite,
} from '../CharacterSprite';
import { CutInOverlay } from '../CutInOverlay';
import { GAME_IMAGES } from '../../assets/images';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface ArgumentArmamentProps {
  step: ArgumentArmamentStep;
  onDamage: () => void;
  onSuccess: (afterDialogue: ArgumentArmamentStep['afterDialogue']) => void;
}

const ARMAMENT_BG = GAME_IMAGES.argumentArmament;

const ROUND_TARGETS = [19, 21, 23, 25, 27]; // 5 rounds: base 19 words, +2 per round

const DENIAL_WORD_POOL = [
  '¡MENTIRA!',
  '¡JAMÁS!',
  '¡IMPOSIBLE!',
  '¡INOCENTE!',
  '¡PRUEBAS!',
  '¡COARTADA!',
  '¡NO FUI YO!',
  '¡FALSO!',
  '¡ERROR!',
  '¡SILENCIO!',
  '¡NUNCA!',
  '¡OTRO FUE!',
];

export const ArgumentArmament: React.FC<ArgumentArmamentProps> = ({
  step,
  onDamage,
  onSuccess,
}) => {
  const [phase, setPhase] = useState<'rhythm' | 'final_blow'>('rhythm');
  const [roundIdx, setRoundIdx] = useState(0); // 0..4 (5 rounds)
  const [wordsBrokenInRound, setWordsBrokenInRound] = useState(0);
  const [damageStage, setDamageStage] = useState(0); // 0..5 rips clothes & removes items
  const [beatCursor, setBeatCursor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flyingWords, setFlyingWords] = useState<
    { id: number; label: string }[]
  >([
    { id: 1, label: '¡JAMÁS!' },
    { id: 2, label: '¡NO FUI YO!' },
    { id: 3, label: '¡IMPOSIBLE!' },
  ]);
  const [removedAlert, setRemovedAlert] = useState<string | null>(null);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [showFinalCutIn, setShowFinalCutIn] = useState(false);
  const [msg, setMsg] = useState(
    'Ronda 1/5: ¡Destruye 19 palabras en ritmo para desgarrar su defensa!'
  );

  const beatCursorRef = useRef(0);
  const cutInTimerRef = useRef<number | null>(null);

  const culprit =
    CHARACTERS[step.culprit as Exclude<keyof typeof CHARACTERS, never>];
  const disappearItems =
    CHARACTERISTIC_DISAPPEAR_LIST[step.culprit] ||
    CHARACTERISTIC_DISAPPEAR_LIST.sebastian;
  const roundTarget = ROUND_TARGETS[roundIdx] || 27;

  useEffect(() => {
    return () => {
      if (cutInTimerRef.current) window.clearTimeout(cutInTimerRef.current);
    };
  }, []);

  // Voice acting on mount
  useEffect(() => {
    voiceEngine.speak(step.culprit, step.denialQuotes[0] || '¡No fui yo!');
  }, [step.culprit, step.denialQuotes]);

  // Rhythm pulse track
  useEffect(() => {
    if (phase !== 'rhythm') return;
    const interval = window.setInterval(() => {
      setBeatCursor((c) => {
        const next = (c + 3.8) % 100;
        beatCursorRef.current = next;
        return next;
      });
    }, 28);
    return () => window.clearInterval(interval);
  }, [phase]);

  const advanceWordCount = useCallback(
    (amount: number) => {
      const nextWords = wordsBrokenInRound + amount;
      setFlyingWords((prev) => {
        const nextId = (prev[prev.length - 1]?.id || 0) + 1;
        return [
          ...prev.slice(1),
          {
            id: nextId,
            label: DENIAL_WORD_POOL[nextId % DENIAL_WORD_POOL.length],
          },
        ];
      });

      if (nextWords >= roundTarget) {
        const completedRound = roundIdx + 1;
        const lostItem = disappearItems[roundIdx] || 'Prenda del uniforme';
        sfx.contradictBreak();
        setDamageStage(completedRound);
        setRemovedAlert(`¡Ropa rasgada! Desapareció: ${lostItem}`);
        voiceEngine.speak(
          step.culprit,
          step.denialQuotes[completedRound % step.denialQuotes.length] ||
            '¡No! ¡Mi coartada se rompe!'
        );

        if (completedRound >= 5) {
          setPhase('final_blow');
          setMsg(
            '¡Las 5 rondas completadas y toda su defensa destruida! Ordena las 4 palabras para el Golpe Final.'
          );
        } else {
          const nextTarget = ROUND_TARGETS[completedRound];
          setRoundIdx(completedRound);
          setWordsBrokenInRound(0);
          setMsg(
            `¡Ronda ${completedRound + 1}/5! Ahora destruye ${nextTarget} palabras (+2 por ronda).`
          );
        }
      } else {
        setWordsBrokenInRound(nextWords);
      }
    },
    [disappearItems, roundIdx, roundTarget, step.culprit, step.denialQuotes, wordsBrokenInRound]
  );

  const handleRhythmStrike = useCallback(
    (fromWordBubble = false) => {
      if (phase !== 'rhythm' || showFinalCutIn) return;
      const inZone = beatCursorRef.current >= 30 && beatCursorRef.current <= 74;
      if (inZone || fromWordBubble) {
        sfx.slash();
        const nextCombo = inZone ? combo + 1 : 0;
        setCombo(nextCombo);
        const burst = inZone ? (nextCombo >= 3 ? 4 : 3) : 2;
        advanceWordCount(burst);
        setMsg(
          inZone
            ? `¡IMPACTO RÍTMICO x${nextCombo}! (-${burst} palabras)`
            : `¡Palabra destruida! (-${burst} palabras)`
        );
      } else {
        sfx.error();
        setCombo(0);
        onDamage();
        setMsg('¡Fuera de ritmo! Pulsa cuando el cursor cruce la zona dorada o haz clic en las palabras.');
      }
    },
    [advanceWordCount, combo, onDamage, phase, showFinalCutIn]
  );

  // Keyboard Spacebar support for rhythmic hits (without 28ms listener thrashing)
  useEffect(() => {
    if (phase !== 'rhythm') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleRhythmStrike(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, handleRhythmStrike]);

  // Scrambled order for Final Blow preserving original indices
  const scrambledWords = useMemo(() => {
    const arr = step.finalTruthWords.map((word, origIdx) => ({ word, origIdx }));
    return [arr[2], arr[0], arr[3], arr[1]];
  }, [step.finalTruthWords]);

  const handlePickFinalWord = (item: { word: string; origIdx: number }) => {
    if (showFinalCutIn) return;
    const expected = step.finalTruthWords[pickedIndices.length];
    if (item.word === expected) {
      sfx.blueCapture();
      const next = [...pickedIndices, item.origIdx];
      setPickedIndices(next);
      if (next.length === 4) {
        sfx.contradictBreak();
        voiceEngine.speak('mateo', '¡Acabemos con esto!', { interrupt: true });
        setShowFinalCutIn(true);
        cutInTimerRef.current = window.setTimeout(() => {
          setShowFinalCutIn(false);
          onSuccess(step.afterDialogue);
        }, 1450);
      }
    } else {
      sfx.error();
      onDamage();
      setMsg(`¡Orden incorrecto! Piensa qué palabra va en la posición #${pickedIndices.length + 1}.`);
    }
  };

  return (
    <div className="relative rounded-xl border border-fuchsia-500/50 bg-zinc-950 overflow-hidden shadow-2xl">
      {showFinalCutIn && (
        <CutInOverlay
          type="acabemos_con_esto"
          subtitle={step.finalTruthWords.join(' ')}
        />
      )}
      <div className="px-5 py-3 bg-gradient-to-r from-fuchsia-950/70 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-fuchsia-500 text-white font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            ARMAMENTO DE ARGUMENTOS
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">
              5 Rondas V3 (19 → 21 → 23 → 25 → 27 palabras) contra {culprit?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono-tabular text-fuchsia-300">
          <Music className="w-4 h-4" />
          <span>Ronda {Math.min(roundIdx + 1, 5)}/5</span>
          <span>·</span>
          <span>
            Palabras: {wordsBrokenInRound}/{roundTarget}
          </span>
        </div>
      </div>

      {/* Orientation-Adaptive Arena Stage with Backdrop */}
      <div className="relative p-4 sm:p-5 flex flex-col landscape:flex-row md:flex-row items-center gap-5 sm:gap-6 overflow-hidden">
        <img
          src={ARMAMENT_BG}
          alt="Arena Argument Armament V3"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/70 to-zinc-950/85" />

        {/* Culprit Sprite with Progressive Clothing Rip & Disappearing Items */}
        <div className="relative z-10 shrink-0 flex flex-col items-center">
          <CharacterSprite
            characterId={step.culprit}
            expression={damageStage >= 3 ? 'shocked' : 'angry'}
            monokumaPose={
              step.culprit === 'monokuma'
                ? damageStage >= 3
                  ? 'shocked'
                  : 'angry'
                : undefined
            }
            damageStage={damageStage}
            size="lg"
          />
          <div className="mt-2 px-3 py-1 rounded bg-rose-950/90 border border-rose-500/50 text-xs font-bold text-rose-200 max-w-[230px] text-center">
            “{step.denialQuotes[roundIdx % step.denialQuotes.length]}”
          </div>
          {removedAlert && (
            <div className="mt-2 px-3 py-1 rounded bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              {removedAlert}
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 w-full space-y-5">
          {/* 5 Round Progress Pills */}
          <div className="grid grid-cols-5 gap-1.5">
            {ROUND_TARGETS.map((target, idx) => {
              const cleared = idx < damageStage;
              const current = idx === roundIdx && phase === 'rhythm';
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-center font-mono-tabular text-xs ${
                    cleared
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : current
                      ? 'bg-fuchsia-500/25 border-fuchsia-400 text-white font-bold'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-500'
                  }`}
                >
                  R{idx + 1}: {target}p
                </div>
              );
            })}
          </div>

          {phase === 'rhythm' ? (
            <div className="space-y-4">
              {/* Round Word Destruction Bar */}
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>
                    Ronda {roundIdx + 1}: Palabras destruidas ({wordsBrokenInRound} / {roundTarget})
                  </span>
                  <span className="font-mono-tabular text-amber-300">
                    Combo: x{combo}
                  </span>
                </div>
                <div className="h-3.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all duration-150"
                    style={{
                      width: `${Math.min(100, (wordsBrokenInRound / roundTarget) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Flying Denial Word Shields (clickable!) */}
              <div className="flex flex-wrap gap-2 justify-center py-2">
                {flyingWords.map((fw) => (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => handleRhythmStrike(true)}
                    className="px-4 py-2 rounded-lg bg-zinc-900/95 hover:bg-rose-600 text-white border-2 border-fuchsia-400 font-display font-extrabold text-lg -skew-x-6 shadow-lg active:scale-90 transition-transform cursor-crosshair"
                  >
                    {fw.label}
                  </button>
                ))}
              </div>

              {/* Rhythm Beat Bar */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Latido Rítmico (Clic o Barra Espaciadora)
                </div>
                <div className="relative h-11 bg-zinc-900 rounded-xl border-2 border-zinc-700 overflow-hidden">
                  <div
                    className="absolute inset-y-0 bg-amber-400/25 border-x-2 border-amber-400"
                    style={{ left: '30%', width: '44%' }}
                  />
                  <div
                    className="absolute inset-y-0 w-2.5 bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.95)]"
                    style={{ left: `${beatCursor}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleRhythmStrike(false)}
                className="w-full py-3.5 bg-fuchsia-500 hover:bg-fuchsia-400 active:scale-95 text-white font-display font-extrabold text-2xl tracking-wide rounded-xl shadow-[0_0_24px_rgba(217,70,239,0.5)] transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldOff className="w-6 h-6" />
                ¡ROMPER DEFENSA EN RITMO!
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                ¡GOLPE FINAL! Su ropa y defensa cayeron: forma la frase de 4 palabras
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((slot) => {
                  const pickedOrig = pickedIndices[slot];
                  const wordText =
                    pickedOrig !== undefined ? step.finalTruthWords[pickedOrig] : undefined;
                  return (
                    <div
                      key={slot}
                      className={`h-14 rounded-lg border-2 flex items-center justify-center font-display font-bold text-lg px-2 text-center ${
                        wordText
                          ? 'bg-cyan-400 text-zinc-950 border-white'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-700'
                      }`}
                    >
                      {wordText || `${slot + 1}. ???`}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scrambledWords.map((item) => {
                  const used = pickedIndices.includes(item.origIdx);
                  return (
                    <button
                      key={item.origIdx}
                      disabled={used}
                      onClick={() => handlePickFinalWord(item)}
                      className={`py-3 px-4 rounded-xl font-display font-bold text-lg border transition-all ${
                        used
                          ? 'opacity-30 bg-zinc-900 border-zinc-800 text-zinc-600'
                          : 'bg-zinc-900 hover:bg-fuchsia-600 border-fuchsia-400/60 text-white cursor-pointer'
                      }`}
                    >
                      {item.word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-xs text-zinc-300 bg-zinc-900/80 px-3 py-2 rounded border border-zinc-800">
            {msg}
          </div>
        </div>
      </div>
    </div>
  );
};
