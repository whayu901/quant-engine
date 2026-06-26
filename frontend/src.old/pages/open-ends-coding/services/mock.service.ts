// Mock data service for OpenEndsCoding
import type { Response, Code } from '../types';

const RESPONSE_TEMPLATES = [
  "I prefer this product because it's convenient and easy to use",
  "The price is too high compared to competitors",
  "Quality is excellent but packaging needs improvement",
  "Customer service was very helpful and responsive",
  "Would recommend to friends and family",
  "Delivery was fast but product was damaged",
  "Great value for money, will buy again",
  "Not satisfied with the product performance",
  "Love the new features and design",
  "Difficult to understand the instructions",
];

const MARKETS = ["Indonesia", "Singapore", "Malaysia", "Thailand", "Philippines"];

const POSSIBLE_CODES = [
  { label: "Price", confidence: 0.9 },
  { label: "Quality", confidence: 0.85 },
  { label: "Service", confidence: 0.75 },
  { label: "Delivery", confidence: 0.8 },
  { label: "Features", confidence: 0.95 },
  { label: "Packaging", confidence: 0.7 },
  { label: "Value", confidence: 0.88 },
  { label: "Recommendation", confidence: 0.92 },
];

const MOCK_CODES: Code[] = [
  {
    id: 1,
    label: "Price",
    description: "Price-related mentions",
    count: 12543,
  },
  {
    id: 2,
    label: "Quality",
    description: "Product quality feedback",
    count: 10234,
  },
  {
    id: 3,
    label: "Service",
    description: "Customer service experiences",
    count: 8765,
  },
  {
    id: 4,
    label: "Delivery",
    description: "Delivery and shipping",
    count: 6543,
  },
  {
    id: 5,
    label: "Features",
    description: "Product features and functionality",
    count: 9876,
  },
  {
    id: 6,
    label: "Packaging",
    description: "Packaging feedback",
    count: 4321,
  },
  { id: 7, label: "Value", description: "Value for money", count: 7654 },
  {
    id: 8,
    label: "Recommendation",
    description: "Would recommend",
    count: 5432,
  },
];

/**
 * Generate massive mock response data
 * Currently generates 100,000 records - optimize with pagination if needed
 */
export function generateMockResponses(count: number = 100000): Response[] {
  return Array.from({ length: count }, (_, i) => {
    const numCodes = Math.floor(Math.random() * 3) + 1;
    const assignedCodes = [];

    for (let j = 0; j < numCodes; j++) {
      assignedCodes.push(
        POSSIBLE_CODES[Math.floor(Math.random() * POSSIBLE_CODES.length)]
      );
    }

    return {
      id: `resp_${i}`,
      respondent_id: `R${String(i + 1).padStart(6, "0")}`,
      text:
        RESPONSE_TEMPLATES[Math.floor(Math.random() * RESPONSE_TEMPLATES.length)] +
        ` [Extended response ${i}...]`,
      market: MARKETS[Math.floor(Math.random() * MARKETS.length)],
      date: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      codes: assignedCodes,
    };
  });
}

/**
 * Get mock codes
 */
export function getMockCodes(): Code[] {
  return [...MOCK_CODES];
}

/**
 * Get available markets
 */
export function getAvailableMarkets(): string[] {
  return [...MARKETS];
}
