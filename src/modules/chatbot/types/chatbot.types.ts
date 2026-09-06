export type ChatRole = 'user' | 'assistant';

export type ChatMessageStatus = 'pending' | 'done' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  status: ChatMessageStatus;
  createdAt: number;
}

/** One FAQ entry the answer was grounded in. */
export interface ChatSource {
  faq_id: string;
  category: string;
  lang: string;
  question: string;
  answer: string;
  score: number;
}

/** Upstream `POST /query` response. */
export interface ChatQueryResponse {
  answer: string;
  cited_faq_ids: string[];
  sources: ChatSource[];
  confidence: number;
  confident: boolean;
  language: string;
  query: string;
  latency_ms: number;
}

/** Normalized shape handed to the UI — upstream debug fields dropped. */
export interface ChatAnswer {
  answer: string;
  confident: boolean;
  language: string;
}

/** `event: metadata` payload from the upstream SSE stream. */
export interface AskStreamMetadata {
  query: string;
  language: string;
  confident: boolean;
  confidence: number;
}

/** `event: delta` payload — the next paragraph chunk of the answer. */
export interface AskStreamDelta {
  text: string;
  speech_text?: string;
}

/** `event: final` payload — the complete answer plus retrieval debug info. */
export interface AskStreamFinal {
  answer: string;
  confidence: number;
  confident: boolean;
  language: string;
  latency_ms: number;
}

export type AskStreamEvent =
  | { type: 'metadata'; data: AskStreamMetadata }
  | { type: 'delta'; data: AskStreamDelta }
  | { type: 'final'; data: AskStreamFinal };
