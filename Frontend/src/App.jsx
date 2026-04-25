import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import chatHistoryService from './services/chatHistoryService'
import './App.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])

  // Load chat history on mount
  useEffect(() => {
    const history = chatHistoryService.getAllChats()
    setChatHistory(history)

    // If there are chats, select the first one
    if (history.length > 0) {
      setCurrentChatId(history[0].id)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleNewChat = () => {
    const newChat = chatHistoryService.createNewChat()
    setChatHistory([newChat, ...chatHistory])
    setCurrentChatId(newChat.id)

    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId)
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }

  const handleDeleteChat = (chatId) => {
    chatHistoryService.deleteChat(chatId)
    const updatedHistory = chatHistoryService.getAllChats()
    setChatHistory(updatedHistory)

    // If deleted chat was current, switch to another
    if (currentChatId === chatId) {
      setCurrentChatId(updatedHistory.length > 0 ? updatedHistory[0].id : null)
    }
  }

  const handleUpdateChatTitle = (chatId, newTitle) => {
    chatHistoryService.updateChatTitle(chatId, newTitle)
    setChatHistory(chatHistoryService.getAllChats())
  }

  const refreshChatHistory = () => {
    setChatHistory(chatHistoryService.getAllChats())
  }

  const handleDeleteCurrentChat = () => {
    if (!currentChatId) return
    handleDeleteChat(currentChatId)
  }

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChat={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onUpdateTitle={handleUpdateChatTitle}
      />
      <Chat
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        currentChatId={currentChatId}
        onChatUpdate={refreshChatHistory}
        onDeleteCurrentChat={handleDeleteCurrentChat}
      />
    </div>
  )
}

export default App
