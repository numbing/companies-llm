export interface Challenge {
  title: string;
  sections: Record<string, string[]>;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export type Company = Record<string, JsonValue> & {
  name?: string;
  domain?: string;
  address?: string;
  title?: string;
  description?: string;
  keywords?: JsonValue;
};

export interface Evaluation {
  fit: {
    score: number;
    verdict: string;
    rationale: string;
  };
  query: {
    answer: string;
    rationale: string;
  };
  raw: Record<string, JsonValue>;
}

export interface CliOptions {
  challengeFile: string;
  companiesDb: string;
  query: string;
  model: string;
  ollamaHost: string;
  minFitScore: number;
  maxCompanies: number | null;
  maxConcurrency: number;
  usePrefilter: boolean;
  helpRequested: boolean;
}
