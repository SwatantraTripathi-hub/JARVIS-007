require('dotenv').config();
const app = require('./src/app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/db/db');
const generate_text = require('./src/Service/ai.service');

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

/** @param {unknown} value */
const normalizeText = (value) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    const payload = /** @type {Record<string, unknown>} */ (value);
    const candidates = [payload.text, payload.message, payload.query, payload.value];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }

  return '';
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',           // allow any localhost port (Vite picks random ones)
    methods: ['GET', 'POST']
  }
});

// temporary chat_history storage
let chat_history = [];

io.on('connection', (socket) => {
  console.log('A user is connected');

  socket.on('disconnect', () => {
    console.log('A user is disconnected');
  });

  socket.on('ai-message', async (message) => {
    const normalizedMessage = normalizeText(message).trim();
    console.log('Received message from client:', normalizedMessage || '[empty]');

    if (!normalizedMessage) {
      socket.emit('ai-response', 'It looks like the message did not come through correctly. Please resend your request.');
      return;
    }

    chat_history.push({
      role: 'user',
      parts: [{ text: normalizedMessage }]
    });

    try {
      const response = await generate_text(chat_history);

      chat_history.push({
        role: 'model',
        parts: [{ text: response }]
      });

      console.log('AI response:', response);
      socket.emit('ai-response', normalizeText(response));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('AI generation failed:', errorMessage || error);
      chat_history.pop();
      if (errorMessage === 'API_QUOTA_EXCEEDED') {
        socket.emit('ai-response', '⚠️ Gemini API daily free quota exhausted. Please wait a few minutes or check your billing at https://ai.google.dev/gemini-api/docs/rate-limits');
      } else if (errorMessage === 'EMPTY_MODEL_RESPONSE') {
        socket.emit('ai-response', 'I could not generate a complete answer this time. Please try again with a more specific prompt.');
      } else {
        socket.emit('ai-response', 'Sorry, something went wrong. Please try again.');
      }
    }
  });
});

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection error:', message);
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
  });

  httpServer.on('error', (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('HTTP server failed to bind:', message);
    process.exit(1);
  });
}

startServer();
