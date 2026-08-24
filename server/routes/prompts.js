const express = require('express');
const router = express.Router();
const openaiService = require('../services/openai');
const geminiService = require('../services/gemini');
const claudeService = require('../services/claude');
const githubService = require('../services/github-copilot');

// POST /api/prompts/submit
// Body: { prompt: string, selectedAIs: string[] }
router.post('/submit', async (req, res) => {
  try {
    const { prompt, selectedAIs } = req.body;

    if (!prompt || !selectedAIs || selectedAIs.length === 0) {
      return res.status(400).json({
        error: 'プロンプトとAI選択が必要です',
      });
    }

    const responses = {};
    const errors = {};

    // 各AIに並列でリクエストを送信
    const promises = selectedAIs.map(async (ai) => {
      try {
        switch (ai) {
          case 'chatgpt':
            responses.chatgpt = await openaiService.generateResponse(prompt);
            break;
          case 'gemini':
            responses.gemini = await geminiService.generateResponse(prompt);
            break;
          case 'claude':
            responses.claude = await claudeService.generateResponse(prompt);
            break;
          case 'github-copilot':
            responses['github-copilot'] = await githubService.generateResponse(prompt);
            break;
          default:
            throw new Error(`Unknown AI: ${ai}`);
        }
      } catch (error) {
        errors[ai] = error.message;
      }
    });

    await Promise.all(promises);

    res.json({
      prompt,
      responses,
      errors,
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
    models: [
      {
        id: 'chatgpt',
        name: 'ChatGPT (OpenAI)',
        icon: '🔗',
        available: !!process.env.OPENAI_API_KEY,
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        icon: '✨',
        available: !!process.env.GOOGLE_GEMINI_API_KEY,
      },
      {
        id: 'claude',
        name: 'Claude (Anthropic)',
        icon: '🧠',
        available: !!process.env.ANTHROPIC_API_KEY,
      },
      {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        icon: '🤖',
        available: !!process.env.GITHUB_TOKEN,
      },
    ],
  });
});

module.exports = router;
