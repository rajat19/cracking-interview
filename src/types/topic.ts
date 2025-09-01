export type ITopicDifficulty = 'all' | 'easy' | 'medium' | 'hard';
export type ITopicCategory = 'dsa' | 'system-design' | 'behavioral' | 'ood' | 'design-pattern';

export interface ITopic {
  id: string;
  author?: string;
  title: string;
  difficulty: ITopicDifficulty;
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

  // Design pattern platform identifiers
  sourcemaking?: string;
  refactoring?: string;

  // Progress tracking
  isCompleted?: boolean;
  isBookmarked?: boolean;
  solutions?: Record<string, ISolutionEntry>;
}

export type ITopicList = Pick<
  ITopic,
  | 'id'
  | 'title'
  | 'difficulty'
  | 'timeComplexity'
  | 'spaceComplexity'
  | 'companies'
  | 'relatedTopics'
  | 'isBookmarked'
  | 'isCompleted'
>;

export interface ISolutionEntry {
  language: string;
  code: string;
}
