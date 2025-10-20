'use client';

import { Button } from '@/components/ui/button';
import { ITopicDifficulty } from '@/types/topic';
import { Variant } from '@/types/variant';
import DIFFICULTIES from '@/config/difficulty';

interface DifficultyFilterProps {
  difficultyFilter: ITopicDifficulty;
  onChangeDifficulty: (value: ITopicDifficulty) => void;
  variant: Variant;
}

const DifficultyFilter = ({
  difficultyFilter,
  onChangeDifficulty,
  variant,
}: DifficultyFilterProps) => {
  const difficultyBtnSizeClass = variant === 'mobile' ? 'text-xs px-2' : 'text-xs px-2 lg:px-3';

  const getButtonVariant = (difficulty: ITopicDifficulty) => {
    const isSelected = difficultyFilter === difficulty;
    
    // For "all" button, use default primary color
    if (difficulty === 'all') {
      return isSelected ? 'default' : 'outline';
    }
    
    return 'outline';
  };

  const getSelectedClass = (difficulty: ITopicDifficulty) => {
    if (difficultyFilter !== difficulty || difficulty === 'all') {
      return '';
    }
    return 'selected-difficulty';
  };

  return (
    <div className="flex flex-wrap gap-1">
      {DIFFICULTIES.map(difficulty => (
        <Button
          key={difficulty}
          variant={getButtonVariant(difficulty)}
          size="sm"
          onClick={() => onChangeDifficulty(difficulty)}
          className={`difficulty-${difficulty} ${difficultyBtnSizeClass} capitalize ${getSelectedClass(difficulty)}`}
        >
          {difficulty}
        </Button>
      ))}
    </div>
  );
};

export default DifficultyFilter;
