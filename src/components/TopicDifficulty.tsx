const TopicDifficulty = ({ difficulty }: { difficulty: string }) => {
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