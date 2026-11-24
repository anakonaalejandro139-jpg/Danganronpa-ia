import React, { useMemo, useState } from 'react';
import {
  Image as ImageIcon,
  Lock,
  Play,
  Skull,
  Users,
  X,
} from 'lucide-react';
import { GAME_IMAGES } from '../assets/images';
import { CHAPTERS } from '../data/chapters';
import { CHARACTERS, STUDENT_IDS } from '../data/characters';
import {
  CharacterId,
  CulpritVoteStep,
  Expression,
  ForcedExecutionStep,
  MonokumaPose,
} from '../types/game';
import { CharacterSprite } from './CharacterSprite';
import { ExecutionCinema } from './trial/ExecutionCinema';
import { sfx } from '../utils/sound';

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  unlockedChars: CharacterId[];
  seenExecutions: string[];
}

interface BackgroundItem {
  id: string;
  title: string;
  subtitle: string;
  src: string;
}

const GALLERY_BACKGROUNDS: BackgroundItem[] = [
  {
    id: 'title',
    title: 'Arte Principal · Saber Mortal 11°',
    subtitle: 'Portada oficial del Examen Mortal en Bogotá',
    src: GAME_IMAGES.title,
  },
  {
    id: 'exterior',
    title: 'Sede Nacional del ICFES',
    subtitle: 'Fachada y patio principal del edificio blindado',
    src: GAME_IMAGES.exterior,
  },
  {
    id: 'cafeteria',
    title: 'Cafetería del Bloque',
    subtitle: 'Zona de Vida Social, desayunos y reuniones estudiantiles',
    src: GAME_IMAGES.cafeteria,
  },
  {
    id: 'courtroom',
    title: 'Sala de Juicios Escolares V3',
    subtitle: 'Escenario circular de debates y veredictos definitivos',
    src: GAME_IMAGES.courtroom,
  },
  {
    id: 'argumentArmament',
    title: 'Arena de Armamento de Argumentos',
    subtitle: 'Fondo del duelo rítmico final contra el culpable',
    src: GAME_IMAGES.argumentArmament,
  },
  {
    id: 'closingDesk',
    title: 'Mesa de Reconstrucción (Cómic Final)',
    subtitle: 'Tablero de bocetos del Argumento Final',
    src: GAME_IMAGES.closingDesk,
  },
  {
    id: 'executionCurtain',
    title: 'Telón de Castigo Definitivo',
    subtitle: 'Escenario de ejecuciones de Monokuma V3',
    src: GAME_IMAGES.executionCurtain,
  },
  {
    id: 'monokumaV3',
    title: 'Retrato Oficial · Monokuma V3',
    subtitle: 'Director Supremo del Examen Mortal del ICFES',
    src: GAME_IMAGES.monokumaV3,
  },
];

const STUDENT_EXPRESSIONS: { value: Expression; label: string }[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'happy', label: 'Feliz' },
  { value: 'worried', label: 'Preocupado' },
  { value: 'angry', label: 'Enojado' },
  { value: 'shocked', label: 'Impactado' },
  { value: 'pointing', label: '¡Objeción!' },
];

const MONOKUMA_POSES: { value: MonokumaPose; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'puhuhu', label: 'Puhuhu' },
  { value: 'angry', label: 'Furioso' },
  { value: 'shocked', label: '¡¿Qué?!' },
  { value: 'gavel', label: 'Mazo V3' },
];

interface GalleryExecutionEntry {
  chapterId: string;
  chapterLabel: string;
  targetId: CharacterId;
  executionTitle: string;
  executionNarration: string[];
  survives: boolean;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  open,
  onClose,
  unlockedChars,
  seenExecutions,
}) => {
  const [tab, setTab] = useState<'backgrounds' | 'sprites' | 'executions'>(
    'backgrounds'
  );
  const [lightboxBg, setLightboxBg] = useState<BackgroundItem | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<
    Exclude<CharacterId, 'narrador'> | null
  >(null);
  const [spriteExpression, setSpriteExpression] =
    useState<Expression>('neutral');
  const [monokumaPose, setMonokumaPose] = useState<MonokumaPose>('normal');
  const [activeExecution, setActiveExecution] =
    useState<GalleryExecutionEntry | null>(null);

  const allCharacters = useMemo(
    () =>
      (['monokuma', ...STUDENT_IDS] as CharacterId[]).filter(
        (id): id is Exclude<CharacterId, 'narrador'> => id !== 'narrador'
      ),
    []
  );

  const executionEntries = useMemo<GalleryExecutionEntry[]>(() => {
    const list: GalleryExecutionEntry[] = [];
    CHAPTERS.forEach((ch) => {
      const voteStep = ch.trialSteps.find(
        (s): s is CulpritVoteStep => s.type === 'culprit_vote'
      );
      const forcedStep = ch.trialSteps.find(
        (s): s is ForcedExecutionStep => s.type === 'forced_execution'
      );
      if (voteStep) {
        list.push({
          chapterId: ch.id,
          chapterLabel: ch.numberLabel,
          targetId: voteStep.correctCulpritId,
          executionTitle: voteStep.executionTitle,
          executionNarration: voteStep.executionNarration,
          survives: false,
        });
      } else if (forcedStep) {
        list.push({
          chapterId: ch.id,
          chapterLabel: ch.numberLabel,
          targetId: forcedStep.targetId,
          executionTitle: forcedStep.executionTitle,
          executionNarration: forcedStep.executionNarration,
          survives: Boolean(forcedStep.survives),
        });
      }
    });
    return list;
  }, []);

  if (!open) return null;

  const unlockedCount = allCharacters.filter((id) =>
    unlockedChars.includes(id)
  ).length;
  const seenExecCount = executionEntries.filter((e) =>
    seenExecutions.includes(e.chapterId)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-6xl max-h-[90dvh] flex flex-col rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-zinc-900 border-b border-zinc-800">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
              Galería del Archivo ICFES
            </h2>
            <p className="text-xs text-zinc-400">
              Fondos ({GALLERY_BACKGROUNDS.length}) · Sprites ({unlockedCount}/
              {allCharacters.length}) · Ejecuciones ({seenExecCount}/
              {executionEntries.length})
            </p>
          </div>
          <button
            onClick={() => {
              sfx.click();
              setActiveExecution(null);
              setLightboxBg(null);
              setSelectedCharId(null);
              onClose();
            }}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
            aria-label="Cerrar Galería"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 px-4 sm:px-6 py-3 bg-zinc-900/60 border-b border-zinc-800">
          <button
            onClick={() => {
              sfx.click();
              setTab('backgrounds');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'backgrounds'
                ? 'bg-cyan-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Fondos ({GALLERY_BACKGROUNDS.length})
          </button>

          <button
            onClick={() => {
              sfx.click();
              setTab('sprites');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'sprites'
                ? 'bg-emerald-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Sprites Desbloqueados ({unlockedCount}/{allCharacters.length})
          </button>

          <button
            onClick={() => {
              sfx.click();
              setTab('executions');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'executions'
                ? 'bg-rose-500 text-white'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Skull className="w-4 h-4" />
            Ejecuciones Vistas ({seenExecCount}/{executionEntries.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: BACKGROUNDS */}
          {tab === 'backgrounds' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GALLERY_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    sfx.click();
                    setLightboxBg(bg);
                  }}
                  className="group text-left rounded-xl overflow-hidden border border-zinc-800 hover:border-cyan-400 bg-zinc-900 transition-all cursor-pointer"
                >
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={bg.src}
                      alt={bg.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3.5">
                    <div className="font-display font-bold text-lg text-white">
                      {bg.title}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{bg.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: UNLOCKED SPRITES */}
          {tab === 'sprites' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Habla con los personajes en la historia, en Vida Social o durante la Investigación para desbloquear sus retratos completos y expresiones.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allCharacters.map((id) => {
                  const char = CHARACTERS[id];
                  const unlocked = unlockedChars.includes(id);

                  if (!unlocked) {
                    return (
                      <div
                        key={id}
                        className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 flex flex-col items-center justify-center text-center min-h-48 opacity-70"
                      >
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                          <Lock className="w-6 h-6 text-zinc-600" />
                        </div>
                        <div className="font-display font-bold text-base text-zinc-500">
                          Personaje Bloqueado
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-1">
                          Encuéntralo en el modo historia para desbloquear
                        </p>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={id}
                      onClick={() => {
                        sfx.click();
                        setSelectedCharId(id);
                        setSpriteExpression('neutral');
                        setMonokumaPose('normal');
                      }}
                      className="p-3.5 rounded-xl border border-zinc-800 hover:border-emerald-400 bg-zinc-900/90 flex flex-col items-center text-center transition-all cursor-pointer"
                    >
                      <CharacterSprite
                        characterId={id}
                        expression="neutral"
                        monokumaPose="normal"
                        size="sm"
                      />
                      <div className="mt-2 font-display font-bold text-lg text-white">
                        {char.name}
                      </div>
                      <div className="text-[11px] text-cyan-400 font-medium">
                        {char.ultimate}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {char.city} · {char.region}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SEEN EXECUTIONS */}
          {tab === 'executions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {executionEntries.map((entry) => {
                const seen = seenExecutions.includes(entry.chapterId);
                const target =
                  CHARACTERS[
                    entry.targetId as Exclude<keyof typeof CHARACTERS, never>
                  ];

                if (!seen) {
                  return (
                    <div
                      key={entry.chapterId}
                      className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between gap-4 min-h-44"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
                        <span>{entry.chapterLabel}</span>
                        <Lock className="w-4 h-4 text-zinc-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-xl text-zinc-500">
                          Ejecución Clasificada
                        </div>
                        <p className="text-xs text-zinc-600">
                          Completa el juicio de {entry.chapterLabel} (o mírala desde la campaña) para desbloquear esta escena en tu galería.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.chapterId}
                    className="p-5 rounded-xl border border-rose-500/40 bg-zinc-900/90 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                          {entry.chapterLabel} · {target?.shortName}
                        </div>
                        <h3 className="font-display font-extrabold text-xl text-white mt-0.5">
                          {entry.executionTitle}
                        </h3>
                      </div>
                      <CharacterSprite
                        characterId={entry.targetId}
                        expression="shocked"
                        size="sm"
                        className="w-12 h-14 shrink-0"
                      />
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {entry.executionNarration[0]}
                    </p>

                    <button
                      onClick={() => {
                        sfx.gavel();
                        setActiveExecution(entry);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-sm cursor-pointer transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Reproducir Ejecución
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Background Lightbox Modal */}
      {lightboxBg && (
        <div
          onClick={() => setLightboxBg(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl rounded-2xl border border-zinc-700 bg-zinc-950 overflow-hidden shadow-2xl"
          >
            <img
              src={lightboxBg.src}
              alt={lightboxBg.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75dvh] object-contain bg-black"
            />
            <div className="p-4 flex items-center justify-between gap-4 bg-zinc-900 border-t border-zinc-800">
              <div>
                <h4 className="font-display font-extrabold text-xl text-white">
                  {lightboxBg.title}
                </h4>
                <p className="text-xs text-zinc-400">{lightboxBg.subtitle}</p>
              </div>
              <button
                onClick={() => setLightboxBg(null)}
                className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Sprite Inspector Modal */}
      {selectedCharId && (
        <div
          onClick={() => setSelectedCharId(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {CHARACTERS[selectedCharId].ultimate}
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  {CHARACTERS[selectedCharId].name}
                </h3>
                <p className="text-xs text-zinc-400">
                  {CHARACTERS[selectedCharId].city} ·{' '}
                  {CHARACTERS[selectedCharId].region}
                </p>
              </div>
              <button
                onClick={() => setSelectedCharId(null)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <div className="sm:col-span-5 flex justify-center">
                <CharacterSprite
                  characterId={selectedCharId}
                  expression={spriteExpression}
                  monokumaPose={monokumaPose}
                  size="lg"
                />
              </div>
              <div className="sm:col-span-7 space-y-3">
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {CHARACTERS[selectedCharId].bio}
                </p>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    {selectedCharId === 'monokuma'
                      ? 'Poses de Monokuma V3'
                      : 'Expresiones'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCharId === 'monokuma'
                      ? MONOKUMA_POSES.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => {
                              sfx.click();
                              setMonokumaPose(p.value);
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                              monokumaPose === p.value
                                ? 'bg-rose-500 text-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))
                      : STUDENT_EXPRESSIONS.map((exp) => (
                          <button
                            key={exp.value}
                            onClick={() => {
                              sfx.click();
                              setSpriteExpression(exp.value);
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                              spriteExpression === exp.value
                                ? 'bg-cyan-400 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {exp.label}
                          </button>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replay Execution Cinema inside Gallery */}
      {activeExecution && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4">
          <div className="w-full max-w-5xl">
            <ExecutionCinema
              culpritId={activeExecution.targetId}
              executionTitle={activeExecution.executionTitle}
              narration={activeExecution.executionNarration}
              survives={activeExecution.survives}
              finishLabel="Volver a la Galería"
              onFinish={() => setActiveExecution(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
