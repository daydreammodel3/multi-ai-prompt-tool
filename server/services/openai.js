const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate response from ChatGPT
 * @param {string} prompt - User prompt
 * @returns {Promise<Object>} Response object with model, content, and metadata
 */
async function generateResponse(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const message = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  return {
    model: 'ChatGPT',
    content: message.choices[0].message.content,
    usage: {
      promptTokens: message.usage.prompt_tokens,
      completionTokens: message.usage.completion_tokens,
      totalTokens: message.usage.total_tokens,
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  generateResponse,
};
