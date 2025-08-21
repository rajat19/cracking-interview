import { Button } from "@/components/ui/button";
import { ITopicDifficulty } from "@/types/topic";
import { Variant } from "@/types/variant";

interface DifficultyFilterProps {
  difficultyFilter: ITopicDifficulty;
  onChangeDifficulty: (value: ITopicDifficulty) => void;
  variant: Variant;
}

const DifficultyFilter = ({ difficultyFilter, onChangeDifficulty, variant }: DifficultyFilterProps) => {
  const difficultyBtnSizeClass = variant === 'mobile' ? "text-xs px-2" : "text-xs px-2 lg:px-3";
  const difficulties: ITopicDifficulty[] = ['all', 'easy', 'medium', 'hard'];

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