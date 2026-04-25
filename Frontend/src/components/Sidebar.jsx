import React, { useState } from 'react';
import './Sidebar.css';
import logo from '../assets/logo.svg';
import chatHistoryService from '../services/chatHistoryService';

const Sidebar = ({ isOpen, onToggle, onNewChat, chatHistory, currentChat, onSelectChat, onDeleteChat, onUpdateTitle }) => {
  const [hoveredChat, setHoveredChat] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const groupedChats = chatHistoryService.getGroupedChats();

  const handleEdit = (chat, e) => {
    e.stopPropagation();
    setEditingChat(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId) => {
    if (editTitle.trim()) {
      onUpdateTitle(chatId, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle('');
  };

  const handleDelete = (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat?')) {
      onDeleteChat(chatId);
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onToggle}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="logo" className="logo-icon" />
            <span className="logo-text">ChatGPT</span>
          </div>
          <button className="new-chat-btn" onClick={onNewChat}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New chat</span>
          </button>
        </div>

        <div className="sidebar-content">
          <nav className="chat-history">
            {Object.keys(groupedChats).length === 0 ? (
              <div className="empty-state">
                <p>No chats yet</p>
                <p className="empty-subtitle">Start a new conversation</p>
              </div>
            ) : (
              Object.entries(groupedChats).map(([timestamp, chats]) => (
                <div key={timestamp} className="chat-group">
                  <h3 className="chat-group-title">{timestamp}</h3>
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`chat-item ${currentChat === chat.id ? 'active' : ''}`}
                      onClick={() => onSelectChat(chat.id)}
                      onMouseEnter={() => setHoveredChat(chat.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <svg className="chat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      
                      {editingChat === chat.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveEdit(chat.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(chat.id);
                            if (e.key === 'Escape') setEditingChat(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="chat-title-input"
                          autoFocus
                        />
                      ) : (
                        <span className="chat-title">{chat.title}</span>
                      )}
                      
                      {hoveredChat === chat.id && editingChat !== chat.id && (
                        <div className="chat-actions">
                          <button 
                            className="action-btn" 
                            title="Edit"
                            onClick={(e) => handleEdit(chat, e)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button 
                            className="action-btn" 
                            title="Delete"
                            onClick={(e) => handleDelete(chat.id, e)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div className="user-info">
              <span className="user-name">User</span>
            </div>
            <button className="settings-btn" title="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m5.2-14.2l-4.2 4.2m-6-6l4.2 4.2M23 12h-6m-6 0H5m14.2 5.2l-4.2-4.2m-6 6l4.2-4.2"></path>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
