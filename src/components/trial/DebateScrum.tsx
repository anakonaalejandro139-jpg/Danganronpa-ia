import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronRight, Flame, Swords, Volume2, Zap } from 'lucide-react';
import { CharacterId, DebateScrumStep } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterSprite } from '../CharacterSprite';
import { CutInOverlay } from '../CutInOverlay';
import { GAME_IMAGES } from '../../assets/images';
import { VOICE_PROFILES, estimateSpeechDurationMs, voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface DebateScrumProps {
  step: DebateScrumStep;
  onDamage: () => void;
  onSuccess: (afterDialogue: DebateScrumStep['afterDialogue']) => void;
}

const COURTROOM_BG = GAME_IMAGES.courtroom;

export const DebateScrum: React.FC<DebateScrumProps> = ({
  step,
  onDamage,
  onSuccess,
}) => {
  const [pairIndex, setPairIndex] = useState(0);
  const [completedPairIds, setCompletedPairIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<'matching' | 'clash'>('matching');
  const [clashMeter, setClashMeter] = useState(46);
  const [mashCount, setMashCount] = useState(0);
  const [clashHitPulse, setClashHitPulse] = useState(false);
  const [feedback, setFeedback] = useState<string>(
    'Escucha al oponente y empareja la palabra clave de tu aliado para responder.'
  );
  const [showFullCounter, setShowFullCounter] = useState(false);

  // Camera state: pans smoothly between 'right' (opponent speaking), 'left' (ally countering), and 'center' (Crouch Bind clash)
  const [cameraSide, setCameraSide] = useState<'left' | 'right' | 'center'>('right');
  const [activeSpeakerId, setActiveSpeakerId] = useState<CharacterId>(
    step.pairs[0].opponentSpeaker
  );
  const [activeSpeech, setActiveSpeech] = useState<string>(
    step.pairs[0].opponentLine
  );
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isSpeakingLine, setIsSpeakingLine] = useState<boolean>(true);
  const [isPanningReply, setIsPanningReply] = useState(false);

  const completedRef = useRef(false);
  const clashMeterRef = useRef(46);
  const panTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const pulseTimerRef = useRef<number | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const replySessionRef = useRef(0);

  const currentPair = step.pairs[pairIndex] || step.pairs[0];
  const oppChar =
    CHARACTERS[
      currentPair.opponentSpeaker as Exclude<keyof typeof CHARACTERS, never>
    ];
  const activeSpeakerProfile =
    CHARACTERS[activeSpeakerId as Exclude<keyof typeof CHARACTERS, never>];

  // Clear timers & speech on unmount
  useEffect(() => {
    return () => {
      if (panTimerRef.current) window.clearTimeout(panTimerRef.current);
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
      cancelSpeechRef.current?.();
      voiceEngine.stop();
    };
  }, []);

  // Typewriter reveal for whichever line is active on stage
  useEffect(() => {
    if (phase !== 'matching') return;
    setRevealedCount(0);
    if (!activeSpeech) return;
    const total = activeSpeech.length;
    const interval = window.setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= total) {
          window.clearInterval(interval);
          return total;
        }
        return Math.min(total, prev + 2);
      });
    }, 24);
    return () => window.clearInterval(interval);
  }, [activeSpeech, phase, pairIndex, isPanningReply]);

  // Focus camera on current opponent whenever pairIndex starts in matching phase
  useEffect(() => {
    if (phase === 'matching' && !isPanningReply) {
      setCameraSide('right');
      setActiveSpeakerId(currentPair.opponentSpeaker);
      setActiveSpeech(currentPair.opponentLine);
      setIsSpeakingLine(true);

      cancelSpeechRef.current?.();
      cancelSpeechRef.current = voiceEngine.speak(
        currentPair.opponentSpeaker,
        currentPair.opponentLine,
        {
          interrupt: true,
          onEnd: () => {
            setIsSpeakingLine(false);
          },
        }
      );
    }
  }, [
    phase,
    isPanningReply,
    currentPair.opponentSpeaker,
    currentPair.opponentLine,
  ]);

  const advanceAfterAllyReply = useCallback(
    (sessionId: number) => {
      if (sessionId !== replySessionRef.current) return;
      if (panTimerRef.current) {
        window.clearTimeout(panTimerRef.current);
        panTimerRef.current = null;
      }
      cancelSpeechRef.current?.();
      setIsSpeakingLine(false);
      setIsPanningReply(false);
      setCompletedPairIds((prev) =>
        prev.includes(currentPair.id) ? prev : [...prev, currentPair.id]
      );

      if (pairIndex + 1 >= step.pairs.length) {
        setPhase('clash');
        setCameraSide('center');
        clashMeterRef.current = 46;
        setClashMeter(46);
        setFeedback(
          '¡CROUCH BIND ACTIVO! Spamea rápido para vencer el empuje rival y lanzar el FULL COUNTER.'
        );
        voiceEngine.speak('mateo', '¡Este es nuestro resumen!', {
          interrupt: true,
        });
      } else {
        setPairIndex((i) => i + 1);
        setFeedback('¡Contraataque completado! La cámara vuelve al bando opositor.');
      }
    },
    [currentPair.id, pairIndex, step.pairs.length]
  );

  const handleSelectKeyword = (chosenPairId: string) => {
    if (isPanningReply || phase !== 'matching') return;

    if (chosenPairId === currentPair.id) {
      sfx.consentAgree();
      const sessionId = ++replySessionRef.current;
      const allyChar =
        CHARACTERS[
          currentPair.allySpeaker as Exclude<keyof typeof CHARACTERS, never>
        ];

      setIsPanningReply(true);
      setIsSpeakingLine(true);
      setCameraSide('left');
      setActiveSpeakerId(currentPair.allySpeaker);
      setActiveSpeech(currentPair.allyLine);
      setFeedback(
        `¡${allyChar?.shortName} está respondiendo con "${currentPair.topicKeyword}"! Escucha su réplica completa...`
      );

      const typeFinishMinMs = Math.max(1500, currentPair.allyLine.length * 14 + 450);
      const startedAt = performance.now();
      let speechEnded = false;

      const tryFinish = () => {
        if (sessionId !== replySessionRef.current) return;
        const elapsed = performance.now() - startedAt;
        const remainingForRead = Math.max(420, typeFinishMinMs - elapsed);
        if (panTimerRef.current) window.clearTimeout(panTimerRef.current);
        panTimerRef.current = window.setTimeout(() => {
          advanceAfterAllyReply(sessionId);
        }, remainingForRead);
      };

      cancelSpeechRef.current?.();
      cancelSpeechRef.current = voiceEngine.speak(
        currentPair.allySpeaker,
        currentPair.allyLine,
        {
          interrupt: true,
          onEnd: () => {
            if (speechEnded) return;
            speechEnded = true;
            tryFinish();
          },
        }
      );

      // Absolute failsafe upper bound so progression can never stall
      const profile = VOICE_PROFILES[currentPair.allySpeaker];
      const maxWait = estimateSpeechDurationMs(currentPair.allyLine, profile.rate) + 2200;
      window.setTimeout(() => {
        if (!speechEnded && sessionId === replySessionRef.current) {
          speechEnded = true;
          tryFinish();
        }
      }, maxWait);
    } else {
      sfx.error();
      onDamage();
      setFeedback('¡Palabra clave equivocada! Lee el tema que lanzó el oponente.');
    }
  };

  const triggerFullCounterWin = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    sfx.contradictBreak();
    setShowFullCounter(true);

    const fullText = `¡Full Counter! ${step.finalShout}`;
    const minCutInMs = 2100;
    const startedAt = performance.now();
    let done = false;

    const completeCutIn = () => {
      if (done) return;
      done = true;
      const wait = Math.max(350, minCutInMs - (performance.now() - startedAt));
      finishTimerRef.current = window.setTimeout(() => {
        setShowFullCounter(false);
        onSuccess(step.afterDialogue);
      }, wait);
    };

    cancelSpeechRef.current?.();
    cancelSpeechRef.current = voiceEngine.speak('mateo', fullText, {
      interrupt: true,
      onEnd: completeCutIn,
    });
  }, [onSuccess, step.afterDialogue, step.finalShout]);

  // Opposing side continuously pushes the Crouch Bind bar DOWN while player spams to push it UP
  useEffect(() => {
    if (phase !== 'clash' || showFullCounter) return;
    const interval = window.setInterval(() => {
      if (completedRef.current || clashMeterRef.current >= 100) return;
      const next = clashMeterRef.current - 1.45;
      if (next <= 0) {
        clashMeterRef.current = 30;
        setClashMeter(30);
        sfx.error();
        onDamage();
        setFeedback(
          '¡La oposición bajó la barra al mínimo! ¡Spamea clic o Barra Espaciadora sin parar!'
        );
      } else {
        clashMeterRef.current = next;
        setClashMeter(next);
      }
    }, 80);
    return () => window.clearInterval(interval);
  }, [phase, showFullCounter, onDamage]);

  const handleClashPush = useCallback(() => {
    if (phase !== 'clash' || showFullCounter || completedRef.current) return;
    sfx.slash();
    setMashCount((c) => c + 1);
    setClashHitPulse(true);
    if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(() => setClashHitPulse(false), 90);

    const next = Math.min(100, clashMeterRef.current + 7.2);
    clashMeterRef.current = next;
    setClashMeter(next);
    if (next >= 100) {
      triggerFullCounterWin();
    }
  }, [phase, showFullCounter, triggerFullCounterWin]);

  // Space / Enter key spamming support during Crouch Bind
  useEffect(() => {
    if (phase !== 'clash' || showFullCounter) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClashPush();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, showFullCounter, handleClashPush]);

  // Camera transform calculation
  const cameraTransform =
    cameraSide === 'left'
      ? 'translate-x-[10%] scale-[1.08]'
      : cameraSide === 'right'
      ? '-translate-x-[10%] scale-[1.08]'
      : 'translate-x-0 scale-100';

  const displayedSpeech =
    phase === 'matching' ? activeSpeech.slice(0, revealedCount) : activeSpeech;
  const typingDone = revealedCount >= activeSpeech.length;

  return (
    <div
      className={`relative rounded-xl border border-indigo-500/40 bg-zinc-950/95 overflow-hidden shadow-2xl ${
        phase === 'clash' && !showFullCounter && clashHitPulse
          ? 'animate-dr-scrum-clash'
          : ''
      }`}
    >
      {showFullCounter && (
        <CutInOverlay
          type="full_counter"
          teamIds={step.leftTeam}
          subtitle={step.finalShout}
        />
      )}

      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-cyan-950/70 via-zinc-900 to-rose-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-500 text-white font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            DEBATE SCRUM
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-300">{step.question}</p>
          </div>
        </div>
        <div className="text-xs font-mono-tabular text-cyan-300 font-bold">
          {phase === 'matching'
            ? `Cruce ${pairIndex + 1}/${step.pairs.length}`
            : 'CROUCH BIND · ¡ESTE ES NUESTRO RESUMEN!'}
        </div>
      </div>

      {/* Visual Scrum Arena with BOTH Teams' Full Student Sprites + Dynamic Camera Pan */}
      <div className="relative h-60 sm:h-68 md:h-76 bg-zinc-950 overflow-hidden border-b border-zinc-800">
        {/* Courtroom Backdrop */}
        <img
          src={COURTROOM_BG}
          alt="Sala del Juicio Debate Scrum"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        {/* Kinetic Speedlines Backdrop */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none animate-dr-speedlines"
          style={{
            width: 'calc(100% + 120px)',
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 20px, transparent 20px, transparent 120px)',
            backgroundSize: '120px 10px',
          }}
        />
        {/* Split Team Lighting (Cyan Left vs Rose Right) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, rgba(6,182,212,0.28) 0%, rgba(9,9,11,0.52) 48%, rgba(9,9,11,0.52) 52%, rgba(244,63,94,0.28) 100%)',
          }}
        />

        {/* Panning Camera Layer */}
        <div
          className={`relative z-10 w-full h-full px-3 sm:px-6 flex items-end justify-between transition-transform duration-500 ease-out ${cameraTransform}`}
        >
          {/* LEFT TEAM: Protagonist Side */}
          <div className="flex flex-col items-start h-full justify-between py-3">
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400/60 text-[11px] font-display font-extrabold tracking-wider uppercase text-cyan-200">
              Tu Bando ({step.leftTeam.length})
            </span>

            <div className="flex items-end -space-x-3 sm:-space-x-2">
              {step.leftTeam.map((id) => {
                const profile =
                  CHARACTERS[id as Exclude<keyof typeof CHARACTERS, never>];
                const isSpeaking =
                  phase === 'matching' &&
                  cameraSide === 'left' &&
                  activeSpeakerId === id;
                const isClashing = phase === 'clash';

                return (
                  <div
                    key={id}
                    className={`relative flex flex-col items-center transition-all duration-400 ${
                      isSpeaking
                        ? 'scale-125 z-30 -translate-y-2 drop-shadow-[0_0_24px_rgba(34,211,238,0.9)]'
                        : isClashing
                        ? `scale-105 z-20 ${clashHitPulse ? 'translate-x-1.5' : ''}`
                        : cameraSide === 'right' && phase === 'matching'
                        ? 'opacity-50 scale-90 z-10'
                        : 'opacity-80 scale-95 z-10'
                    }`}
                  >
                    <CharacterSprite
                      characterId={id}
                      expression={
                        isSpeaking || isClashing ? 'pointing' : 'neutral'
                      }
                      size="sm"
                      isSpeaking={isSpeaking && isSpeakingLine}
                      className="!w-14 !h-16 sm:!w-20 sm:!h-24 md:!w-24 md:!h-28"
                    />
                    <span
                      className={`mt-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold truncate max-w-[54px] sm:max-w-[74px] border ${
                        isSpeaking
                          ? 'bg-cyan-400 text-zinc-950 border-white'
                          : 'bg-zinc-950/90 text-cyan-200 border-cyan-500/40'
                      }`}
                    >
                      {profile?.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Lightning Divider */}
          <div className="hidden sm:flex flex-col items-center justify-center self-center z-20 px-2">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-transform ${
                phase === 'clash'
                  ? 'bg-amber-400 text-zinc-950 border-white scale-110 shadow-[0_0_24px_rgba(251,191,36,0.9)]'
                  : 'bg-zinc-900/90 text-zinc-200 border-zinc-600'
              }`}
            >
              <Swords className="w-5 h-5" />
            </div>
          </div>

          {/* RIGHT TEAM: Opposition Side */}
          <div className="flex flex-col items-end h-full justify-between py-3">
            <span className="px-2.5 py-0.5 rounded bg-rose-500/25 border border-rose-400/60 text-[11px] font-display font-extrabold tracking-wider uppercase text-rose-200">
              Oposición ({step.rightTeam.length})
            </span>

            <div className="flex items-end -space-x-3 sm:-space-x-2">
              {step.rightTeam.map((id) => {
                const profile =
                  CHARACTERS[id as Exclude<keyof typeof CHARACTERS, never>];
                const isSpeaking =
                  phase === 'matching' &&
                  cameraSide === 'right' &&
                  activeSpeakerId === id;
                const isClashing = phase === 'clash';

                return (
                  <div
                    key={id}
                    className={`relative flex flex-col items-center transition-all duration-400 ${
                      isSpeaking
                        ? 'scale-125 z-30 -translate-y-2 drop-shadow-[0_0_24px_rgba(244,63,94,0.9)]'
                        : isClashing
                        ? 'scale-105 z-20'
                        : cameraSide === 'left' && phase === 'matching'
                        ? 'opacity-50 scale-90 z-10'
                        : 'opacity-80 scale-95 z-10'
                    }`}
                  >
                    <CharacterSprite
                      characterId={id}
                      expression={
                        isSpeaking || isClashing ? 'angry' : 'worried'
                      }
                      size="sm"
                      flip
                      isSpeaking={isSpeaking && isSpeakingLine}
                      className="!w-14 !h-16 sm:!w-20 sm:!h-24 md:!w-24 md:!h-28"
                    />
                    <span
                      className={`mt-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold truncate max-w-[54px] sm:max-w-[74px] border ${
                        isSpeaking
                          ? 'bg-rose-500 text-white border-white'
                          : 'bg-zinc-950/90 text-rose-200 border-rose-500/40'
                      }`}
                    >
                      {profile?.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Camera Focus Dialogue Banner (shows full dialogue synced with speech) */}
        {phase === 'matching' && (
          <div
            className={`absolute top-2.5 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[92%] px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${
              cameraSide === 'left'
                ? 'bg-cyan-950/95 border-cyan-300 text-cyan-50'
                : 'bg-rose-950/95 border-rose-300 text-rose-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1.5">
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    isSpeakingLine ? 'animate-pulse text-amber-300' : 'opacity-60'
                  }`}
                />
                {cameraSide === 'left'
                  ? `Réplica completa de ${activeSpeakerProfile?.shortName}`
                  : `Ataque de ${activeSpeakerProfile?.shortName}`}
              </span>
              <span className="font-mono-tabular opacity-85">
                {currentPair.topicKeyword}
              </span>
            </div>
            <p className="font-display font-bold text-sm sm:text-base leading-snug">
              “{displayedSpeech}”
              {!typingDone && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-current align-middle animate-pulse" />
              )}
            </p>
            {isPanningReply && (
              <div className="mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-white/15">
                <span className="text-[11px] text-cyan-200 font-semibold">
                  {typingDone
                    ? 'Completando locución antes de avanzar...'
                    : 'Reproduciendo diálogo completo...'}
                </span>
                <button
                  type="button"
                  onClick={() => advanceAfterAllyReply(replySessionRef.current)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-[11px] font-extrabold cursor-pointer"
                >
                  Continuar
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {phase === 'matching' ? (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Active Opponent Prompt Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/25 border border-rose-500/40">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase text-rose-400">
                Argumento Opositor · {oppChar?.name}
              </div>
              <p className="font-display font-bold text-xl text-white">
                “{currentPair.opponentLine}”
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-bold rounded self-start sm:self-center">
              Tema: {currentPair.topicKeyword}
            </div>
          </div>

          {/* Ally Keyword Selection */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Elige la réplica aliada (el diálogo completo sonará antes de pasar al siguiente cruce):
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {step.pairs.map((p) => {
                const ally =
                  CHARACTERS[
                    p.allySpeaker as Exclude<keyof typeof CHARACTERS, never>
                  ];
                const isActiveAlly =
                  isPanningReply && p.id === currentPair.id;
                const isAlreadyDone = completedPairIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={isPanningReply || isAlreadyDone}
                    onClick={() => handleSelectKeyword(p.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isActiveAlly
                        ? 'bg-cyan-500/25 border-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.4)]'
                        : isAlreadyDone
                        ? 'opacity-45 bg-emerald-950/20 border-emerald-500/40 cursor-default'
                        : isPanningReply
                        ? 'opacity-50 bg-zinc-900 border-zinc-800 cursor-not-allowed'
                        : 'bg-zinc-900 hover:bg-cyan-950/50 border-zinc-700 hover:border-cyan-400 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                        {isAlreadyDone && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {ally?.name}
                      </span>
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-mono-tabular font-bold rounded">
                        {p.topicKeyword}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200">“{p.allyLine}”</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-zinc-400">{feedback}</div>
        </div>
      ) : (
        /* CROUCH BIND / CLASH BIND PHASE */
        <div className="p-6 sm:p-8 text-center space-y-5 bg-gradient-to-b from-zinc-950 via-indigo-950/25 to-cyan-950/35">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-amber-400/15 border border-amber-400/50 text-amber-300 text-xs font-display font-extrabold tracking-widest uppercase">
            <Flame className="w-4 h-4" />
            CROUCH BIND · ¡ESTE ES NUESTRO RESUMEN!
          </div>

          <h4 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase">
            “{step.finalShout}”
          </h4>

          <p className="text-sm text-zinc-300 max-w-xl mx-auto">
            ¡El otro bando está empujando la barra hacia abajo! Spamea rápido{' '}
            <strong className="text-cyan-300">Clic</strong> o{' '}
            <strong className="text-cyan-300">Barra Espaciadora</strong> para
            superarlos y desatar el <strong className="text-amber-300">FULL COUNTER</strong>.
          </p>

          {/* Tug-of-War Clash Bar */}
          <div className="max-w-xl mx-auto space-y-2">
            <div className="flex justify-between text-[11px] font-display font-extrabold uppercase tracking-wider">
              <span className="text-cyan-300">
                Tu Bando ({Math.round(clashMeter)}%)
              </span>
              <span className="text-rose-400 animate-pulse">
                ← Oposición Empujando ({Math.round(100 - clashMeter)}%)
              </span>
            </div>

            <div className="relative h-8 bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 rounded-full overflow-hidden border-2 border-zinc-600 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-300 transition-all duration-75 relative"
                style={{ width: `${Math.max(0, Math.min(100, clashMeter))}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_12px_#ffffff]" />
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono-tabular text-zinc-400">
              <span>Golpes de impulso: {mashCount}</span>
              <span>Meta: 100% para FULL COUNTER</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClashPush}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-zinc-950 font-display font-extrabold text-2xl rounded-xl shadow-[0_0_28px_rgba(34,211,238,0.55)] transition-transform cursor-pointer"
          >
            <Zap className="w-6 h-6" />
            ¡SPAMEAR: ESTE ES NUESTRO RESUMEN!
          </button>

          <div className="text-xs text-rose-300 min-h-4">{feedback}</div>
        </div>
      )}
    </div>
  );
};
