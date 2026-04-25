import React, { useState, useEffect, useRef } from 'react'
import './Chat.css'
import sendBtn from '../assets/send.svg'
import userIcon from '../assets/user.svg'
import botIcon from '../assets/bot.svg'
import TypingIndicator from './TypingIndicator'
import socketService from '../services/socketService'
import chatHistoryService from '../services/chatHistoryService'

const normalizeText = (value) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (value && typeof value === 'object') {
    const candidates = [
      value.text,
      value.message,
      value.query,
      value.transcript,
      value.value,
      value.target?.value,
      value.nativeEvent?.text,
      value.detail?.value,
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate
      }
    }

    try {
      return JSON.stringify(value)
    } catch (_error) {
      return ''
    }
  }

  return ''
}

const Chat = ({
  isSidebarOpen,
  onToggleSidebar,
  currentChatId,
  onChatUpdate,
}) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Connect to backend
  useEffect(() => {
    const socket = socketService.connect()

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Connected to AI backend')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('❌ Disconnected from AI backend')
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  // Load messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      const chat = chatHistoryService.getChatById(currentChatId)
      if (chat) {
        setMessages(chat.messages || [])
      } else {
        setMessages([])
      }
    } else {
      setMessages([])
    }
  }, [currentChatId])

  // Save messages whenever they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      chatHistoryService.updateChatMessages(currentChatId, messages)
      onChatUpdate()
    }
  }, [messages, currentChatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }

  const handleSend = async () => {
    const messageText = normalizeText(input).trim()

    if (messageText && isConnected && currentChatId) {
      const userMessage = {
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsTyping(true)

      // Send message to backend via Socket.IO
      socketService.sendMessage(messageText, (response) => {
        const botMessage = {
          text: normalizeText(response),
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      })
    } else if (!isConnected) {
      const errorMessage = {
        text: 'Unable to connect to AI backend. Please make sure the server is running on port 3000.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } else if (!currentChatId) {
      const errorMessage = {
        text: 'Please select or create a chat to start messaging.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date) => {
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className={`chat-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Header */}
      <header className="chat-header">
        <button
          className="menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="chat-title">ChatGPT</h1>
        <div className="connection-status">
          <div
            className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
          ></div>
          <span className="status-text">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="header-actions">
          <button className="header-btn" title="Share chat">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <svg width="80" height="80" viewBox="0 0 41 41" fill="none">
                <path
                  d="M35.875 18.375C35.875 19.0625 35.3125 19.625 34.625 19.625H21.375C20.6875 19.625 20.125 19.0625 20.125 18.375V5.125C20.125 4.4375 20.6875 3.875 21.375 3.875H34.625C35.3125 3.875 35.875 4.4375 35.875 5.125V18.375Z"
                  fill="var(--accent-color)"
                />
                <path
                  d="M13.875 35.875C13.875 36.5625 13.3125 37.125 12.625 37.125H6.375C5.6875 37.125 5.125 36.5625 5.125 35.875V29.625C5.125 28.9375 5.6875 28.375 6.375 28.375H12.625C13.3125 28.375 13.875 28.9375 13.875 29.625V35.875Z"
                  fill="var(--accent-color)"
                />
                <path
                  d="M35.875 28.375H21.375C20.6875 28.375 20.125 28.9375 20.125 29.625V35.875C20.125 36.5625 20.6875 37.125 21.375 37.125H34.625C35.3125 37.125 35.875 36.5625 35.875 35.875V29.625C35.875 28.9375 35.3125 28.375 34.625 28.375H35.875Z"
                  fill="var(--accent-color)"
                />
                <path
                  d="M13.875 3.875H6.375C5.6875 3.875 5.125 4.4375 5.125 5.125V21.375C5.125 22.0625 5.6875 22.625 6.375 22.625H12.625C13.3125 22.625 13.875 22.0625 13.875 21.375V5.125C13.875 4.4375 13.3125 3.875 12.625 3.875H13.875Z"
                  fill="var(--accent-color)"
                />
              </svg>
            </div>
            <h2>How can I help you today?</h2>
            <div className="suggestions">
              <button
                className="suggestion-card"
                onClick={() =>
                  setInput('Explain quantum computing in simple terms')
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Explain quantum computing</span>
              </button>
              <button
                className="suggestion-card"
                onClick={() =>
                  setInput('Write a creative story about space exploration')
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                </svg>
                <span>Write a creative story</span>
              </button>
              <button
                className="suggestion-card"
                onClick={() => setInput('Help me debug this code')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span>Help with debugging</span>
              </button>
              <button
                className="suggestion-card"
                onClick={() => setInput('Plan a healthy weekly meal plan')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3h18v18H3z"></path>
                  <path d="M3 9h18M9 3v18"></path>
                </svg>
                <span>Plan weekly meals</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className="message">
                  <div className="message-avatar">
                    <img
                      src={msg.sender === 'user' ? userIcon : botIcon}
                      alt={msg.sender}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">
                        {msg.sender === 'user' ? 'You' : 'ChatGPT'}
                      </span>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="message-text">{msg.text}</div>
                    {msg.sender === 'bot' && (
                      <div className="message-actions">
                        <button className="action-icon" title="Copy">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                        <button className="action-icon" title="Like">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                        </button>
                        <button className="action-icon" title="Dislike">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message">
                  <div className="message-avatar">
                    <img src={botIcon} alt="bot" />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">ChatGPT</span>
                    </div>
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-wrapper">
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(normalizeText(e))}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT..."
            rows="1"
            className="chat-input"
          />
          <button
            className={`send-btn ${input.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <img src={sendBtn} alt="send" />
          </button>
        </div>
        <p className="chat-disclaimer">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </main>
  )
}

export default Chat
