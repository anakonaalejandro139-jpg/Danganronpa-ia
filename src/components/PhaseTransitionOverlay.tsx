import React from 'react';
import { ChapterData, ChapterPhase } from '../types/game';

export type TransitionStage = 'idle' | 'out' | 'hold' | 'in';
export type TransitionAccent = 'cyan' | 'rose' | 'amber' | 'emerald';

export interface PhaseTransitionMeta {
  label: string;
  sublabel: string;
  accent: TransitionAccent;
}

export interface PhaseTransitionState extends PhaseTransitionMeta {
  stage: TransitionStage;
}

const ACCENT_STYLES: Record<
  TransitionAccent,
  { bar: string; badge: string; glow: string }
> = {
  cyan: {
    bar: 'bg-cyan-400',
    badge: 'text-cyan-400 border-cyan-400/50',
    glow: 'shadow-[0_0_28px_rgba(34,211,238,0.45)]',
  },
  rose: {
    bar: 'bg-rose-500',
    badge: 'text-rose-400 border-rose-500/60',
    glow: 'shadow-[0_0_28px_rgba(244,63,94,0.55)]',
  },
  amber: {
    bar: 'bg-amber-400',
    badge: 'text-amber-300 border-amber-400/50',
    glow: 'shadow-[0_0_28px_rgba(251,191,36,0.45)]',
  },
  emerald: {
    bar: 'bg-emerald-400',
    badge: 'text-emerald-300 border-emerald-400/50',
    glow: 'shadow-[0_0_28px_rgba(52,211,153,0.45)]',
  },
};

export function getPhaseTransitionMeta(
  nextPhase: ChapterPhase,
  targetChapter: ChapterData
): PhaseTransitionMeta {
  const chapterSub = `${targetChapter.numberLabel} · ${targetChapter.title}`;

  switch (nextPhase) {
    case 'intro':
      if (targetChapter.id === 'prologue') {
        return { label: 'PRÓLOGO', sublabel: chapterSub, accent: 'cyan' };
      }
      if (targetChapter.id === 'epilogue') {
        return { label: 'EPÍLOGO', sublabel: chapterSub, accent: 'emerald' };
      }
      if (targetChapter.id === 'ch7') {
        return {
          label: 'JUICIO FINAL · ACTO II',
          sublabel: chapterSub,
          accent: 'rose',
        };
      }
      return {
        label: 'VIDA DIARIA',
        sublabel: chapterSub,
        accent: 'cyan',
      };
    case 'social':
      return {
        label: 'VIDA SOCIAL',
        sublabel: `Tiempo Libre · ${targetChapter.numberLabel}`,
        accent: 'emerald',
      };
    case 'body_discovery':
      return {
        label: '¡CADÁVER DESCUBIERTO!',
        sublabel: 'Anuncio Oficial de Monokuma V3',
        accent: 'rose',
      };
    case 'investigation':
      return {
        label:
          targetChapter.id === 'ch6'
            ? 'INVESTIGACIÓN · MENTE MAESTRA'
            : 'INVESTIGACIÓN',
        sublabel: chapterSub,
        accent: 'amber',
      };
    case 'alibi_puzzle':
      return {
        label: 'ALIBI PUZZLE',
        sublabel: 'Reconstrucción de Coartada',
        accent: 'cyan',
      };
    case 'trial':
      return {
        label: 'JUICIO ESCOLAR',
        sublabel: chapterSub,
        accent: 'rose',
      };
    case 'outro':
      return {
        label:
          targetChapter.id === 'epilogue'
            ? 'FIN DE LA HISTORIA'
            : 'CIERRE DEL CAPÍTULO',
        sublabel: chapterSub,
        accent: 'cyan',
      };
  }
}

export const PhaseTransitionOverlay: React.FC<{
  state: PhaseTransitionState;
}> = ({ state }) => {
  const isIdle = state.stage === 'idle';
  const isOpaque = state.stage === 'out' || state.stage === 'hold';
  const showLabel = state.stage === 'hold' || state.stage === 'in';
  const accent = ACCENT_STYLES[state.accent];

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center px-6 transition-opacity ease-in-out ${
        isIdle
          ? 'opacity-0 duration-0 pointer-events-none'
          : isOpaque
          ? 'opacity-100 duration-300 pointer-events-auto'
          : 'opacity-0 duration-400 pointer-events-none'
      }`}
    >
      {!isIdle && (
        <div
          className={`max-w-xl w-full text-center space-y-3 transition-all duration-300 ${
            showLabel ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className={`h-1 w-24 mx-auto dr-slanted-cut ${accent.bar} ${accent.glow}`} />
          <div
            className={`inline-block px-4 py-1 border text-[11px] sm:text-xs font-mono-tabular uppercase tracking-[0.22em] ${accent.badge}`}
          >
            SABER MORTAL 11°
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-wider uppercase text-white">
            {state.label}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 tracking-wide">
            {state.sublabel}
          </p>
          <div className={`h-1 w-24 mx-auto dr-slanted-cut ${accent.bar} ${accent.glow}`} />
        </div>
      )}
    </div>
  );
};
