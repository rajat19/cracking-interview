import { ITopicDifficulty } from '@/types/topic';

export const DIFFICULTIES: ITopicDifficulty[] = ['all', 'easy', 'medium', 'hard'];

export const DIFFICULTY_CLASS_MAP: Record<Exclude<ITopicDifficulty, 'all'>, string> = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-error',
};

export default DIFFICULTIES;
