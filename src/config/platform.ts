export interface Platform {
  name: string;
  base: string;
  suffix: string;
  identifier: string;
  img: string;
}

export const PLATFORMS: Platform[] = [
  {
    name: 'Leetcode',
    base: 'https://leetcode.com/problems/',
    suffix: '/',
    identifier: 'leetcode',
    img: 'leetcode.svg',
  },
  {
    name: 'GeeksForGeeks',
    base: 'https://www.geeksforgeeks.org/',
    suffix: '/',
    identifier: 'gfg',
    img: 'gfg.svg',
  },
  {
    name: 'InterviewBit',
    base: 'https://www.interviewbit.com/problems/',
    suffix: '/',
    identifier: 'interviewbit',
    img: 'interviewbit.svg',
  },
  {
    name: 'Hackerrank',
    base: 'https://www.hackerrank.com/',
    suffix: '/',
    identifier: 'hackerrank',
    img: 'hackerrank.svg',
  },
  {
    name: 'Youtube',
    base: 'https://www.youtube.com/results?search_query=',
    suffix: '',
    identifier: 'title',
    img: 'youtube.svg',
  },
  {
    name: 'Metacareers',
    base: 'https://www.metacareers.com/profile/coding_practice_question/?problem_id=',
    suffix: '',
    identifier: 'metacareers',
    img: 'meta.svg',
  },
  {
    name: 'HelloInterview',
    base: 'https://www.hellointerview.com/learn/',
    suffix: '',
    identifier: 'hellointerview',
    img: 'hellointerview.svg',
  },
  {
    name: 'Refactoring Guru',
    base: 'https://refactoring.guru/design-patterns/',
    suffix: '',
    identifier: 'refactoring',
    img: 'refactoring.png',
  },
  {
    name: 'SourceMaking',
    base: 'https://sourcemaking.com/design_patterns/',
    suffix: '',
    identifier: 'sourcemaking',
    img: 'sourcemaking.png',
  },
  {
    name: 'Wikipedia',
    base: 'https://en.wikipedia.org/wiki/',
    suffix: '',
    identifier: 'wikipedia',
    img: 'wikipedia.svg',
  },
  {
    name: 'Scaler',
    base: 'https://www.scaler.com/topics/',
    suffix: '',
    identifier: 'scaler',
    img: 'scaler.png',
  },
  {
    name: 'Neetcode',
    base: 'https://neetcode.io/problems/',
    suffix: '',
    identifier: 'neetcode',
    img: 'neetcode.png',
  },
  {
    name: 'Coding Ninjas',
    base: 'https://www.naukri.com/code360/problems/',
    suffix: '',
    identifier: 'codingninjas',
    img: 'codingninjas.svg',
  }
];

export default PLATFORMS;
