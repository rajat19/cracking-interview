'use client';

import { ITopicDifficulty } from '@/types/topic';
import { DIFFICULTY_CLASS_MAP } from '@/config/difficulty';

interface TopicDifficultyProps {
  difficulty: ITopicDifficulty;
}

const TopicDifficulty = ({ difficulty }: TopicDifficultyProps) => {
  if (difficulty === 'all') {
    return null;
  }

  return (
    <div
      className={`badge badge-dash ${DIFFICULTY_CLASS_MAP[difficulty as keyof typeof DIFFICULTY_CLASS_MAP]} rounded-md p-2 text-xs`}
    >
      {difficulty}
    </div>
  );
};

export default TopicDifficulty;
