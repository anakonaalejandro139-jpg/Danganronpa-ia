import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Coffee,
  Compass,
  Gavel,
  Heart,
  Home,
  Images,
  Music,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CHAPTERS } from './data/chapters';
import { CHARACTERS, EASTER_EGGS, STUDENT_IDS } from './data/characters';
import {
  ChapterId,
  ChapterPhase,
  CharacterId,
  DialogueLine,
  TruthBullet,
} from './types/game';
import { CharacterSprite } from './components/CharacterSprite';
import { AlibiPuzzle } from './components/AlibiPuzzle';
import { IcfesPadModal } from './components/IcfesPadModal';
import { NonStopDebate } from './components/trial/NonStopDebate';
import { MassPanicDebate } from './components/trial/MassPanicDebate';
import { DebateScrum } from './components/trial/DebateScrum';
import { HangmansGambitV3 } from './components/trial/HangmansGambitV3';
import { PsycheTaxi } from './components/trial/PsycheTaxi';
import { MindMine } from './components/trial/MindMine';
import { RebuttalShowdown } from './components/trial/RebuttalShowdown';
import { ClosingArgument } from './components/trial/ClosingArgument';
import { ArgumentArmament } from './components/trial/ArgumentArmament';
import { CulpritVote } from './components/trial/CulpritVote';
import { ExecutionCinema } from './components/trial/ExecutionCinema';
import { CulpritVoteStep, ForcedExecutionStep } from './types/game';
import { GAME_IMAGES } from './assets/images';
import { GalleryModal } from './components/GalleryModal';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import {
  PhaseTransitionMeta,
  PhaseTransitionOverlay,
  PhaseTransitionState,
  getPhaseTransitionMeta,
} from './components/PhaseTransitionOverlay';
import { OstTrackId, ost } from './utils/ost';
import { voiceEngine } from './utils/voice';
import { sfx } from './utils/sound';

const BACKGROUNDS = {
  exterior: GAME_IMAGES.exterior,
  cafeteria: GAME_IMAGES.cafeteria,
  courtroom: GAME_IMAGES.courtroom,
  title: GAME_IMAGES.title,
};

const STORAGE_KEY = 'saber_mortal_11_save_v2';
const GALLERY_STORAGE_KEY = 'saber_mortal_11_gallery_v1';

interface GallerySaveState {
  unlockedChars: CharacterId[];
  seenExecutions: string[];
}

interface SaveState {
  chapterIdx: number;
  phase: ChapterPhase;
  bonds: Record<string, number>;
  foundEasterEggs: string[];
  collectedBullets?: TruthBullet[];
  inspectedHotspots?: string[];
  alibiDone?: boolean;
  trialStepIdx?: number;
  dialogueIdx?: number;
}

export default function App() {
  const [screen, setScreen] = useState<'title' | 'game'>('title');
  const [chapterIdx, setChapterIdx] = useState(0);
  const [phase, setPhase] = useState<ChapterPhase>('intro');
  const [dialogueIdx, setDialogueIdx] = useState(0);

  // Social Life state
  const [selectedSocialChar, setSelectedSocialChar] =
    useState<CharacterId | null>(null);
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const [bonds, setBonds] = useState<Record<string, number>>({});
  const [freeTimeLeft, setFreeTimeLeft] = useState(2);

  // Investigation state
  const [collectedBullets, setCollectedBullets] = useState<TruthBullet[]>([]);
  const [inspectedHotspots, setInspectedHotspots] = useState<string[]>([]);
  const [hotspotDialogue, setHotspotDialogue] = useState<DialogueLine[] | null>(
    null
  );
  const [alibiDone, setAlibiDone] = useState(false);
  const [foundEasterEggs, setFoundEasterEggs] = useState<string[]>([]);
  const [eggBanner, setEggBanner] = useState<string | null>(null);

  // Trial state
  const [trialStepIdx, setTrialStepIdx] = useState(0);
  const [trialSubDialogue, setTrialSubDialogue] = useState<
    DialogueLine[] | null
  >(null);
  const [trialSubIdx, setTrialSubIdx] = useState(0);
  const [influence, setInfluence] = useState(100);
  const influenceRef = useRef(100);
  const [trialNotice, setTrialNotice] = useState<string | null>(null);
  const trialNoticeTimerRef = useRef<number | null>(null);

  // UI state
  const [padOpen, setPadOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [galleryUnlockedChars, setGalleryUnlockedChars] = useState<CharacterId[]>([
    'mateo',
    'monokuma',
  ]);
  const [gallerySeenExecutions, setGallerySeenExecutions] = useState<string[]>([]);
  const [previewExecution, setPreviewExecution] = useState<{
    chapterId: string;
    targetId: CharacterId;
    executionTitle: string;
    executionNarration: string[];
    survives?: boolean;
  } | null>(null);
  const [phaseTransition, setPhaseTransition] = useState<PhaseTransitionState>({
    stage: 'idle',
    label: '',
    sublabel: '',
    accent: 'cyan',
  });
  const transitionLockedRef = useRef(false);
  const transitionTimersRef = useRef<number[]>([]);

  const chapter = CHAPTERS[chapterIdx];

  useEffect(() => {
    influenceRef.current = influence;
  }, [influence]);

  // Unlock Web Audio OST on first user gesture anywhere in the app
  useEffect(() => {
    const unlock = () => ost.unlockFromGesture();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (trialNoticeTimerRef.current !== null) {
        window.clearTimeout(trialNoticeTimerRef.current);
      }
      transitionTimersRef.current.forEach((id) => window.clearTimeout(id));
      transitionTimersRef.current = [];
    };
  }, []);

  const runPhaseTransition = (
    meta: PhaseTransitionMeta,
    applyChange: () => void
  ) => {
    if (transitionLockedRef.current) return;
    transitionLockedRef.current = true;
    transitionTimersRef.current.forEach((id) => window.clearTimeout(id));
    transitionTimersRef.current = [];
    voiceEngine.stop();

    setPhaseTransition({
      stage: 'out',
      ...meta,
    });

    const tHold = window.setTimeout(() => {
      applyChange();
      setPhaseTransition({
        stage: 'hold',
        ...meta,
      });

      const tIn = window.setTimeout(() => {
        transitionLockedRef.current = false;
        setPhaseTransition({
          stage: 'in',
          ...meta,
        });

        const tDone = window.setTimeout(() => {
          setPhaseTransition((prev) => ({ ...prev, stage: 'idle' }));
        }, 420);
        transitionTimersRef.current.push(tDone);
      }, 360);
      transitionTimersRef.current.push(tIn);
    }, 310);

    transitionTimersRef.current.push(tHold);
  };

  // Check saved progress and persistent gallery unlocks on mount
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('saber_mortal_11_save_v1');
      if (raw) {
        setHasSavedGame(true);
      }
      const rawGallery = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (rawGallery) {
        const parsed: GallerySaveState = JSON.parse(rawGallery);
        if (Array.isArray(parsed.unlockedChars) && parsed.unlockedChars.length > 0) {
          setGalleryUnlockedChars(
            Array.from(new Set(['mateo', 'monokuma', ...parsed.unlockedChars]))
          );
        }
        if (Array.isArray(parsed.seenExecutions)) {
          setGallerySeenExecutions(parsed.seenExecutions);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist gallery unlocks cleanly across sessions
  useEffect(() => {
    try {
      const payload: GallerySaveState = {
        unlockedChars: galleryUnlockedChars,
        seenExecutions: gallerySeenExecutions,
      };
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [galleryUnlockedChars, gallerySeenExecutions]);

  const unlockGalleryChar = (charId: CharacterId | undefined | null) => {
    if (!charId || charId === 'narrador') return;
    setGalleryUnlockedChars((prev) =>
      prev.includes(charId) ? prev : [...prev, charId]
    );
  };

  const markExecutionSeen = (chId: string) => {
    setGallerySeenExecutions((prev) =>
      prev.includes(chId) ? prev : [...prev, chId]
    );
  };

  // Persist progress whenever chapter or phase state changes during play
  useEffect(() => {
    if (screen !== 'game') return;
    try {
      const payload: SaveState = {
        chapterIdx,
        phase,
        bonds,
        foundEasterEggs,
        collectedBullets,
        inspectedHotspots,
        alibiDone,
        trialStepIdx,
        dialogueIdx,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setHasSavedGame(true);
    } catch {
      // ignore
    }
  }, [
    screen,
    chapterIdx,
    phase,
    bonds,
    foundEasterEggs,
    collectedBullets,
    inspectedHotspots,
    alibiDone,
    trialStepIdx,
    dialogueIdx,
  ]);

  // Compute deceased students up through current chapter
  const deadIds = useMemo<CharacterId[]>(() => {
    const dead = new Set<CharacterId>();
    for (let i = 0; i <= chapterIdx; i++) {
      const ch = CHAPTERS[i];
      if (i < chapterIdx) {
        ch.victimIds.forEach((v) => dead.add(v));
        if (ch.culpritId) dead.add(ch.culpritId);
      } else {
        // In current chapter: victims are dead once body_discovery/investigation/trial begins, culprit dies after trial
        if (
          phase === 'body_discovery' ||
          phase === 'investigation' ||
          phase === 'alibi_puzzle' ||
          phase === 'trial' ||
          phase === 'outro'
        ) {
          ch.victimIds.forEach((v) => dead.add(v));
        }
        if (phase === 'outro' && ch.culpritId) {
          dead.add(ch.culpritId);
        }
      }
    }
    return Array.from(dead);
  }, [chapterIdx, phase]);

  const initChapter = (
    idx: number,
    startPhase: ChapterPhase = 'intro',
    carryBullets: TruthBullet[] = []
  ) => {
    const target = CHAPTERS[idx];
    const mergedBullets = [...target.initialBullets];
    carryBullets.forEach((cb) => {
      if (!mergedBullets.some((b) => b.id === cb.id)) {
        mergedBullets.push(cb);
      }
    });
    // Direct jump to trial must still include the chapter's Alibi Puzzle reward bullet
    if (
      startPhase === 'trial' &&
      target.alibiPuzzle &&
      !mergedBullets.some((b) => b.id === target.alibiPuzzle!.rewardBullet.id)
    ) {
      mergedBullets.push(target.alibiPuzzle.rewardBullet);
    }
    setChapterIdx(idx);
    setPhase(startPhase);
    setDialogueIdx(0);
    setFreeTimeLeft(2);
    setSelectedSocialChar(null);
    setSocialMessage(null);
    setCollectedBullets(mergedBullets);
    setInspectedHotspots([]);
    setHotspotDialogue(null);
    setAlibiDone(!target.alibiPuzzle || startPhase === 'trial');
    setTrialStepIdx(0);
    setTrialSubDialogue(null);
    setTrialSubIdx(0);
    setInfluence(100);
    setTrialNotice(null);
    setScreen('game');
  };

  const handleContinueGame = () => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('saber_mortal_11_save_v1');
      if (!raw) {
        initChapter(0, 'intro');
        return;
      }
      const saved: SaveState = JSON.parse(raw);
      const safeChapterIdx = Math.max(
        0,
        Math.min(saved.chapterIdx || 0, CHAPTERS.length - 1)
      );
      const target = CHAPTERS[safeChapterIdx];
      const safePhase: ChapterPhase = saved.phase || 'intro';
      setBonds(saved.bonds || {});
      setFoundEasterEggs(saved.foundEasterEggs || []);
      initChapter(safeChapterIdx, safePhase, saved.collectedBullets || []);
      if (saved.inspectedHotspots) {
        setInspectedHotspots(saved.inspectedHotspots);
      }
      if (typeof saved.alibiDone === 'boolean') {
        setAlibiDone(saved.alibiDone || safePhase === 'trial');
      }
      if (typeof saved.trialStepIdx === 'number' && target.trialSteps.length > 0) {
        setTrialStepIdx(
          Math.max(0, Math.min(saved.trialStepIdx, target.trialSteps.length - 1))
        );
      }
      if (typeof saved.dialogueIdx === 'number') {
        setDialogueIdx(Math.max(0, saved.dialogueIdx));
      }
    } catch {
      initChapter(0, 'intro');
    }
  };

  const returnToTitle = () => {
    sfx.click();
    runPhaseTransition(
      {
        label: 'MENÚ PRINCIPAL',
        sublabel: 'Danganronpa: Saber Mortal 11°',
        accent: 'cyan',
      },
      () => {
        ost.stop();
        voiceEngine.stop();
        setPadOpen(false);
        setPreviewExecution(null);
        setScreen('title');
      }
    );
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    sfx.muted = nextMuted;
    ost.setMuted(nextMuted);
    voiceEngine.setMuted(nextMuted);
    setMuted(nextMuted);
  };

  // Drive dynamic full-game OST soundtrack cleanly per screen, chapter phase, and trial mechanic
  useEffect(() => {
    if (previewExecution) return;
    if (screen === 'title') {
      ost.playSceneTrack('title');
      return;
    }

    if (chapter.id === 'epilogue') {
      ost.playSceneTrack('epilogue');
      return;
    }

    if (phase === 'trial') {
      if (trialSubDialogue) {
        ost.playSceneTrack('trial_debate');
        return;
      }
      const step = chapter.trialSteps[trialStepIdx];
      if (!step) {
        ost.playSceneTrack('trial_debate');
        return;
      }
      if (step.type === 'forced_execution') {
        // ExecutionCinema takes full ownership of execution OST
        return;
      }
      if (step.type === 'debate_scrum') {
        ost.playSceneTrack('trial_scrum');
      } else if (
        step.type === 'closing_argument' ||
        step.type === 'argument_armament' ||
        step.type === 'culprit_vote'
      ) {
        ost.playSceneTrack('trial_climax');
      } else {
        ost.playSceneTrack('trial_debate');
      }
      return;
    }

    const phaseTrackMap: Record<ChapterPhase, OstTrackId> = {
      intro: 'daily_life',
      social: 'daily_life',
      body_discovery: 'body_discovery',
      investigation: 'investigation',
      alibi_puzzle: 'alibi_puzzle',
      trial: 'trial_debate',
      outro: 'daily_life',
    };
    ost.playSceneTrack(phaseTrackMap[phase]);
  }, [
    screen,
    chapter,
    phase,
    trialStepIdx,
    trialSubDialogue,
    previewExecution,
  ]);

  // Voice act active VN / Trial dialogue line automatically
  const activeDialogueLine: DialogueLine | null = (() => {
    if (screen !== 'game') return null;
    if (phase === 'intro') return chapter.introDialogue[dialogueIdx] || null;
    if (phase === 'body_discovery')
      return chapter.bodyDiscoveryDialogue?.[dialogueIdx] || null;
    if (phase === 'outro') return chapter.outroDialogue[dialogueIdx] || null;
    if (phase === 'trial') {
      if (trialSubDialogue) return trialSubDialogue[trialSubIdx] || null;
      const step = chapter.trialSteps[trialStepIdx];
      if (step?.type === 'dialogue') return step.lines[dialogueIdx] || null;
    }
    return null;
  })();

  const [isDialogueSpeaking, setIsDialogueSpeaking] = useState(false);

  useEffect(() => {
    if (activeDialogueLine) {
      unlockGalleryChar(activeDialogueLine.speaker);
      setIsDialogueSpeaking(activeDialogueLine.speaker !== 'narrador');
      ost.setDucked(true);
      const cancel = voiceEngine.speak(
        activeDialogueLine.speaker,
        activeDialogueLine.text,
        {
          onEnd: () => {
            setIsDialogueSpeaking(false);
            ost.setDucked(false);
          },
        }
      );
      return () => {
        cancel();
        setIsDialogueSpeaking(false);
        ost.setDucked(false);
      };
    } else {
      setIsDialogueSpeaking(false);
      ost.setDucked(false);
    }
    return () => {
      voiceEngine.stop();
    };
  }, [activeDialogueLine?.speaker, activeDialogueLine?.text]);

  useEffect(() => {
    if (screen !== 'game') return;
    if (selectedSocialChar) unlockGalleryChar(selectedSocialChar);
  }, [screen, selectedSocialChar]);

  useEffect(() => {
    if (screen !== 'game') return;
    if (hotspotDialogue?.[0]?.speaker) {
      unlockGalleryChar(hotspotDialogue[0].speaker);
    }
  }, [screen, hotspotDialogue]);

  useEffect(() => {
    if (screen !== 'game' || phase !== 'trial') return;
    const step = chapter.trialSteps[trialStepIdx];
    if (!step) return;
    if (step.type === 'nonstop_debate') {
      step.lines.forEach((l) => unlockGalleryChar(l.speaker));
    } else if (step.type === 'mass_panic') {
      step.panels.forEach((p) => unlockGalleryChar(p.speaker));
    } else if (step.type === 'debate_scrum') {
      step.leftTeam.forEach((id) => unlockGalleryChar(id));
      step.rightTeam.forEach((id) => unlockGalleryChar(id));
      step.pairs.forEach((p) => {
        unlockGalleryChar(p.opponentSpeaker);
        unlockGalleryChar(p.allySpeaker);
      });
    } else if (step.type === 'rebuttal_showdown') {
      unlockGalleryChar(step.opponent);
    } else if (step.type === 'argument_armament') {
      unlockGalleryChar(step.culprit);
    } else if (step.type === 'forced_execution') {
      unlockGalleryChar(step.targetId);
    }
  }, [screen, phase, chapter, trialStepIdx]);

  const handleAdvanceChapter = () => {
    if (chapterIdx + 1 < CHAPTERS.length) {
      const nextChapter = CHAPTERS[chapterIdx + 1];
      // Chapter 7 continues the final trial directly using all clues discovered in Chapter 6
      const carry =
        chapter.id === 'ch6' && nextChapter.id === 'ch7'
          ? collectedBullets
          : [];
      runPhaseTransition(getPhaseTransitionMeta('intro', nextChapter), () => {
        ost.stop();
        initChapter(chapterIdx + 1, 'intro', carry);
      });
    } else {
      returnToTitle();
    }
  };

  // --- DIALOGUE RENDERER (16:9 Horizontal Widescreen VN Stage) ---
  const renderDialogueStage = (
    lines: DialogueLine[],
    idx: number,
    onNext: () => void,
    defaultBg: keyof typeof BACKGROUNDS = 'exterior'
  ) => {
    const line = lines[idx];
    if (!line) return null;
    const bgKey = line.background || defaultBg;
    const speakerProfile =
      line.speaker !== 'narrador'
        ? CHARACTERS[line.speaker as Exclude<keyof typeof CHARACTERS, never>]
        : null;

    return (
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl dr-vn-stage flex flex-col justify-between">
        {/* Background Image + Contrast Scrim */}
        <img
          src={BACKGROUNDS[bgKey]}
          alt="Escenario del ICFES"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/35" />

        {/* Top Location Tag */}
        <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="px-3 py-1 rounded-lg bg-zinc-950/85 border border-zinc-700/80 text-[11px] sm:text-xs font-semibold text-zinc-200 truncate max-w-[75%]">
            {line.location || chapter.subtitle}
          </div>
          <div className="text-[11px] sm:text-xs font-mono-tabular text-zinc-400 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 shrink-0">
            {idx + 1} / {lines.length}
          </div>
        </div>

        {/* Center Character Sprite */}
        <div className="relative z-10 flex-1 min-h-0 flex items-end justify-center px-4 sm:px-6 overflow-hidden">
          {line.speaker !== 'narrador' && (
            <div
              key={`${line.speaker}-${line.expression || 'neutral'}-${line.monokumaPose || 'normal'}`}
              className="dr-vn-sprite flex items-end justify-center animate-dr-sprite-enter"
            >
              <CharacterSprite
                characterId={line.speaker}
                expression={line.expression || 'neutral'}
                monokumaPose={line.monokumaPose || 'normal'}
                size="xl"
                isSpeaking={isDialogueSpeaking}
              />
            </div>
          )}
        </div>

        {/* Bottom VN Dialogue Box */}
        <div
          key={`dlg-${idx}`}
          className="relative z-10 m-2.5 sm:m-4 md:m-5 p-3.5 sm:p-5 rounded-xl bg-zinc-950/95 border border-zinc-700 shadow-2xl animate-dr-dialogue-enter"
        >
          <div className="flex items-center justify-between gap-4 mb-1 sm:mb-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span
                className="font-display font-extrabold text-lg sm:text-xl tracking-wide"
                style={{
                  color: speakerProfile?.signatureColor || '#a1a1aa',
                }}
              >
                {speakerProfile ? speakerProfile.name : 'Narrador'}
              </span>
              {speakerProfile && (
                <span className="text-[11px] sm:text-xs text-zinc-400">
                  · {speakerProfile.ultimate}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-zinc-100 leading-relaxed min-h-10 sm:min-h-12">
            {line.text}
          </p>

          <div className="mt-2.5 sm:mt-4 flex justify-end">
            <button
              onClick={() => {
                sfx.click();
                onNext();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-zinc-950 font-display font-extrabold text-base rounded-lg transition-all cursor-pointer"
            >
              {idx + 1 < lines.length ? 'Siguiente' : 'Continuar'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- DAMAGE HANDLER IN TRIAL ---
  const handleTrialDamage = () => {
    const next = influenceRef.current - 20;
    if (next <= 0) {
      influenceRef.current = 100;
      setInfluence(100);
      setTrialNotice(
        '¡Influencia agotada! Monokuma te penalizó con una advertencia y restauró tu barra al 100%.'
      );
      if (trialNoticeTimerRef.current !== null) {
        window.clearTimeout(trialNoticeTimerRef.current);
      }
      trialNoticeTimerRef.current = window.setTimeout(() => {
        setTrialNotice(null);
      }, 4200);
    } else {
      influenceRef.current = next;
      setInfluence(next);
    }
  };

  // --- TRIAL STEP RENDERER ---
  const renderTrial = () => {
    if (trialSubDialogue) {
      return renderDialogueStage(
        trialSubDialogue,
        trialSubIdx,
        () => {
          if (trialSubIdx + 1 < trialSubDialogue.length) {
            setTrialSubIdx((i) => i + 1);
          } else {
            setTrialSubDialogue(null);
            setTrialSubIdx(0);
            if (trialStepIdx + 1 < chapter.trialSteps.length) {
              setTrialStepIdx((s) => s + 1);
            } else {
              runPhaseTransition(
                getPhaseTransitionMeta('outro', chapter),
                () => {
                  setPhase('outro');
                  setDialogueIdx(0);
                }
              );
            }
          }
        },
        'courtroom'
      );
    }

    const step = chapter.trialSteps[trialStepIdx];
    if (!step) {
      return null;
    }

    const advanceAfterStep = (afterDialogue?: DialogueLine[]) => {
      if (afterDialogue && afterDialogue.length > 0) {
        setTrialSubDialogue(afterDialogue);
        setTrialSubIdx(0);
      } else if (trialStepIdx + 1 < chapter.trialSteps.length) {
        setTrialStepIdx((s) => s + 1);
      } else {
        runPhaseTransition(getPhaseTransitionMeta('outro', chapter), () => {
          setPhase('outro');
          setDialogueIdx(0);
        });
      }
    };

    return (
      <div className="space-y-4">
        {/* Trial Influence HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3">
            <Gavel className="w-5 h-5 text-rose-400" />
            <span className="font-display font-bold text-lg text-white">
              Juicio Escolar · {chapter.numberLabel}
            </span>
            <span className="text-xs font-mono-tabular text-zinc-400">
              Fase {trialStepIdx + 1}/{chapter.trialSteps.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Influencia en el Juicio</span>
            <div className="w-32 h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${influence}%` }}
              />
            </div>
            <span className="text-xs font-mono-tabular font-bold text-cyan-300">
              {influence}%
            </span>
          </div>
        </div>

        {/* Penalty / Recovery Toast */}
        {trialNotice && (
          <div className="px-4 py-2.5 rounded-xl bg-rose-950/70 border border-rose-500 text-xs font-bold text-rose-200 flex items-center justify-between gap-3">
            <span>{trialNotice}</span>
            <button
              onClick={() => setTrialNotice(null)}
              className="text-rose-300 hover:text-white cursor-pointer shrink-0"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Active V3 Mechanic */}
        {step.type === 'dialogue' &&
          renderDialogueStage(
            step.lines,
            dialogueIdx,
            () => {
              if (dialogueIdx + 1 < step.lines.length) {
                setDialogueIdx((d) => d + 1);
              } else {
                setDialogueIdx(0);
                advanceAfterStep();
              }
            },
            'courtroom'
          )}

        {step.type === 'nonstop_debate' && (
          <NonStopDebate
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            bullets={collectedBullets}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'mass_panic' && (
          <MassPanicDebate
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            bullets={collectedBullets}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'debate_scrum' && (
          <DebateScrum
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'hangmans_gambit' && (
          <HangmansGambitV3
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'psyche_taxi' && (
          <PsycheTaxi
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'mind_mine' && (
          <MindMine
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'rebuttal_showdown' && (
          <RebuttalShowdown
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            bullets={collectedBullets}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'closing_argument' && (
          <ClosingArgument
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'argument_armament' && (
          <ArgumentArmament
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onSuccess={(dialogue) => advanceAfterStep(dialogue)}
          />
        )}

        {step.type === 'culprit_vote' && (
          <CulpritVote
            key={`${chapter.id}-${trialStepIdx}`}
            step={step}
            onDamage={handleTrialDamage}
            onExecutionViewed={() => markExecutionSeen(chapter.id)}
            onComplete={() => advanceAfterStep()}
          />
        )}

        {step.type === 'forced_execution' && (
          <ExecutionCinema
            key={`${chapter.id}-${trialStepIdx}`}
            culpritId={step.targetId}
            executionTitle={step.executionTitle}
            narration={step.executionNarration}
            survives={step.survives}
            onViewed={() => markExecutionSeen(chapter.id)}
            finishLabel="Despertar en el Sótano Secreto"
            onFinish={() => advanceAfterStep(step.afterDialogue)}
          />
        )}
      </div>
    );
  };

  // --- TITLE SCREEN ---
  if (screen === 'title') {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
        {/* Hero Key Art Banner */}
        <div className="relative overflow-hidden border-b border-zinc-800">
          <img
            src={BACKGROUNDS.title}
            alt="Danganronpa Saber Mortal 11 ICFES Colombia"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/60" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="landscape:col-span-7 md:col-span-7 space-y-3 sm:space-y-4">
              <div className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-cyan-400">
                Fanganronpa Colombiano · Sede Nacional del ICFES Bogotá
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[0.95] text-white text-balance">
                Danganronpa: Saber Mortal 11°
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                16 Estudiantes Definitivos de toda Colombia atrapados bajo el mando de Monokuma V3. Asesinatos hasta el Capítulo 5, investigación de la Mente Maestra y juicio contra Monokuma en el Capítulo 6, y gran final en el Capítulo 7 con todas las mecánicas V3 y el <strong className="text-cyan-300">Alibi Puzzle</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    sfx.click();
                    runPhaseTransition(
                      getPhaseTransitionMeta('intro', CHAPTERS[0]),
                      () => {
                        setBonds({});
                        setFoundEasterEggs([]);
                        initChapter(0, 'intro');
                      }
                    );
                  }}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-lg sm:text-xl rounded-xl transition-colors cursor-pointer"
                >
                  Iniciar Nueva Partida
                </button>

                {hasSavedGame && (
                  <button
                    onClick={() => {
                      sfx.click();
                      runPhaseTransition(
                        {
                          label: 'CONTINUANDO PARTIDA',
                          sublabel: 'Cargando progreso en el ICFES',
                          accent: 'cyan',
                        },
                        handleContinueGame
                      );
                    }}
                    className="px-5 sm:px-6 py-3 sm:py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-display font-bold text-lg sm:text-xl rounded-xl transition-colors cursor-pointer"
                  >
                    Continuar Partida
                  </button>
                )}

                <button
                  onClick={() => {
                    sfx.click();
                    setGalleryOpen(true);
                  }}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-400/60 text-amber-300 font-display font-bold text-lg sm:text-xl rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Images className="w-5 h-5" />
                  Galería
                </button>

                <PWAInstallButton variant="title" />

                <button
                  onClick={toggleMute}
                  className="px-4 py-3 sm:py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-display font-bold text-base rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
                  aria-label={muted ? 'Activar OST y sonido' : 'Silenciar OST y sonido'}
                >
                  {muted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-400" />
                      OST Silenciado
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 text-cyan-400" />
                      OST Activo
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="landscape:col-span-5 md:col-span-5 flex flex-col items-center">
              <CharacterSprite
                characterId="monokuma"
                monokumaPose="puhuhu"
                size="lg"
                className="sm:w-72 sm:h-96"
              />
              <div className="mt-2 text-xs text-zinc-400 text-center">
                Monokuma V3 · Director Supremo del Examen Mortal
              </div>
            </div>
          </div>
        </div>

        {/* Chapter & Direct Jump Selector */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                Capítulos de la Campaña
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Juega en orden cronológico o entra directamente a cualquier capítulo, su Alibi Puzzle o su Juicio V3.
              </p>
            </div>
            <div className="text-xs text-zinc-400 font-mono-tabular">
              16 Estudiantes · Prólogo + 7 Capítulos + Epílogo
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {CHAPTERS.map((ch, idx) => (
              <div
                key={ch.id}
                className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
                    <span>{ch.numberLabel}</span>
                    {ch.victimIds.length === 2 && (
                      <span className="text-rose-400">2 Víctimas · 1 Asesino</span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{ch.subtitle}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      sfx.click();
                      runPhaseTransition(
                        getPhaseTransitionMeta('intro', ch),
                        () => initChapter(idx, 'intro')
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-400 hover:text-zinc-950 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Jugar Capítulo
                  </button>
                  {ch.alibiPuzzle && (
                    <button
                      onClick={() => {
                        sfx.click();
                        runPhaseTransition(
                          getPhaseTransitionMeta('alibi_puzzle', ch),
                          () => initChapter(idx, 'alibi_puzzle')
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-cyan-500/40 hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
                    >
                      Alibi Puzzle
                    </button>
                  )}
                  {ch.trialSteps.length > 0 && (
                    <button
                      onClick={() => {
                        sfx.click();
                        runPhaseTransition(
                          getPhaseTransitionMeta('trial', ch),
                          () => initChapter(idx, 'trial')
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-rose-500/40 hover:bg-rose-500/20 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
                    >
                      Ir al Juicio
                    </button>
                  )}
                  {(() => {
                    const voteStep = ch.trialSteps.find(
                      (s): s is CulpritVoteStep => s.type === 'culprit_vote'
                    );
                    const forcedStep = ch.trialSteps.find(
                      (s): s is ForcedExecutionStep => s.type === 'forced_execution'
                    );
                    const execInfo = voteStep
                      ? {
                          chapterId: ch.id,
                          targetId: voteStep.correctCulpritId,
                          executionTitle: voteStep.executionTitle,
                          executionNarration: voteStep.executionNarration,
                          survives: false,
                        }
                      : forcedStep
                      ? {
                          chapterId: ch.id,
                          targetId: forcedStep.targetId,
                          executionTitle: forcedStep.executionTitle,
                          executionNarration: forcedStep.executionNarration,
                          survives: forcedStep.survives,
                        }
                      : null;

                    if (!execInfo) return null;
                    return (
                      <button
                        onClick={() => {
                          sfx.gavel();
                          setPreviewExecution(execInfo);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/60 hover:bg-rose-600 text-xs font-bold text-rose-200 hover:text-white transition-colors cursor-pointer"
                      >
                        Ver Ejecución
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fullscreen Animated Execution Cinema Modal */}
        {previewExecution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl">
              <ExecutionCinema
                culpritId={previewExecution.targetId}
                executionTitle={previewExecution.executionTitle}
                narration={previewExecution.executionNarration}
                survives={previewExecution.survives}
                onViewed={() => markExecutionSeen(previewExecution.chapterId)}
                finishLabel="Cerrar Cinema de Ejecución"
                onFinish={() => setPreviewExecution(null)}
              />
            </div>
          </div>
        )}

        <GalleryModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          unlockedChars={galleryUnlockedChars}
          seenExecutions={gallerySeenExecutions}
        />

        <OfflineIndicator />
        <PhaseTransitionOverlay state={phaseTransition} />
      </div>
    );
  }

  // --- MAIN IN-GAME VIEWPORT ---
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      {/* 3-Zone Adaptive Top Header */}
      <header className="flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-5 py-2.5 sm:py-3 bg-zinc-900 border-b border-zinc-800">
        <button
          onClick={returnToTitle}
          className="font-display font-extrabold text-base sm:text-xl tracking-tight text-white hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Saber Mortal 11°</span>
        </button>

        <nav className="hidden landscape:flex md:flex items-center gap-3 lg:gap-5 text-xs font-semibold text-zinc-400 min-w-0">
          <span className="text-white truncate max-w-[180px] lg:max-w-none">
            {chapter.numberLabel}: {chapter.title}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 uppercase whitespace-nowrap shrink-0">
            {phase === 'intro' &&
              (chapter.id === 'prologue'
                ? 'Prólogo'
                : chapter.id === 'epilogue'
                ? 'Epílogo'
                : 'Vida Diaria')}
            {phase === 'social' && 'Vida Social'}
            {phase === 'body_discovery' && '¡Cadáver Descubierto!'}
            {phase === 'investigation' && 'Investigación'}
            {phase === 'alibi_puzzle' && 'Alibi Puzzle'}
            {phase === 'trial' && 'Juicio Escolar V3'}
            {phase === 'outro' && 'Cierre'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular whitespace-nowrap shrink-0">
            Vivos: {STUDENT_IDS.length - deadIds.length}/16
          </span>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton variant="header" />
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
            aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              sfx.click();
              setPadOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            ICFES-Pad
          </button>
        </div>
      </header>

      {/* Portrait Mobile Status Strip */}
      <div className="flex landscape:hidden md:hidden items-center justify-between gap-2 px-3 py-1.5 bg-zinc-900/70 border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-300">
        <span className="truncate text-white">
          {chapter.numberLabel} ·{' '}
          <span className="text-cyan-400 uppercase">
            {phase === 'intro' &&
              (chapter.id === 'prologue'
                ? 'Prólogo'
                : chapter.id === 'epilogue'
                ? 'Epílogo'
                : 'Vida Diaria')}
            {phase === 'social' && 'Vida Social'}
            {phase === 'body_discovery' && '¡Cadáver!'}
            {phase === 'investigation' && 'Investigación'}
            {phase === 'alibi_puzzle' && 'Alibi Puzzle'}
            {phase === 'trial' && 'Juicio V3'}
            {phase === 'outro' && 'Cierre'}
          </span>
        </span>
        <span className="font-mono-tabular text-zinc-400 shrink-0">
          Vivos: {STUDENT_IDS.length - deadIds.length}/16
        </span>
      </div>

      {/* Easter Egg Toast */}
      {eggBanner && (
        <div className="max-w-5xl w-full mx-auto mt-4 px-5">
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-400 text-amber-200 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{eggBanner}</span>
            </div>
            <button
              onClick={() => setEggBanner(null)}
              className="text-xs font-bold text-amber-300 hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Main Orientation-Adaptive Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* PHASE: INTRO DIALOGUE */}
        {phase === 'intro' &&
          renderDialogueStage(
            chapter.introDialogue,
            dialogueIdx,
            () => {
              if (dialogueIdx + 1 < chapter.introDialogue.length) {
                setDialogueIdx((d) => d + 1);
              } else {
                if (chapter.id === 'prologue' || chapter.id === 'epilogue') {
                  if (chapter.outroDialogue.length > 0) {
                    runPhaseTransition(
                      getPhaseTransitionMeta('outro', chapter),
                      () => {
                        setDialogueIdx(0);
                        setPhase('outro');
                      }
                    );
                  } else {
                    handleAdvanceChapter();
                  }
                } else if (chapter.id === 'ch7') {
                  // Chapter 7 continues the final trial directly with Chapter 6 clues
                  runPhaseTransition(
                    getPhaseTransitionMeta('trial', chapter),
                    () => {
                      setDialogueIdx(0);
                      setPhase('trial');
                      setTrialStepIdx(0);
                    }
                  );
                } else {
                  runPhaseTransition(
                    getPhaseTransitionMeta('social', chapter),
                    () => {
                      setDialogueIdx(0);
                      setPhase('social');
                    }
                  );
                }
              }
            },
            chapter.id === 'epilogue' ? 'exterior' : 'cafeteria'
          )}

        {/* PHASE: VIDA SOCIAL (PORTRAIT & LANDSCAPE ADAPTIVE FREE TIME) */}
        {phase === 'social' && (
          <div className="space-y-4">
            <div className="px-4 sm:px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Vida Social · Tiempo Libre en el ICFES
                </div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  Conversa con tus compañeros · Turnos:{' '}
                  <strong className="text-cyan-300 font-mono-tabular">
                    {freeTimeLeft}
                  </strong>
                </h2>
              </div>
              <button
                onClick={() => {
                  if (
                    chapter.bodyDiscoveryDialogue &&
                    chapter.bodyDiscoveryDialogue.length > 0
                  ) {
                    sfx.puhuhu();
                    runPhaseTransition(
                      getPhaseTransitionMeta('body_discovery', chapter),
                      () => {
                        setDialogueIdx(0);
                        setPhase('body_discovery');
                      }
                    );
                  } else {
                    sfx.click();
                    runPhaseTransition(
                      getPhaseTransitionMeta('investigation', chapter),
                      () => {
                        setDialogueIdx(0);
                        setPhase('investigation');
                      }
                    );
                  }
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display font-extrabold text-sm sm:text-base rounded-xl transition-colors cursor-pointer"
              >
                {chapter.bodyDiscoveryDialogue &&
                chapter.bodyDiscoveryDialogue.length > 0
                  ? 'Avanzar al Día Siguiente'
                  : 'Ir a la Investigación'}
              </button>
            </div>

            <div className="grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4">
              <div className="landscape:col-span-5 md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {chapter.socialAvailableChars.map((id) => {
                  const char =
                    CHARACTERS[id as Exclude<keyof typeof CHARACTERS, never>];
                  const active = selectedSocialChar === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        sfx.click();
                        setSelectedSocialChar(id);
                        setSocialMessage(char.freeTimeLines.prompt);
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-950/40 border-emerald-400'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <CharacterSprite
                        characterId={id}
                        expression="happy"
                        size="sm"
                      />
                      <span className="mt-2 font-bold text-sm text-white">
                        {char.shortName}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Vínculo {bonds[id] || 0}/3
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="landscape:col-span-7 md:col-span-7 p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-64 sm:min-h-72">
                {selectedSocialChar ? (
                  <>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <CharacterSprite
                        characterId={selectedSocialChar}
                        expression="happy"
                        size="md"
                      />
                      <div className="space-y-2">
                        <h3 className="font-display font-extrabold text-2xl text-white">
                          {
                            CHARACTERS[
                              selectedSocialChar as Exclude<
                                keyof typeof CHARACTERS,
                                never
                              >
                            ].name
                          }
                        </h3>
                        <p className="text-xs text-cyan-400 font-semibold">
                          {
                            CHARACTERS[
                              selectedSocialChar as Exclude<
                                keyof typeof CHARACTERS,
                                never
                              >
                            ].ultimate
                          }{' '}
                          ·{' '}
                          {
                            CHARACTERS[
                              selectedSocialChar as Exclude<
                                keyof typeof CHARACTERS,
                                never
                              >
                            ].city
                          }
                        </p>
                        <p className="text-sm text-zinc-200 bg-zinc-950 p-3.5 rounded-lg border border-zinc-800">
                          “{socialMessage}”
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
                      <button
                        disabled={freeTimeLeft <= 0}
                        onClick={() => {
                          sfx.consentAgree();
                          const char =
                            CHARACTERS[
                              selectedSocialChar as Exclude<
                                keyof typeof CHARACTERS,
                                never
                              >
                            ];
                          setBonds((prev) => ({
                            ...prev,
                            [selectedSocialChar]: Math.min(
                              3,
                              (prev[selectedSocialChar] || 0) + 1
                            ),
                          }));
                          setFreeTimeLeft((t) => Math.max(0, t - 1));
                          setSocialMessage(
                            `${char.freeTimeLines.reply} (Nota secreta: ${char.freeTimeLines.secretNote})`
                          );
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-sm rounded-lg cursor-pointer"
                      >
                        <Heart className="w-4 h-4" />
                        Conversar (+1 Vínculo)
                      </button>

                      <button
                        disabled={freeTimeLeft <= 0}
                        onClick={() => {
                          sfx.blueCapture();
                          const char =
                            CHARACTERS[
                              selectedSocialChar as Exclude<
                                keyof typeof CHARACTERS,
                                never
                              >
                            ];
                          setBonds((prev) => ({
                            ...prev,
                            [selectedSocialChar]: Math.min(
                              3,
                              (prev[selectedSocialChar] || 0) + 1
                            ),
                          }));
                          setFreeTimeLeft((t) => Math.max(0, t - 1));
                          setSocialMessage(char.freeTimeLines.giftReaction);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold text-sm rounded-lg cursor-pointer"
                      >
                        <Coffee className="w-4 h-4" />
                        Regalar Tinto y Pandebono (+1 Vínculo)
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-zinc-400 text-center">
                    Elige a un compañero a la izquierda para pasar tiempo libre antes de que suene el próximo anuncio de Monokuma.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHASE: BODY DISCOVERY ANNOUNCEMENT */}
        {phase === 'body_discovery' &&
          chapter.bodyDiscoveryDialogue &&
          renderDialogueStage(
            chapter.bodyDiscoveryDialogue,
            dialogueIdx,
            () => {
              if (dialogueIdx + 1 < chapter.bodyDiscoveryDialogue!.length) {
                setDialogueIdx((d) => d + 1);
              } else {
                sfx.gavel();
                runPhaseTransition(
                  getPhaseTransitionMeta('investigation', chapter),
                  () => {
                    setDialogueIdx(0);
                    setPhase('investigation');
                  }
                );
              }
            },
            'exterior'
          )}

        {/* PHASE: INVESTIGACIÓN (ORIENTATION-ADAPTIVE WORKSPACE) */}
        {phase === 'investigation' && (
          <div className="grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 items-start">
            {/* Control & Objective Column */}
            <div className="landscape:col-span-4 md:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Investigación · {chapter.numberLabel}
                  </div>
                  <h2 className="font-display font-extrabold text-2xl text-white mt-0.5">
                    {chapter.id === 'ch6'
                      ? 'Pistas sobre la Mente Maestra'
                      : 'Escena del Crimen y Coartadas'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Inspecciona los puntos clave, busca Easter Eggs y completa el Alibi Puzzle para desbloquear el Juicio Escolar.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {chapter.alibiPuzzle && !alibiDone && (
                    <button
                      onClick={() => {
                        sfx.click();
                        runPhaseTransition(
                          getPhaseTransitionMeta('alibi_puzzle', chapter),
                          () => setPhase('alibi_puzzle')
                        );
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-base rounded-xl transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      Iniciar Alibi Puzzle
                    </button>
                  )}

                  <button
                    disabled={!alibiDone}
                    onClick={() => {
                      sfx.gavel();
                      runPhaseTransition(
                        getPhaseTransitionMeta('trial', chapter),
                        () => {
                          setPhase('trial');
                          setTrialStepIdx(0);
                          setDialogueIdx(0);
                        }
                      );
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-display font-extrabold text-base rounded-xl transition-colors cursor-pointer"
                  >
                    <Gavel className="w-4 h-4" />
                    {alibiDone
                      ? '¡Comenzar Juicio Escolar!'
                      : 'Completa el Alibi Puzzle primero'}
                  </button>
                </div>
              </div>

              {/* Witness / Hotspot Commentary docked left */}
              {hotspotDialogue && hotspotDialogue[0] && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-cyan-500/40 flex items-start gap-3">
                  <CharacterSprite
                    characterId={hotspotDialogue[0].speaker}
                    expression={hotspotDialogue[0].expression || 'neutral'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-cyan-300">
                      {
                        CHARACTERS[
                          hotspotDialogue[0].speaker as Exclude<
                            keyof typeof CHARACTERS,
                            never
                          >
                        ]?.name
                      }
                    </div>
                    <p className="text-xs text-zinc-100 mt-1 leading-relaxed">
                      “{hotspotDialogue[0].text}”
                    </p>
                    <button
                      onClick={() => setHotspotDialogue(null)}
                      className="mt-2 text-[11px] font-bold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cerrar nota
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hotspots Grid */}
            <div className="landscape:col-span-8 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chapter.investigationHotspots.map((spot) => {
                const done = inspectedHotspots.includes(spot.id);
                return (
                  <button
                    key={spot.id}
                    onClick={() => {
                      sfx.click();
                      if (!done) {
                        setInspectedHotspots((prev) => [...prev, spot.id]);
                      }
                      if (spot.unlocksBulletId) {
                        const bullet = chapter.initialBullets.find(
                          (b) => b.id === spot.unlocksBulletId
                        );
                        if (
                          bullet &&
                          !collectedBullets.some((b) => b.id === bullet.id)
                        ) {
                          setCollectedBullets((prev) => [...prev, bullet]);
                        }
                      }
                      if (
                        spot.easterEggId &&
                        !foundEasterEggs.includes(spot.easterEggId)
                      ) {
                        const egg = EASTER_EGGS.find(
                          (e) => e.id === spot.easterEggId
                        );
                        setFoundEasterEggs((prev) => [
                          ...prev,
                          spot.easterEggId!,
                        ]);
                        if (egg) {
                          sfx.blueCapture();
                          setEggBanner(
                            `¡Easter Egg encontrado: ${egg.title}! (${egg.reference})`
                          );
                        }
                      }
                      setHotspotDialogue(spot.speakerComment);
                    }}
                    className={`text-left p-5 rounded-xl border transition-all cursor-pointer ${
                      done
                        ? 'bg-zinc-900/60 border-emerald-500/40'
                        : 'bg-zinc-900 border-zinc-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-300">
                        {spot.room}
                      </span>
                      <span className="text-zinc-400">
                        {done ? 'Inspeccionado' : 'Sin revisar'}
                      </span>
                    </div>
                    <div className="font-display font-bold text-xl text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                      {spot.label}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {spot.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE: ALIBI PUZZLE */}
        {phase === 'alibi_puzzle' && chapter.alibiPuzzle && (
          <AlibiPuzzle
            puzzle={chapter.alibiPuzzle}
            onComplete={() => {
              const reward = chapter.alibiPuzzle!.rewardBullet;
              runPhaseTransition(
                getPhaseTransitionMeta('investigation', chapter),
                () => {
                  setCollectedBullets((prev) =>
                    prev.some((b) => b.id === reward.id)
                      ? prev
                      : [...prev, reward]
                  );
                  setAlibiDone(true);
                  setPhase('investigation');
                }
              );
            }}
          />
        )}

        {/* PHASE: CLASS TRIAL (V3 MECHANICS) */}
        {phase === 'trial' && renderTrial()}

        {/* PHASE: OUTRO */}
        {phase === 'outro' && (
          <div className="space-y-4">
            {chapter.outroDialogue.length > 0 ? (
              renderDialogueStage(
                chapter.outroDialogue,
                dialogueIdx,
                () => {
                  if (dialogueIdx + 1 < chapter.outroDialogue.length) {
                    setDialogueIdx((d) => d + 1);
                  } else {
                    handleAdvanceChapter();
                  }
                },
                'exterior'
              )
            ) : (
              <div className="p-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-5">
                <h2 className="font-display font-extrabold text-4xl text-white">
                  ¡Campaña Completada!
                </h2>
                <p className="text-zinc-300 max-w-xl mx-auto">
                  Sobreviviste al Juego de Matanza en el ICFES de Colombia y descubriste{' '}
                  <strong>
                    {foundEasterEggs.length} de {EASTER_EGGS.length}
                  </strong>{' '}
                  Easter Eggs ocultos.
                </p>
                <button
                  onClick={returnToTitle}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-lg rounded-xl cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  Volver al Menú Principal
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ICFES-Pad Modal */}
      <IcfesPadModal
        open={padOpen}
        onClose={() => setPadOpen(false)}
        deadIds={deadIds}
        bonds={bonds}
        bullets={collectedBullets}
        foundEasterEggs={foundEasterEggs}
      />

      <OfflineIndicator />
      <PhaseTransitionOverlay state={phaseTransition} />
    </div>
  );
}
