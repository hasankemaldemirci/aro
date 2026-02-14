/**
 * @aro-context-marker
 * AI READABILITY NOTE: Centralized type definitions.
 */

export interface AROMetrics {
  hasReadme: boolean;
  readmeSize: number;
  hasSrc: boolean;
  hasConfig: number;
  largeFiles: number;
  blindSpots: string[];
}

export interface AROContext {
  projectName: string;
  version: string;
  framework: string;
  techStack: string[];
  entryPoints: string[];
  analyzedAt: string;
  metrics: AROMetrics;
  score: number;
  blindSpots: string[];
  structure: any;
}

export interface EnterpriseOptions {
  rate: number;
  interactions: number;
  threshold?: number;
  output?: string;
}

export interface ARODebt {
  docDebt: number;
  truncationDebt: number;
  structuralDebt: number;
  tokenWasteDebt: number;
  totalDebt: number;
  wastedHours: number;
}
