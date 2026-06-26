// Client Dashboard types
export interface ThemeDataPoint {
  date: string;
  'Price Sensitivity': number;
  Quality: number;
  'Brand Trust': number;
  'User Experience': number;
  Innovation: number;
}

export interface MarketData {
  market: string;
  satisfaction: number;
  nps: number;
  retention: number;
  growth: number;
}

export interface SentimentData {
  name: 'Positive' | 'Neutral' | 'Negative';
  value: number;
  percentage: number;
}

export interface ConceptData {
  concept: string;
  appeal: number;
  uniqueness: number;
  believability: number;
  purchase_intent: number;
}

export interface ResponseData {
  id: string;
  respondent: string;
  market: string;
  sentiment: string;
  score: string;
  date: string;
}

export interface DashboardData {
  themeData: ThemeDataPoint[];
  marketData: MarketData[];
  sentimentData: SentimentData[];
  conceptData: ConceptData[];
  responses: ResponseData[];
}

export interface DashboardMetrics {
  totalResponses: string;
  totalResponsesChange: number;
  avgSatisfaction: string;
  avgSatisfactionChange: number;
  npsScore: string;
  npsScoreChange: number;
  responseRate: string;
  responseRateChange: number;
}

export interface DashboardFilters {
  selectedMarket: string;
  dateRange: string;
}

export type TabType = 'overview' | 'themes' | 'sentiment' | 'concepts' | 'data';

export interface TableColumn {
  key: string;
  label: string;
}
