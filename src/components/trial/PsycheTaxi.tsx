import React, { useEffect, useRef, useState } from 'react';
import { Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { PsycheTaxiStep } from '../../types/game';
import { CutInOverlay } from '../CutInOverlay';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface PsycheTaxiProps {
  step: PsycheTaxiStep;
  onDamage: () => void;
  onSuccess: (afterDialogue: PsycheTaxiStep['afterDialogue']) => void;
}

export const PsycheTaxi: React.FC<PsycheTaxiProps> = ({
  step,
  onDamage,
  onSuccess,
}) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [collectedCubes, setCollectedCubes] = useState<number>(0);
  const [phase, setPhase] = useState<'cubes' | 'gate'>('cubes');
  const [cubeLane, setCubeLane] = useState<0 | 1 | 2>(0);
  const [showCutIn, setShowCutIn] = useState(false);
  const [msg, setMsg] = useState(
    '¡Conduce el Taxi Amarillo por los 3 carriles! Recoge los cubos de pista.'
  );
  const cutInTimerRef = useRef<number | null>(null);

  const stage = step.stages[stageIdx];

  useEffect(() => {
    return () => {
      if (cutInTimerRef.current !== null) window.clearTimeout(cutInTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showCutIn) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        setLane((l) => (l > 0 ? ((l - 1) as 0 | 1 | 2) : 0));
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setLane((l) => (l < 2 ? ((l + 1) as 0 | 1 | 2) : 2));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCutIn]);

  const handleCollectCube = (targetLane: 0 | 1 | 2) => {
    if (phase !== 'cubes' || showCutIn) return;
    setLane(targetLane);
    if (targetLane === cubeLane) {
      sfx.blueCapture();
      const next = collectedCubes + 1;
      setCollectedCubes(next);
      if (next >= stage.promptPieces.length) {
        setPhase('gate');
        setMsg('¡Pregunta armada! Ahora entra al carril con la respuesta correcta.');
      } else {
        setCubeLane(((cubeLane + 1) % 3) as 0 | 1 | 2);
        setMsg(`¡Cubo "${stage.promptPieces[next - 1]}" recogido!`);
      }
    } else {
      sfx.click();
    }
  };

  const handleChooseGate = (idx: 0 | 1 | 2) => {
    if (phase !== 'gate' || showCutIn) return;
    setLane(idx);
    if (idx === stage.correctIndex) {
      sfx.consentAgree();
      if (stageIdx + 1 >= step.stages.length) {
        sfx.contradictBreak();
        voiceEngine.speak('mateo', '¡Ya lo tengo!', { interrupt: true });
        setShowCutIn(true);
        cutInTimerRef.current = window.setTimeout(() => {
          setShowCutIn(false);
          onSuccess(step.afterDialogue);
        }, 1250);
      } else {
        setStageIdx((s) => s + 1);
        setCollectedCubes(0);
        setPhase('cubes');
        setCubeLane(0);
        setMsg('¡Carril correcto! Siguiente tramo de autopista mental.');
      }
    } else {
      sfx.error();
      onDamage();
      setMsg('¡Chocaste con una conclusión errónea! Escoge otro carril.');
    }
  };

  return (
    <div className="relative rounded-xl border border-yellow-400/50 bg-zinc-950 overflow-hidden shadow-2xl">
      {showCutIn && (
        <CutInOverlay
          type="ya_lo_tengo"
          subtitle="¡Ruta mental completada!"
        />
      )}
      <div className="px-5 py-3 bg-gradient-to-r from-yellow-500/20 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-yellow-400 text-zinc-950 font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            TAXI MENTAL (PSYCHE TAXI)
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">{step.subtitle}</p>
          </div>
        </div>
        <div className="text-xs font-mono-tabular text-yellow-300">
          Tramo {stageIdx + 1}/{step.stages.length}
        </div>
      </div>

      {/* Highway Perspective Arena */}
      <div className="p-5 bg-[linear-gradient(180deg,#09090b_0%,#18181b_55%,#0f172a_100%)] space-y-5">
        {/* Prompt Assembly Bar */}
        <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center">
          <div className="text-xs uppercase tracking-wider text-yellow-400 font-bold mb-1">
            {phase === 'cubes' ? 'Recogiendo fragmentos de pregunta' : '¡Pregunta Desbloqueada!'}
          </div>
          <div className="font-display font-bold text-xl text-white">
            {phase === 'cubes'
              ? stage.promptPieces.map((piece, i) => (
                  <span
                    key={i}
                    className={`mx-1 ${
                      i < collectedCubes ? 'text-yellow-300' : 'text-zinc-700'
                    }`}
                  >
                    {i < collectedCubes ? piece : '???'}
                  </span>
                ))
              : stage.question}
          </div>
        </div>

        {/* 3 Lanes */}
        <div className="grid grid-cols-3 gap-3">
          {([0, 1, 2] as const).map((laneIdx) => {
            const hasTaxi = lane === laneIdx;
            const hasCube = phase === 'cubes' && cubeLane === laneIdx;
            return (
              <button
                key={laneIdx}
                onClick={() =>
                  phase === 'cubes'
                    ? handleCollectCube(laneIdx)
                    : handleChooseGate(laneIdx)
                }
                className={`relative min-h-44 p-4 rounded-xl border-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                  hasTaxi
                    ? 'bg-yellow-500/15 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.25)]'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span className="text-[11px] font-mono-tabular text-zinc-500">
                  CARRIL {laneIdx === 0 ? 'A' : laneIdx === 1 ? 'B' : 'C'}
                </span>

                {phase === 'cubes' ? (
                  hasCube ? (
                    <div className="px-3 py-2 rounded-lg bg-cyan-500 text-zinc-950 font-display font-extrabold text-sm shadow-lg animate-bounce">
                      CUBO: {stage.promptPieces[collectedCubes]}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-600">Vía libre</div>
                  )
                ) : (
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-yellow-400/60 text-sm font-bold text-white text-center">
                    {stage.options[laneIdx]}
                  </div>
                )}

                {/* Colombian Yellow Taxi Icon */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-opacity ${
                    hasTaxi
                      ? 'bg-yellow-400 text-zinc-950 font-bold opacity-100 shadow-lg'
                      : 'opacity-20 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span className="text-xs">TAXI ICFES</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Lane Steering Controls + Feedback */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLane((l) => (l > 0 ? ((l - 1) as 0 | 1 | 2) : 0))}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Izquierda (A)
            </button>
            <button
              onClick={() => setLane((l) => (l < 2 ? ((l + 1) as 0 | 1 | 2) : 2))}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              Derecha (D) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-zinc-300">{msg}</div>
        </div>
      </div>
    </div>
  );
};
