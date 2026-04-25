const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** @param {unknown} response */
const extractResponseText = (response) => {
  if (!response) return '';

  const typedResponse = /** @type {any} */ (response);

  if (typeof typedResponse.text === 'string' && typedResponse.text.trim().length > 0) {
    return typedResponse.text.trim();
  }

  const parts = typedResponse?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .filter(Boolean)
      .join('\n')
      .trim();

    if (joined.length > 0) {
      return joined;
    }
  }

  return '';
};

/** @param {Array<{role: string, parts: Array<{text: string}>}>} chathistory */
async function generate_text(chathistory) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: chathistory,
    });
    const text = extractResponseText(response);

    if (!text) {
      throw new Error('EMPTY_MODEL_RESPONSE');
    }

    return text;
  } catch (error) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      throw new Error('API_QUOTA_EXCEEDED');
    }
    if (msg.includes('EMPTY_MODEL_RESPONSE')) {
      throw new Error('EMPTY_MODEL_RESPONSE');
    }
    throw error;
  }
}

module.exports = generate_text;