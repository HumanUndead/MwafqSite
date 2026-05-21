export interface AuthEditorialStepContent {
  title: string;
  body: string;
}

export interface AuthEditorialStatContent {
  value: string;
  label: string;
}

export interface RegisterPageContent {
  titleLead: string;
  titleAccent: string;
  body: string;
  steps: AuthEditorialStepContent[];
  stats: AuthEditorialStatContent[];
}
