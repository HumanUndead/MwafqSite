export interface LegalTableColumn {
  header: string;
}

export interface LegalTable {
  columns: string[];
  rows: string[][];
}

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: LegalTable;
  note?: string;
}

export interface PrivacyPolicyContent {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  version: string;
  tocTitle: string;
  sections: LegalSection[];
}
