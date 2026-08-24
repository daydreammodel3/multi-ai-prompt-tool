const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate response from Claude (Anthropic)
 * @param {string} prompt - User prompt
 * @returns {Promise<Object>} Response object with model, content, and metadata
 */
async function generateResponse(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return {
    model: 'Claude (Anthropic)',
    content: message.content[0].type === 'text' ? message.content[0].text : '',
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  generateResponse,
};
