import { ITopicDifficulty } from "@/types/topic";

interface TopicDifficultyProps {
    difficulty: ITopicDifficulty;
}

const TopicDifficulty = ({ difficulty }: TopicDifficultyProps) => {
    const difficultyMap = {
        'easy': 'badge-success',
        'medium': 'badge-warning',
        'hard': 'badge-error',
    };

    return (
        <div className={`badge badge-dash ${difficultyMap[difficulty]} p-2 rounded-md text-xs`}>
            {difficulty}
        </div>
    );
};

export default TopicDifficulty;