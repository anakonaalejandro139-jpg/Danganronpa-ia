import { CHAPTERS_PART_1 } from './chaptersPart1';
import { CHAPTERS_PART_2 } from './chaptersPart2';
import { ChapterData } from '../types/game';

export const CHAPTERS: ChapterData[] = [
  ...CHAPTERS_PART_1,
  ...CHAPTERS_PART_2,
];
