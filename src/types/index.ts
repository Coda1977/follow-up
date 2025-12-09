// Language types
export type Language = 'en' | 'he';

// Message types
export interface MessagePart {
  type: 'text';
  text: string;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
}

export interface StandardMessage {
  role: 'user' | 'assistant';
  content: string;
}

// API types
export interface ChatRequestBody {
  messages: UIMessage[];
}

// Summary types
export interface InterviewSummary {
  summary: string;
  keyThemes: string[];
  sentiment: 'positive' | 'mixed' | 'negative';
  specificPraise: string[];
  areasForImprovement: string[];
}

// Analysis types
export interface ThemeCount {
  theme: string;
  count: number;
}

export interface SentimentDistribution {
  positive: number;
  mixed: number;
  negative: number;
}

export interface CrossInterviewAnalysis {
  totalInterviews: number;
  totalWithSummary: number;
  topThemes: ThemeCount[];
  sentimentDistribution: SentimentDistribution;
}
