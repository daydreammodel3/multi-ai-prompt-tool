const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate response from Google Gemini
 * @param {string} prompt - User prompt
 * @returns {Promise<Object>} Response object with model, content, and metadata
 */
async function generateResponse(prompt) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('Google Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    model: 'Google Gemini',
    content: response.text(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  generateResponse,
};
