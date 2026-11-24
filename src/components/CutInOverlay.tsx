import React from 'react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';

export type CutInType =
  | 'counter'
  | 'consent'
  | 'lie'
  | 'full_counter'
  | 'me_sirve'
  | 'ya_lo_tengo'
  | 'acabemos_con_esto';

interface CutInOverlayProps {
  type: CutInType;
  teamIds?: CharacterId[];
  subtitle?: string;
}

const SHARDS = [
  { tx: '-140px', ty: '-75px', rot: '-65deg', w: '18px', h: '10px' },
  { tx: '150px', ty: '-85px', rot: '72deg', w: '22px', h: '11px' },
  { tx: '-175px', ty: '55px', rot: '-110deg', w: '16px', h: '14px' },
  { tx: '165px', ty: '68px', rot: '125deg', w: '20px', h: '10px' },
  { tx: '-85px', ty: '-115px', rot: '45deg', w: '14px', h: '14px' },
  { tx: '90px', ty: '110px', rot: '-40deg', w: '15px', h: '12px' },
];

export const CutInOverlay: React.FC<CutInOverlayProps> = ({
  type,
  teamIds = ['mateo'],
  subtitle,
}) => {
  const config: Record<
    CutInType,
    {
      label: string;
      tag: string;
      bg: string;
      border: string;
      textColor: string;
      shardColor: string;
    }
  > = {
    counter: {
      label: '¡NO ES CIERTO!',
      tag: 'COUNTER · CONTRAATAQUE',
      bg: 'from-amber-500/95 via-rose-600/95 to-zinc-950/95',
      border: 'border-amber-300',
      textColor: 'text-amber-300',
      shardColor: 'bg-amber-300',
    },
    consent: {
      label: '¡ESTOY DE ACUERDO!',
      tag: 'CONSENT · V-CONSENSO',
      bg: 'from-cyan-500/95 via-blue-700/95 to-zinc-950/95',
      border: 'border-cyan-200',
      textColor: 'text-cyan-200',
      shardColor: 'bg-cyan-300',
    },
    lie: {
      label: '¡CONVERTIRÉ ESA MENTIRA EN VERDAD!',
      tag: 'PERJURY · MENTIRA V3',
      bg: 'from-fuchsia-600/95 via-purple-900/95 to-zinc-950/95',
      border: 'border-fuchsia-300',
      textColor: 'text-fuchsia-200',
      shardColor: 'bg-fuchsia-300',
    },
    full_counter: {
      label: '¡FULL COUNTER!',
      tag: '¡ESTE ES NUESTRO RESUMEN!',
      bg: 'from-cyan-500/95 via-indigo-700/95 to-zinc-950/95',
      border: 'border-white',
      textColor: 'text-amber-300',
      shardColor: 'bg-white',
    },
    me_sirve: {
      label: '¡ME SIRVE!',
      tag: 'ALIBI PUZZLE · PISTA CAPTURADA',
      bg: 'from-emerald-500/95 via-cyan-600/95 to-zinc-950/95',
      border: 'border-cyan-200',
      textColor: 'text-cyan-200',
      shardColor: 'bg-emerald-300',
    },
    ya_lo_tengo: {
      label: '¡YA LO TENGO!',
      tag: 'DEDUCCIÓN COMPLETADA · EUREKA V3',
      bg: 'from-amber-400/95 via-cyan-600/95 to-zinc-950/95',
      border: 'border-amber-200',
      textColor: 'text-amber-200',
      shardColor: 'bg-amber-200',
    },
    acabemos_con_esto: {
      label: '¡ACABEMOS CON ESTO!',
      tag: 'ARMAMENTO DE ARGUMENTOS · GOLPE FINAL',
      bg: 'from-fuchsia-600/95 via-rose-700/95 to-zinc-950/95',
      border: 'border-white',
      textColor: 'text-cyan-200',
      shardColor: 'bg-cyan-200',
    },
  };

  const c = config[type];
  const displayTeam = type === 'full_counter' ? teamIds : ['mateo' as CharacterId];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-[2px] pointer-events-none overflow-hidden">
      {/* Initial Camera Flash */}
      <div className="absolute inset-0 bg-white animate-dr-flash pointer-events-none z-40" />

      {/* Shatter Glass / Truth Bullet Impact Shards */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {SHARDS.map((s, idx) => (
          <span
            key={idx}
            className={`absolute ${c.shardColor} opacity-90 animate-dr-shard-pop shadow-[0_0_12px_rgba(255,255,255,0.85)]`}
            style={
              {
                width: s.w,
                height: s.h,
                clipPath: 'polygon(15% 0%, 100% 25%, 75% 100%, 0% 70%)',
                '--tx': s.tx,
                '--ty': s.ty,
                '--rot': s.rot,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Diagonal V3 Cut-In Strip with Kinetic Speedlines */}
      <div
        className={`relative w-full py-5 px-6 bg-gradient-to-r ${c.bg} border-y-4 ${c.border} shadow-[0_0_55px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center gap-3 overflow-hidden animate-dr-cutin-slam`}
      >
        {/* Animated Anime Speedlines */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none animate-dr-speedlines"
          style={{
            width: 'calc(100% + 120px)',
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.65) 0px, rgba(255,255,255,0.65) 28px, transparent 28px, transparent 120px)',
            backgroundSize: '120px 6px',
          }}
        />

        <div className="relative z-10 text-xs font-mono-tabular font-extrabold tracking-[0.25em] uppercase text-white/95">
          {c.tag}
        </div>

        {/* Team Lineup (for FULL COUNTER shows everyone on protagonist's side!) */}
        <div className="relative z-10 flex items-end justify-center gap-3 sm:gap-5 flex-wrap">
          {displayTeam.map((id) => {
            const profile =
              CHARACTERS[id as Exclude<keyof typeof CHARACTERS, never>];
            return (
              <div key={id} className="flex flex-col items-center">
                <CharacterSprite
                  characterId={id}
                  expression="pointing"
                  size={type === 'full_counter' ? 'sm' : 'md'}
                  isSpeaking
                  animateEnter
                />
                {type === 'full_counter' && profile && (
                  <span className="mt-1 px-2 py-0.5 bg-zinc-950/90 text-white text-[11px] font-bold rounded border border-cyan-300/70 shadow">
                    {profile.shortName}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          className={`relative z-10 font-display font-extrabold text-3xl sm:text-5xl tracking-wider uppercase text-center drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)] ${c.textColor}`}
        >
          {c.label}
        </div>

        {subtitle && (
          <div className="relative z-10 text-xs sm:text-sm font-bold text-white/95 bg-zinc-950/75 px-3.5 py-1 rounded border border-white/20">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
