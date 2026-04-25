// Chat History Storage Service - Frontend Only

const STORAGE_KEY = 'chatgpt_chat_history';

class ChatHistoryService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  // Get all chats
  getAllChats() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error reading chat history:', error);
      return [];
    }
  }

  // Get a specific chat by ID
  getChatById(chatId) {
    const chats = this.getAllChats();
    return chats.find(chat => chat.id === chatId);
  }

  // Create a new chat
  createNewChat(title = 'New conversation') {
    const newChat = {
      id: Date.now(),
      title: title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const chats = this.getAllChats();
    chats.unshift(newChat); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    
    return newChat;
  }

  // Update chat messages
  updateChatMessages(chatId, messages) {
    const chats = this.getAllChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      chats[chatIndex].messages = messages;
      chats[chatIndex].updatedAt = new Date().toISOString();
      
      // Update title with first user message if still default
      if (chats[chatIndex].title === 'New conversation' && messages.length > 0) {
        const firstUserMessage = messages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          chats[chatIndex].title = firstUserMessage.text.slice(0, 50) + 
            (firstUserMessage.text.length > 50 ? '...' : '');
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }

  // Delete a chat
  deleteChat(chatId) {
    const chats = this.getAllChats();
    const filtered = chats.filter(chat => chat.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  // Update chat title
  updateChatTitle(chatId, newTitle) {
    const chats = this.getAllChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      chats[chatIndex].title = newTitle;
      chats[chatIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }

  // Get chats grouped by date
  getGroupedChats() {
    const chats = this.getAllChats();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const grouped = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.updatedAt);
      const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

      if (chatDay.getTime() === today.getTime()) {
        grouped['Today'].push(chat);
      } else if (chatDay.getTime() === yesterday.getTime()) {
        grouped['Yesterday'].push(chat);
      } else if (chatDate >= lastWeek) {
        grouped['Previous 7 Days'].push(chat);
      } else {
        grouped['Older'].push(chat);
      }
    });

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  }

  // Clear all chats
  clearAllChats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

// Export singleton instance
const chatHistoryService = new ChatHistoryService();
export default chatHistoryService;
