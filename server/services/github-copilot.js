const axios = require('axios');

/**
 * Generate response from GitHub Copilot
 * Note: GitHub Copilot doesn't have a public API for chat completion.
 * This is a placeholder implementation that would require GitHub's Copilot API
 * when it becomes available, or use GitHub's Models API.
 * 
 * @param {string} prompt - User prompt
 * @returns {Promise<Object>} Response object with model, content, and metadata
 */
async function generateResponse(prompt) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GitHub token not configured');
  }

  try {
    // Using GitHub's Models API (when available)
    // For now, this is a placeholder using a hypothetical endpoint
    const response = await axios.post(
      'https://api.github.com/models/chat/completions',
      {
        model: 'gpt-4',
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
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    return {
      model: 'GitHub Copilot',
      content: response.data.choices[0].message.content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Fallback: GitHub Copilot public API is not available yet
    // Return a placeholder response
    if (error.response?.status === 404 || error.response?.status === 401) {
      throw new Error(
        'GitHub Copilot API is not yet publicly available. ' +
        'Please use the GitHub Copilot Chat interface directly.'
      );
    }
    throw error;
  }
}

module.exports = {
  generateResponse,
};
