export type ServiceId = 'chatgpt' | 'gemini' | 'claude' | 'github-copilot';

export interface ModelOption {
  id: ServiceId;
  name: string;
  icon: string;
  available: boolean;
}

export interface ServiceResult {
  id: ServiceId;
  name: string;
  icon: string;
  available: boolean;
  status: 'success' | 'error';
  durationMs: number;
  model?: string;
  content?: string;
  usage?: Record<string, number>;
  timestamp?: string;
  error?: string;
}

export interface SubmitResponse {
  prompt: string;
  selectedAIs: ServiceId[];
  responses: Partial<Record<ServiceId, unknown>>;
  errors: Partial<Record<ServiceId, string>>;
  results: Partial<Record<ServiceId, ServiceResult>>;
  timestamp: string;
}
