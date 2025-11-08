
import { AnalysisType } from './types';

export const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'Go', 'Rust'];

export const ANALYSIS_OPTIONS = [
  { 
    value: AnalysisType.SUGGEST, 
    label: 'Suggest Algorithm', 
    description: 'Based on the problem, suggest suitable algorithms and data structures. Provide a boilerplate implementation.' 
  },
  { 
    value: AnalysisType.DEBUG, 
    label: 'Find & Fix Bugs', 
    description: 'Analyze the code for logical errors, syntax issues, and edge cases. Provide a corrected version.' 
  },
  { 
    value: AnalysisType.OPTIMIZE, 
    label: 'Optimize Performance', 
    description: 'Improve the time and space complexity of the solution. Provide a more efficient implementation.' 
  },
  { 
    value: AnalysisType.EXPLAIN, 
    label: 'Explain Code', 
    description: 'Provide a detailed, line-by-line explanation of the provided code and its logic.' 
  },
];
