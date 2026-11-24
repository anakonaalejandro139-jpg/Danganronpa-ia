import React, { useEffect, useRef, useState } from 'react';
import { Gavel } from 'lucide-react';
import { CulpritVoteStep, CharacterId } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterSprite } from '../CharacterSprite';
import { ExecutionCinema } from './ExecutionCinema';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface CulpritVoteProps {
  step: CulpritVoteStep;
  onDamage: () => void;
  onExecutionViewed?: () => void;
  onComplete: () => void;
}

export const CulpritVote: React.FC<CulpritVoteProps> = ({
  step,
  onDamage,
  onExecutionViewed,
  onComplete,
}) => {
  const [selectedId, setSelectedId] = useState<CharacterId | null>(null);
  const [phase, setPhase] = useState<'vote' | 'roulette' | 'execution'>('vote');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const rouletteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rouletteTimerRef.current !== null) window.clearTimeout(rouletteTimerRef.current);
    };
  }, []);

  const handleCastVote = () => {
    if (!selectedId || phase !== 'vote') return;
    if (selectedId !== step.correctCulpritId) {
      sfx.error();
      onDamage();
      voiceEngine.speak(
        'monokuma',
        '¡Puhuhu! ¡Votaron mal! ¡Revisa las pruebas o todos reprobarán!'
      );
      setErrorMsg(
        '¡Monokuma ríe! Si votamos al inocente, todos moriremos. ¡Revisa los hechos y señala al verdadero culpable!'
      );
      return;
    }

    sfx.gavel();
    voiceEngine.speak(
      'monokuma',
      '¡Votación correcta! ¡Puhuhu! ¡Giremos la ruleta de la ejecución!'
    );
    setPhase('roulette');
    rouletteTimerRef.current = window.setTimeout(() => {
      sfx.puhuhu();
      setPhase('execution');
    }, 1900);
  };

  if (phase === 'execution') {
    return (
      <ExecutionCinema
        culpritId={step.correctCulpritId}
        executionTitle={step.executionTitle}
        narration={step.executionNarration}
        onViewed={onExecutionViewed}
        onFinish={onComplete}
      />
    );
  }

  return (
    <div className="rounded-xl border border-rose-600/60 bg-zinc-950 overflow-hidden shadow-2xl">
      <div className="px-5 py-3 bg-gradient-to-r from-rose-950 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-rose-600 text-white font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            VOTACIÓN DEL JUICIO
          </span>
          <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
        </div>
        <Gavel className="w-5 h-5 text-rose-400" />
      </div>

      {phase === 'vote' && (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h4 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase">
              “¡El culpable eres tú!”
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400">
              Selecciona al estudiante responsable del asesinato para emitir el veredicto del ICFES.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 landscape:grid-cols-4 md:grid-cols-4 gap-2.5 sm:gap-3">
            {step.suspects.map((id) => {
              const char =
                CHARACTERS[id as Exclude<keyof typeof CHARACTERS, never>];
              const active = selectedId === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    sfx.click();
                    setSelectedId(id);
                    setErrorMsg(null);
                  }}
                  className={`flex flex-col items-center p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-rose-950/60 border-rose-400 scale-[1.02] shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <CharacterSprite characterId={id} expression="worried" size="sm" />
                  <span className="mt-1.5 sm:mt-2 font-bold text-xs sm:text-sm text-white">
                    {char?.shortName}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate max-w-full">
                    {char?.ultimate}
                  </span>
                </button>
              );
            })}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500 text-xs text-rose-200 text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-center">
            <button
              disabled={!selectedId}
              onClick={handleCastVote}
              className="px-6 sm:px-8 py-3 sm:py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-display font-extrabold text-lg sm:text-xl tracking-wide rounded-xl transition-colors cursor-pointer"
            >
              Emitir Voto Definitivo
            </button>
          </div>
        </div>
      )}

      {phase === 'roulette' && (
        <div className="p-6 sm:p-12 text-center space-y-4 sm:space-y-6 bg-zinc-950">
          <div className="flex justify-center">
            <CharacterSprite
              characterId="monokuma"
              monokumaPose="gavel"
              size="lg"
            />
          </div>
          <h4 className="font-display font-extrabold text-2xl sm:text-4xl text-rose-400 animate-pulse uppercase">
            ¡Votación Correcta! ¡Puhuhu!
          </h4>
          <p className="text-sm sm:text-base text-zinc-300">
            Monokuma gira la ruleta de la Sala de Juicios... ¡Es hora del Castigo Definitivo!
          </p>
        </div>
      )}
    </div>
  );
};
