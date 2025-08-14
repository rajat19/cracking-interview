import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types/topic";
import { Variant } from "@/types/variant";

interface DifficultyFilterProps {
    difficultyFilter: Difficulty;
    onChangeDifficulty: (value: Difficulty) => void;
    variant: Variant;
}

const DifficultyFilter = ({ difficultyFilter, onChangeDifficulty, variant }: DifficultyFilterProps) => {
    const difficultyBtnSizeClass = variant === 'mobile' ? "text-xs px-2" : "text-xs px-2 lg:px-3";
    const difficulties: Difficulty[] = ['all', 'easy', 'medium', 'hard'];

    return (
        <div className="flex gap-1 flex-wrap">
          {difficulties.map(difficulty => (
            <Button
              key={difficulty}
              variant={difficultyFilter === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => onChangeDifficulty(difficulty)}
              className={`difficulty-${difficulty} ${difficultyBtnSizeClass} capitalize`}
            >
              {difficulty}
            </Button>
          ))}
        </div>
      );
};

export default DifficultyFilter;