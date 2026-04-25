const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate_text(chathistory) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: chathistory,
    });
    return response.text;
  } catch (error) {
    const msg = error.message || JSON.stringify(error);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      throw new Error('API_QUOTA_EXCEEDED');
    }
    throw error;
  }
}

module.exports = generate_text;