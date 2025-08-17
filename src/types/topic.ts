export type Difficulty = 'all' | "easy" | "medium" | "hard";

export interface Topic {
  id: string;
  title: string;
  difficulty: Difficulty;
  timeComplexity?: string;
  spaceComplexity?: string;
  description: string;
  content?: string;
  examples?: string[];
  relatedTopics?: string[];
  companies?: string[];

  // Platform identifiers
  leetcode?: string;
  gfg?: string;
  interviewbit?: string;
  hackerrank?: string;
  hellointerview?: string;
  metacareers?: string;

  // Progress tracking
  isCompleted?: boolean;
  isBookmarked?: boolean;
  solutions?: Record<string, { language: string; code: string; path: string }>;
}

export interface TopicCategory {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}