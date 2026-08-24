import type { ModelOption, ServiceId, SubmitResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    throw new Error(errorBody?.error ?? errorBody?.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchModels(): Promise<ModelOption[]> {
  const response = await fetch(apiUrl('/api/prompts/models'));
  const payload = await parseJsonResponse<{ models: ModelOption[] }>(response);
  return payload.models;
}

export async function submitPrompt(prompt: string, selectedAIs: ServiceId[]): Promise<SubmitResponse> {
  const response = await fetch(apiUrl('/api/prompts/submit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      selectedAIs,
    }),
  });

  return parseJsonResponse<SubmitResponse>(response);
}
