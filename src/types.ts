
export enum AnalysisType {
  DEBUG = 'debug',
  OPTIMIZE = 'optimize',
  SUGGEST = 'suggest',
  EXPLAIN = 'explain',
}

export type FeedbackStatus = 'pending' | 'correct' | 'incorrect' | 'complete';
