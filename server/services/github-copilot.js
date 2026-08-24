const axios = require('axios');

/**
 * Generate response from GitHub Copilot-backed GitHub Models endpoint.
 * @param {string} prompt - User prompt
 * @returns {Promise<Object>} Response object with model, content, and metadata
 */
async function generateResponse(prompt) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GitHub token not configured');
  }

  try {
    const response = await axios.post(
      'https://models.github.ai/inference/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      model: 'GitHub Copilot',
      content: response.data.choices[0].message.content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
      throw new Error('GitHub Models API is not available for the current token or account.');
    }

    throw error;
  }
}

module.exports = {
  generateResponse,
};
