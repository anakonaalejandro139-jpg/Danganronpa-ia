import React, { useEffect, useRef, useState } from 'react';
import { BookOpenCheck, Check } from 'lucide-react';
import { ClosingArgumentStep } from '../../types/game';
import { GAME_IMAGES } from '../../assets/images';
import { CutInOverlay } from '../CutInOverlay';
import { MangaPanelArt } from './MangaPanelArt';
import { voiceEngine } from '../../utils/voice';
import { sfx } from '../../utils/sound';

interface ClosingArgumentProps {
  step: ClosingArgumentStep;
  onDamage: () => void;
  onSuccess: (afterDialogue: ClosingArgumentStep['afterDialogue']) => void;
}

export const ClosingArgument: React.FC<ClosingArgumentProps> = ({
  step,
  onDamage,
  onSuccess,
}) => {
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(
    step.panelPool[0]?.id || null
  );
  const [showCutIn, setShowCutIn] = useState(false);
  const [msg, setMsg] = useState(
    'Selecciona una viñeta ilustrada de abajo y colócala en su recuadro numerado del cómic.'
  );
  const cutInTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cutInTimerRef.current !== null) window.clearTimeout(cutInTimerRef.current);
    };
  }, []);

  const handleAssignSlot = (slotNumber: number) => {
    if (showCutIn || !selectedPanelId) return;
    sfx.click();
    setPlaced((prev) => ({ ...prev, [slotNumber]: selectedPanelId }));
  };

  const handleVerify = () => {
    if (showCutIn) return;
    const allFilled = step.slots.every((s) => placed[s.slotNumber]);
    if (!allFilled) {
      sfx.error();
      setMsg('¡Faltan espacios por rellenar en la reconstrucción del crimen!');
      return;
    }

    const allCorrect = step.slots.every(
      (s) => placed[s.slotNumber] === s.correctPanelId
    );
    if (allCorrect) {
      sfx.contradictBreak();
      voiceEngine.speak('mateo', '¡Ya lo tengo! ¡Así fue exactamente como ocurrió el crimen!', {
        interrupt: true,
      });
      setShowCutIn(true);
      cutInTimerRef.current = window.setTimeout(() => {
        setShowCutIn(false);
        onSuccess(step.afterDialogue);
      }, 1250);
    } else {
      sfx.error();
      onDamage();
      voiceEngine.speak('mateo', 'Algo no cuadra en el orden del cómic...');
      setMsg('¡El orden cronológico del cómic tiene un fallo! Revisa las ilustraciones.');
    }
  };

  return (
    <div className="relative rounded-xl border border-cyan-400/50 bg-zinc-950 overflow-hidden shadow-2xl">
      {showCutIn && (
        <CutInOverlay
          type="ya_lo_tengo"
          subtitle="¡Reconstrucción completa del crimen!"
        />
      )}
      <div className="px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-cyan-400 text-zinc-950 font-display font-extrabold text-sm tracking-wider uppercase dr-slanted-cut">
            ARGUMENTO FINAL (CÓMIC)
          </span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
            <p className="text-xs text-zinc-400">{step.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
          <BookOpenCheck className="w-4 h-4" />
          <span>¡Reconstruye el cómic con las viñetas!</span>
        </div>
      </div>

      {/* Comic Strip Slots over Detective Drafting Desk Backdrop */}
      <div className="relative p-5 overflow-hidden">
        <img
          src={GAME_IMAGES.closingDesk}
          alt="Escritorio de Cómic"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="relative z-10 grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-3 gap-4">
          {step.slots.map((slot) => {
            const assignedPanel = step.panelPool.find(
              (p) => p.id === placed[slot.slotNumber]
            );
            return (
              <div
                key={slot.slotNumber}
                onClick={() => handleAssignSlot(slot.slotNumber)}
                className="flex flex-col justify-between p-4 rounded-lg bg-white text-zinc-950 border-4 border-zinc-900 shadow-[5px_5px_0_#09090b] cursor-pointer hover:bg-cyan-50 transition-colors min-h-60"
              >
                <div className="flex items-center justify-between border-b-2 border-zinc-900/15 pb-1.5 mb-2">
                  <span className="font-display font-extrabold text-sm uppercase text-zinc-900">
                    Viñeta #{slot.slotNumber}
                  </span>
                  {assignedPanel && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-600 text-white rounded">
                      COLOCADA
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-zinc-700 mb-2">
                  {slot.captionBefore}
                </p>

                {assignedPanel ? (
                  <div className="space-y-2">
                    <MangaPanelArt panelId={assignedPanel.id} />
                    <div className="p-2 rounded bg-cyan-100 border border-cyan-700 text-center">
                      <div className="font-display font-bold text-sm text-zinc-950">
                        {assignedPanel.title}
                      </div>
                      <div className="text-[11px] text-zinc-700">
                        {assignedPanel.detail}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-28 rounded border-2 border-dashed border-zinc-400 bg-zinc-100 flex items-center justify-center text-center p-3">
                    <span className="text-xs font-bold text-zinc-500">
                      Clic aquí para insertar viñeta ilustrada
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Illustrated Panel Pool */}
      <div className="p-5 bg-zinc-900 border-t border-zinc-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Viñetas ilustradas disponibles (elige una y luego haz clic en un recuadro del cómic):
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {step.panelPool.map((p) => {
            const active = selectedPanelId === p.id;
            const assignedSlot = step.slots.find(
              (s) => placed[s.slotNumber] === p.id
            );
            return (
              <button
                key={p.id}
                onClick={() => {
                  sfx.click();
                  setSelectedPanelId(p.id);
                }}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                    : assignedSlot
                    ? 'bg-zinc-950/70 border-emerald-500/40 text-zinc-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <MangaPanelArt panelId={p.id} />
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm">{p.title}</div>
                    {assignedSlot && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                        #{assignedSlot.slotNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{p.detail}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-zinc-300">{msg}</span>
          <button
            onClick={handleVerify}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-lg rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-5 h-5" />
            ¡Así fue como ocurrió!
          </button>
        </div>
      </div>
    </div>
  );
};
