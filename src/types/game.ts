export type CharacterId =
  | 'mateo'
  | 'valentina'
  | 'sebastian'
  | 'camila'
  | 'andres'
  | 'lucia'
  | 'santiago'
  | 'sofia'
  | 'juanpablo'
  | 'isabela'
  | 'nicolas'
  | 'mariana'
  | 'esteban'
  | 'paula'
  | 'diego'
  | 'laura'
  | 'monokuma'
  | 'narrador';

export type Expression =
  | 'neutral'
  | 'happy'
  | 'worried'
  | 'shocked'
  | 'angry'
  | 'pointing';

export type MonokumaPose =
  | 'normal'
  | 'puhuhu'
  | 'angry'
  | 'shocked'
  | 'gavel';

export type ChapterId =
  | 'prologue'
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'ch5'
  | 'ch6'
  | 'ch7'
  | 'epilogue';

export type ChapterPhase =
  | 'intro'
  | 'social'
  | 'body_discovery'
  | 'investigation'
  | 'alibi_puzzle'
  | 'trial'
  | 'outro';

export interface CharacterVisualSpec {
  skin: string;
  hairColor: string;
  hairStyle:
    | 'spiky'
    | 'bob'
    | 'ponytail'
    | 'curly'
    | 'slick'
    | 'braids'
    | 'wavy'
    | 'short_part'
    | 'bun'
    | 'messy'
    | 'long_straight'
    | 'undercut';
  outfitPrimary: string;
  outfitSecondary: string;
  accent: string;
  accessory:
    | 'carriel'
    | 'glasses'
    | 'ruana'
    | 'flower'
    | 'hoodie'
    | 'accordion_pin'
    | 'labcoat'
    | 'camera'
    | 'scarf'
    | 'apron'
    | 'mask_pin'
    | 'visor'
    | 'hat_pin'
    | 'beret'
    | 'trench'
    | 'cipher_tie';
}

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  shortName: string;
  ultimate: string;
  city: string;
  region: string;
  signatureColor: string;
  bio: string;
  visual: CharacterVisualSpec;
  freeTimeLines: {
    prompt: string;
    reply: string;
    giftReaction: string;
    secretNote: string;
  };
}

export interface TruthBullet {
  id: string;
  title: string;
  summary: string;
  source: string;
  isAlibi?: boolean;
}

export interface EasterEgg {
  id: string;
  chapterId: ChapterId;
  title: string;
  location: string;
  description: string;
  reference: string;
}

export interface DialogueLine {
  speaker: CharacterId;
  expression?: Expression;
  monokumaPose?: MonokumaPose;
  text: string;
  location?: string;
  background?: 'exterior' | 'cafeteria' | 'courtroom' | 'title';
}

export interface InvestigationHotspot {
  id: string;
  room: string;
  label: string;
  description: string;
  speakerComment: DialogueLine[];
  unlocksBulletId?: string;
  easterEggId?: string;
}

export interface AlibiWord {
  id: string;
  text: string;
  isBlueImportant: boolean;
  lane: 0 | 1 | 2;
  speed: number;
}

export interface AlibiPuzzleData {
  id: string;
  witnessId: CharacterId;
  location: string;
  introText: string;
  contextHint: string;
  words: AlibiWord[];
  rewardBullet: TruthBullet;
}

// --- ALL DANGANRONPA V3 TRIAL MECHANICS ---

export interface NonStopLine {
  id: string;
  speaker: CharacterId;
  expression: Expression;
  monokumaPose?: MonokumaPose;
  text: string;
  /** Text highlighted inside the phrase as shootable */
  weakSpotText?: string;
  /** 'contradict' (yellow), 'consent' (blue V3 agree), or undefined */
  weakSpotType?: 'contradict' | 'consent';
  /** Truth bullet id that resolves this weak spot */
  correctBulletId?: string;
  /** V3 Perjury: optional lie bullet id if player switches to Lie Mode */
  lieBulletId?: string;
  /** White noise phrases crossing over this statement */
  whiteNoise?: string[];
  counterDialogue: DialogueLine[];
}

export interface NonStopDebateStep {
  type: 'nonstop_debate';
  title: string;
  subtitle: string;
  availableBulletIds: string[];
  allowLieMode?: boolean;
  lines: NonStopLine[];
}

export interface MassPanicSpeaker {
  speaker: CharacterId;
  expression: Expression;
  monokumaPose?: MonokumaPose;
  statement: string;
  weakSpotText?: string;
  isTarget: boolean;
}

export interface MassPanicStep {
  type: 'mass_panic';
  title: string;
  subtitle: string;
  availableBulletIds: string[];
  correctBulletId: string;
  panels: [MassPanicSpeaker, MassPanicSpeaker, MassPanicSpeaker];
  counterDialogue: DialogueLine[];
}

export interface ScrumPair {
  id: string;
  opponentSpeaker: CharacterId;
  opponentLine: string;
  topicKeyword: string;
  allySpeaker: CharacterId;
  allyLine: string;
}

export interface DebateScrumStep {
  type: 'debate_scrum';
  title: string;
  question: string;
  leftTeam: CharacterId[];
  rightTeam: CharacterId[];
  pairs: ScrumPair[];
  finalShout: string;
  afterDialogue: DialogueLine[];
}

export interface HangmansGambitStep {
  type: 'hangmans_gambit';
  title: string;
  question: string;
  answerWord: string;
  hint: string;
  afterDialogue: DialogueLine[];
}

export interface PsycheTaxiStage {
  promptPieces: string[];
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
}

export interface PsycheTaxiStep {
  type: 'psyche_taxi';
  title: string;
  subtitle: string;
  stages: PsycheTaxiStage[];
  afterDialogue: DialogueLine[];
}

export interface MindMineStep {
  type: 'mind_mine';
  title: string;
  question: string;
  hiddenLabel: string;
  iconType: 'tejo' | 'veneno' | 'laptop' | 'pendulo' | 'prensa' | 'grabadora' | 'llave_icfes';
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  afterDialogue: DialogueLine[];
}

export interface RebuttalLine {
  id: string;
  text: string;
  isWeakPoint: boolean;
}

export interface RebuttalShowdownStep {
  type: 'rebuttal_showdown';
  title: string;
  opponent: CharacterId;
  introQuote: string;
  availableBulletIds: string[];
  correctBulletId: string;
  lines: RebuttalLine[];
  counterDialogue: DialogueLine[];
}

export interface ClosingPanelSlot {
  slotNumber: number;
  captionBefore: string;
  correctPanelId: string;
}

export interface ClosingPanelOption {
  id: string;
  title: string;
  detail: string;
}

export interface ClosingArgumentStep {
  type: 'closing_argument';
  title: string;
  subtitle: string;
  slots: ClosingPanelSlot[];
  panelPool: ClosingPanelOption[];
  afterDialogue: DialogueLine[];
}

export interface ArgumentArmamentStep {
  type: 'argument_armament';
  title: string;
  culprit: CharacterId;
  denialQuotes: string[];
  finalTruthWords: [string, string, string, string];
  afterDialogue: DialogueLine[];
}

export interface CulpritVoteStep {
  type: 'culprit_vote';
  title: string;
  suspects: CharacterId[];
  correctCulpritId: CharacterId;
  executionTitle: string;
  executionNarration: string[];
}

export interface ForcedExecutionStep {
  type: 'forced_execution';
  title: string;
  targetId: CharacterId;
  executionTitle: string;
  executionNarration: string[];
  survives?: boolean;
  afterDialogue: DialogueLine[];
}

export interface TrialDialogueStep {
  type: 'dialogue';
  lines: DialogueLine[];
}

export type TrialStep =
  | TrialDialogueStep
  | NonStopDebateStep
  | MassPanicStep
  | DebateScrumStep
  | HangmansGambitStep
  | PsycheTaxiStep
  | MindMineStep
  | RebuttalShowdownStep
  | ClosingArgumentStep
  | ArgumentArmamentStep
  | CulpritVoteStep
  | ForcedExecutionStep;

export interface ChapterData {
  id: ChapterId;
  numberLabel: string;
  title: string;
  subtitle: string;
  motive: string;
  victimIds: CharacterId[];
  culpritId: CharacterId | null;
  introDialogue: DialogueLine[];
  bodyDiscoveryDialogue?: DialogueLine[];
  socialAvailableChars: CharacterId[];
  investigationHotspots: InvestigationHotspot[];
  alibiPuzzle?: AlibiPuzzleData;
  initialBullets: TruthBullet[];
  trialSteps: TrialStep[];
  outroDialogue: DialogueLine[];
}
