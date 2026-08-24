const express = require('express');
const router = express.Router();
const openaiService = require('../services/openai');
const geminiService = require('../services/gemini');
const claudeService = require('../services/claude');
const githubService = require('../services/github-copilot');

const SERVICE_CONFIG = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    icon: '🔗',
    available: () => !!process.env.OPENAI_API_KEY,
    service: openaiService,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✨',
    available: () => !!process.env.GOOGLE_GEMINI_API_KEY,
    service: geminiService,
  },
  claude: {
    id: 'claude',
    name: 'Claude (Anthropic)',
    icon: '🧠',
    available: () => !!process.env.ANTHROPIC_API_KEY,
    service: claudeService,
  },
  'github-copilot': {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '🤖',
    available: () => !!process.env.GITHUB_TOKEN,
    service: githubService,
  },
};

function getModels() {
  return Object.values(SERVICE_CONFIG).map((service) => ({
    id: service.id,
    name: service.name,
    icon: service.icon,
    available: service.available(),
  }));
}

// POST /api/prompts/submit
// Body: { prompt: string, selectedAIs: string[] }
router.post('/submit', async (req, res) => {
  try {
    const { prompt, selectedAIs } = req.body;

    if (typeof prompt !== 'string' || !prompt.trim() || !Array.isArray(selectedAIs) || selectedAIs.length === 0) {
      return res.status(400).json({
        error: 'プロンプトとAI選択が必要です',
      });
    }

    const normalizedPrompt = prompt.trim();
    const uniqueSelectedAIs = [...new Set(selectedAIs)].filter((ai) => SERVICE_CONFIG[ai]);
    const responses = {};
    const errors = {};
    const results = {};

    if (uniqueSelectedAIs.length === 0) {
      return res.status(400).json({
        error: '有効なAI選択が必要です',
      });
    }

    // 各AIに並列でリクエストを送信
    const promises = uniqueSelectedAIs.map(async (ai) => {
      const service = SERVICE_CONFIG[ai];
      const startedAt = Date.now();

      try {
        const response = await service.service.generateResponse(normalizedPrompt);
        const durationMs = Date.now() - startedAt;
        const result = {
          id: service.id,
          name: service.name,
          icon: service.icon,
          available: service.available(),
          status: 'success',
          durationMs,
          ...response,
        };

        responses[ai] = response;
        results[ai] = result;
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        const message = error instanceof Error ? error.message : 'Unknown error';

        errors[ai] = message;
        results[ai] = {
          id: service.id,
          name: service.name,
          icon: service.icon,
          available: service.available(),
          status: 'error',
          durationMs,
          error: message,
        };
      }
    });

    await Promise.all(promises);

    res.json({
      prompt: normalizedPrompt,
      selectedAIs: uniqueSelectedAIs,
      responses,
      errors,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /submit:', error);
    res.status(500).json({
      error: 'Failed to process prompt',
      message: error.message,
    });
  }
});

// GET /api/prompts/models
// Return available AI models
router.get('/models', (req, res) => {
  res.json({
    models: getModels(),
  });
});

module.exports = router;
