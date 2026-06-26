// Types for OpenEndsCoding page

export interface CodeLabel {
  label: string;
  confidence: number;
}

export interface Response {
  id: string;
  respondent_id: string;
  text: string;
  market: string;
  date: string;
  codes: CodeLabel[];
}

export interface Code {
  id: number;
  label: string;
  description: string;
  count: number;
}

export interface AIProgress {
  current: number;
  total: number;
}

export interface CodeDistribution {
  label: string;
  count: number;
}

export interface MarketDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface FilterState {
  searchTerm: string;
  filterMarket: string;
  filterCode: string;
}
