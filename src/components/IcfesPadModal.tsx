import React, { useState } from 'react';
import { X, Users, Crosshair, ScrollText, Sparkles } from 'lucide-react';
import { CharacterId, TruthBullet } from '../types/game';
import {
  CHARACTERS,
  EASTER_EGGS,
  ICFES_RULES,
  STUDENT_IDS,
} from '../data/characters';
import { CharacterSprite } from './CharacterSprite';

interface IcfesPadModalProps {
  open: boolean;
  onClose: () => void;
  deadIds: CharacterId[];
  bonds: Record<string, number>;
  bullets: TruthBullet[];
  foundEasterEggs: string[];
}

export const IcfesPadModal: React.FC<IcfesPadModalProps> = ({
  open,
  onClose,
  deadIds,
  bonds,
  bullets,
  foundEasterEggs,
}) => {
  const [tab, setTab] = useState<'students' | 'bullets' | 'rules' | 'eggs'>(
    'students'
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[88vh] flex flex-col rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white tracking-wide">
              ICFES-Pad · Expediente Estudiantil
            </h2>
            <p className="text-xs text-zinc-400">
              16 Estudiantes · Balas de Verdad · Reglas · Easter Eggs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
            aria-label="Cerrar ICFES-Pad"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 px-6 py-3 bg-zinc-900/60 border-b border-zinc-800">
          <button
            onClick={() => setTab('students')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'students'
                ? 'bg-cyan-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Estudiantes (16)
          </button>
          <button
            onClick={() => setTab('bullets')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'bullets'
                ? 'bg-cyan-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            Balas de Verdad ({bullets.length})
          </button>
          <button
            onClick={() => setTab('rules')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'rules'
                ? 'bg-cyan-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            Reglas del Juego
          </button>
          <button
            onClick={() => setTab('eggs')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'eggs'
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Easter Eggs ({foundEasterEggs.length}/{EASTER_EGGS.length})
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'students' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STUDENT_IDS.map((id) => {
                const c = CHARACTERS[id as Exclude<keyof typeof CHARACTERS, never>];
                const isDead = deadIds.includes(id);
                const bondLevel = bonds[id] || 0;
                return (
                  <div
                    key={id}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center ${
                      isDead
                        ? 'bg-zinc-950 border-rose-900/50 opacity-75'
                        : 'bg-zinc-900/90 border-zinc-800'
                    }`}
                  >
                    <CharacterSprite
                      characterId={id}
                      expression="neutral"
                      dead={isDead}
                      size="sm"
                    />
                    <div className="mt-2 font-bold text-sm text-white">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-cyan-400 font-medium">
                      {c.ultimate}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {c.city} · {c.region}
                    </div>
                    <div className="mt-2 text-[11px] font-mono-tabular text-amber-300">
                      Vínculo: {bondLevel}/3
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'bullets' && (
            <div className="space-y-3">
              {bullets.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Aún no has recolectado Balas de Verdad en este capítulo.
                </p>
              ) : (
                bullets.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border ${
                      b.isAlibi
                        ? 'bg-cyan-950/25 border-cyan-500/40'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white">{b.title}</span>
                      <span className="text-xs text-cyan-300 font-mono-tabular">
                        {b.source}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-1">{b.summary}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'rules' && (
            <div className="space-y-2.5">
              {ICFES_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200"
                >
                  {rule}
                </div>
              ))}
            </div>
          )}

          {tab === 'eggs' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {EASTER_EGGS.map((egg) => {
                const found = foundEasterEggs.includes(egg.id);
                return (
                  <div
                    key={egg.id}
                    className={`p-4 rounded-xl border ${
                      found
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-zinc-900/50 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-300">
                        {found ? egg.title : 'Easter Egg Oculto'}
                      </span>
                      <span className="text-zinc-500 font-mono-tabular">
                        {egg.location}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      {found
                        ? egg.description
                        : 'Explora los puntos de investigación de cada capítulo para descubrirlo.'}
                    </p>
                    {found && (
                      <div className="mt-2 text-[11px] text-amber-400/90">
                        {egg.reference}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
