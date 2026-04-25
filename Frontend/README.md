# JARVIS AI Chatbot (Full-Stack)

A modern ChatGPT-style AI assistant interface with real-time messaging, persistent chat history, and responsive UX across desktop and mobile.

## Highlights

- Real-time AI chat using Socket.IO.
- Modern React + Vite frontend with smooth interactions.
- Local chat history persistence with time-based grouping.
- Multi-chat management: create, switch, rename, and delete conversations.
- Mobile-first responsive layout with sidebar overlay behavior.
- Connection state feedback for backend availability.

## Tech Stack

- Frontend: React 19, Vite, Socket.IO Client, CSS3.
- Backend: Node.js, Express 5, Socket.IO.
- AI Provider: Google Gemini via `@google/genai`.
- Storage: Browser `localStorage` for chat history.

## Project Structure

```text
DAY-12_CHAT-BOT/
├─ Backend/
│  ├─ server.js
│  └─ src/
│     ├─ app.js
│     └─ Service/ai.service.js
└─ Frontend/
	├─ src/
	│  ├─ components/
	│  └─ services/
	└─ package.json
```

## Key Features

### Chat Experience

- Send messages instantly and receive AI responses in real time.
- Typing indicator for better conversational feedback.
- Message timestamps and visual separation between user and bot.

### Chat History

- Auto-save each conversation to local storage.
- Auto-generate titles from first user messages.
- Group chats by Today, Yesterday, Previous 7 Days, and Older.

### Usability

- Enter to send and Shift+Enter for multiline messages.
- Auto-growing textarea for comfortable longer prompts.
- Quick suggestion cards on empty chat state.

## Getting Started

### 1. Clone and install

```bash
# from project root
cd Backend
npm install

cd ../Frontend
npm install
```

### 2. Configure backend environment

Create a `.env` file inside `Backend/`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

### 3. Run the app

Open two terminals:

```bash
# terminal 1
cd Backend
npm run dev

# terminal 2
cd Frontend
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Available Scripts

### Frontend

- `npm run dev` starts Vite dev server.
- `npm run build` creates production build.
- `npm run preview` serves production build locally.
- `npm run lint` runs ESLint.

### Backend

- `npm run dev` starts backend with nodemon.
- `npm start` starts backend with Node.

## API and Socket Events

- Client emits: `ai-message` with text payload.
- Server emits: `ai-response` with generated text.

## Production Notes

- Move chat history from local storage to a database for multi-device sync.
- Restrict CORS origin to trusted domains.
- Add authentication and per-user chat isolation.
- Add rate limiting and request logging.

## Screens and UX

- Sidebar with grouped chat history and edit/delete controls.
- Main chat panel with assistant-style message cards.
- Responsive mobile layout with collapsible sidebar.

## License

This project is intended for educational and portfolio use.

---

If you like this project, consider starring the repository and sharing feedback.
