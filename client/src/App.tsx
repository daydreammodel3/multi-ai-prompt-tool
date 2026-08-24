import { useEffect, useMemo, useState } from 'react';
import { fetchModels, submitPrompt } from './api';
import type { ModelOption, ServiceId, ServiceResult } from './types';

function formatDuration(durationMs: number) {
  return `${durationMs}ms`;
}

function ResultCard({ result }: { result: ServiceResult }) {
  const isSuccess = result.status === 'success';

  return (
    <article className={`result-card ${isSuccess ? 'result-card--success' : 'result-card--error'}`}>
      <div className="result-card__header">
        <div>
          <h3>
            <span aria-hidden="true">{result.icon}</span> {result.name}
          </h3>
          <p>{formatDuration(result.durationMs)}</p>
        </div>
        <span className={`result-badge ${isSuccess ? 'result-badge--success' : 'result-badge--error'}`}>
          {isSuccess ? 'Success' : 'Error'}
        </span>
      </div>

      {isSuccess ? (
        <>
          <div className="result-card__meta">
            <span>{result.model ?? 'Model unavailable'}</span>
            {result.timestamp ? <span>{new Date(result.timestamp).toLocaleString()}</span> : null}
          </div>
          <pre className="result-card__content">{result.content ?? 'No content returned.'}</pre>
        </>
      ) : (
        <p className="result-card__error">{result.error ?? 'Unknown error'}</p>
      )}
    </article>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedAIs, setSelectedAIs] = useState<ServiceId[]>([]);
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [error, setError] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        const data = await fetchModels();

        if (!mounted) {
          return;
        }

        setModels(data);
        setSelectedAIs((current) => (current.length > 0 ? current : data.filter((model) => model.available).map((model) => model.id)));
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load models');
      } finally {
        if (mounted) {
          setIsLoadingModels(false);
        }
      }
    }

    loadModels();

    return () => {
      mounted = false;
    };
  }, []);

  const availableCount = useMemo(() => models.filter((model) => model.available).length, [models]);

  const handleToggle = (id: ServiceId) => {
    setSelectedAIs((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await submitPrompt(prompt, selectedAIs);
      const orderedResults = response.selectedAIs
        .map((id) => response.results[id])
        .filter((result): result is ServiceResult => Boolean(result));

      setResults(orderedResults);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = prompt.trim().length > 0 && selectedAIs.length > 0 && !isSubmitting;

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Multi-AI Prompt Tool</p>
          <h1>同じプロンプトを複数AIへ同時送信して比較する</h1>
          <p className="hero__description">
            GitHub Copilot / Gemini / Claude / ChatGPT の回答を横並びで確認できます。
          </p>
        </div>
        <div className="hero__status">
          <span>{isLoadingModels ? 'Loading models...' : `${availableCount}/${models.length} available`}</span>
          <span>{selectedAIs.length} selected</span>
        </div>
      </section>

      <section className="panel">
        <form className="prompt-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Prompt</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="比較したいプロンプトを入力してください"
              rows={8}
            />
          </label>

          <div className="field">
            <span>Target services</span>
            <div className="service-grid">
              {models.map((model) => (
                <label key={model.id} className={`service-chip ${model.available ? '' : 'service-chip--disabled'}`}>
                  <input
                    type="checkbox"
                    checked={selectedAIs.includes(model.id)}
                    onChange={() => handleToggle(model.id)}
                    disabled={!model.available}
                  />
                  <span>
                    {model.icon} {model.name}
                  </span>
                  {!model.available ? <small>Unavailable</small> : null}
                </label>
              ))}
            </div>
          </div>

          <div className="actions">
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Sending...' : 'Send to selected AI'}
            </button>
            <p className="hint">APIキーやトークンがないサービスは自動で無効化されます。</p>
          </div>
        </form>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Comparison</h2>
            <p>{results.length > 0 ? 'Responses are shown by service.' : 'No results yet.'}</p>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="results-grid">
            {results.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>フォームからプロンプトを送信すると、ここに比較結果が表示されます。</p>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Status</h2>
          </div>
        </div>

        <div className="status-table">
          {models.map((model) => {
            const result = results.find((item) => item.id === model.id);

            return (
              <div key={model.id} className="status-row">
                <div>
                  <strong>
                    {model.icon} {model.name}
                  </strong>
                  <p>{model.available ? 'Ready' : 'Missing API key / token'}</p>
                </div>
                <div>
                  <p>{selectedAIs.includes(model.id) ? 'Selected' : 'Not selected'}</p>
                  <p>{result ? result.status : 'Waiting'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
