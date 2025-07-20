export interface Topic {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  timeComplexity?: string;
  spaceComplexity?: string;
  description: string;
  content: string;
  examples?: string[];
  relatedTopics?: string[];
  isCompleted?: boolean;
  isBookmarked?: boolean;
}

export interface TopicCategory {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}