import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { Brain, Send, Plus, Trash2, Moon, Sun, Menu, X, Zap, EyeOff, LogOut, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import MessageRenderer from '../components/MessageRenderer';

const BrainMesh = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMultiLLM, setIsMultiLLM] = useState(false);
  const [selectedModels, setSelectedModels] = useState(['openai/gpt-4o-mini']);
  const [availableModels, setAvailableModels] = useState([]);
  const [temporaryChatId, setTemporaryChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const colors = {
    dark: {
      bg: '#1E1E1E',
      bgSecondary: '#252526',
      bgTertiary: '#2D2D2D',
      sidebar: '#1A1A1A',
      border: '#3E3E42',
      text: '#E0E0E0',
      textMuted: '#9CA3AF',
      accent: '#B0C4DE',
      accentHover: '#C0D0E8',
    },
    light: {
      bg: '#FFFFFF',
      bgSecondary: '#F8F8F8',
      bgTertiary: '#F0F0F0',
      sidebar: '#F5F5F5',
      border: '#E0E0E0',
      text: '#2D2D2D',
      textMuted: '#6B7280',
      accent: '#36454F',
      accentHover: '#4B5A68',
    },
  };

  const c = colors[theme];

  const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await apiClient.get('/prompt/models');
        if (res.data.success) {
          setAvailableModels(res.data.models);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  // Sync selectedModels and isMultiLLM when activeChat changes
  useEffect(() => {
    if (activeChat) {
      setIsMultiLLM(activeChat.isMultiLLM || false);
      setSelectedModels(activeChat.models && activeChat.models.length > 0 ? activeChat.models : ['openai/gpt-4o-mini']);
      loadChatMessages(activeChat._id);
    }
  }, [activeChat?._id]);

  // Fetch chats
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await apiClient.get('/chat');
      if (res.data.success) {
        setChats(res.data.data);
        if (res.data.data.length > 0 && !activeChat) {
          setActiveChat(res.data.data[0]);
          loadChatMessages(res.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const res = await apiClient.get(`/chat/${chatId}`);
      if (res.data.success) {
        setMessages(res.data.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const deleteTemporaryChat = async (chatId) => {
    try {
      await apiClient.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (temporaryChatId === chatId) {
        setTemporaryChatId(null);
      }
    } catch (error) {
      console.error('Error deleting temporary chat:', error);
    }
  };

  const selectChat = async (chat) => {
    if (activeChat?.isTemporary && activeChat._id !== chat._id) {
      await deleteTemporaryChat(activeChat._id);
    }
    setActiveChat(chat);
    loadChatMessages(chat._id);
  };

  const createNewChat = async () => {
    if (activeChat?.isTemporary) {
      await deleteTemporaryChat(activeChat._id);
    }
    try {
      const modelsToSend = isMultiLLM ? selectedModels : ['openai/gpt-4o-mini'];
      const res = await apiClient.post('/chat', {
        title: 'New Chat',
        isMultiLLM,
        models: modelsToSend
      });
      if (res.data.success) {
        const newChat = res.data.data;
        setChats([newChat, ...chats]);
        setActiveChat(newChat);
        setMessages([]);
        // Sync state
        setIsMultiLLM(newChat.isMultiLLM || false);
        setSelectedModels(newChat.models && newChat.models.length > 0 ? newChat.models : ['openai/gpt-4o-mini']);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const createIncognitoChat = async () => {
    if (activeChat?.isTemporary) {
      await deleteTemporaryChat(activeChat._id);
    }

    try {
      const modelsToSend = isMultiLLM ? selectedModels : ['openai/gpt-4o-mini'];
      const res = await apiClient.post('/chat', {
        title: 'Incognito Chat',
        subtitle: 'Temporary chat deleted when switching away',
        isMultiLLM,
        models: modelsToSend
      });
      if (res.data.success) {
        const newChat = { ...res.data.data, isTemporary: true };
        setChats([newChat, ...chats]);
        setActiveChat(newChat);
        setMessages([]);
        setTemporaryChatId(newChat._id);
        setIsMultiLLM(newChat.isMultiLLM || false);
        setSelectedModels(newChat.models && newChat.models.length > 0 ? newChat.models : ['openai/gpt-4o-mini']);
      }
    } catch (error) {
      console.error('Error creating incognito chat:', error);
    }
  };

  const sendMessage = async () => {
    if (isLoading || !input.trim() || !activeChat) return;

    const userMessage = {
      _id: Date.now(),
      type: 'user',
      content: input,
      createdAt: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = isMultiLLM ? '/prompt/multi-llm' : '/prompt/prompt';
      const payload = isMultiLLM
        ? {
            chatId: activeChat._id,
            prompt: input,
            models: selectedModels
          }
        : {
            chatId: activeChat._id,
            prompt: input,
            model: selectedModels[0]
          };

      const res = await apiClient.post(endpoint, payload);

      if (res.data.success) {
        const assistantMessage = {
          _id: res.data.assistantMessage._id,
          type: 'assistant',
          content: res.data.assistantMessage.content,
          model: res.data.assistantMessage.model,
          multiLLMResponses: res.data.assistantMessage.multiLLMResponses,
          createdAt: res.data.assistantMessage.createdAt
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update chat title if it's the first message
        if (messages.length === 0) {
          const title = input.substring(0, 30) + (input.length > 30 ? '...' : '');
          await apiClient.put(`/chat/${activeChat._id}`, { title });
          setActiveChat({ ...activeChat, title });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Response data:', error.response?.data);
      const errorMessage = {
        _id: Date.now(),
        type: 'assistant',
        content: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await apiClient.delete(`/chat/${chatId}`);
      setChats(chats.filter(c => c._id !== chatId));
      if (temporaryChatId === chatId) {
        setTemporaryChatId(null);
      }
      if (activeChat._id === chatId) {
        const remainingChats = chats.filter(c => c._id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChat(remainingChats[0]);
          loadChatMessages(remainingChats[0]._id);
        } else {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGoBack = () => {
    window.history.back();
  };
  return (
    <div className="flex h-screen w-full" style={{ backgroundColor: c.bg, color: c.text }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}
        style={{ backgroundColor: c.sidebar, borderColor: c.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: c.border }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <ArrowLeft onClick={handleGoBack} size={20} />
              <span className="font-bold text-lg">Code Editor</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:opacity-70"
            style={{ backgroundColor: c.bgTertiary }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* New Chat Buttons */}
        {sidebarOpen && (
          <div className="m-3 flex flex-col gap-2">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFF' }}
            >
              <Plus size={16} />
              <span>New Chat</span>
            </button>
            <button
              onClick={createIncognitoChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: '#dc2626', color: '#FFF' }}
            >
              <EyeOff size={16} />
              <span>Incognito Chat</span>
            </button>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat._id}
              onClick={() => selectChat(chat)}
              className={`w-full text-left px-4 py-3 border-b transition-all hover:opacity-80 ${
                activeChat?._id === chat._id ? 'opacity-100' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeChat?._id === chat._id ? c.bgTertiary : 'transparent',
                borderColor: c.border
              }}
            >
              {sidebarOpen ? (
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{chat.title}</p>
                    {chat.subtitle && <p className="text-xs opacity-70 truncate">{chat.subtitle}</p>}
                  </div>
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat._id);
                      }}
                      className="transition-opacity opacity-100 hover:opacity-80"
                      title="Delete chat"
                    >
                      <Trash2 size={14} style={{ color: '#FF7D5E' }} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-3 h-3 rounded-full mx-auto"
                  style={{ backgroundColor: c.accent }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Settings */}
        {sidebarOpen && (
          <div className="border-t p-3 space-y-2" style={{ borderColor: c.border }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: c.bgTertiary }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: c.bgTertiary, color: '#ef4444' }}
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: c.bgSecondary, borderColor: c.border }}
        >
          <div>
            <h1 className="text-2xl font-bold">{activeChat?.title || 'BrainMesh Chat'}</h1>
            <p style={{ color: c.textMuted }} className="text-sm">{user?.username}</p>
          </div>

          {/* Multi-LLM Toggle */}
          {activeChat && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMultiLLM}
                  onChange={(e) => setIsMultiLLM(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="flex items-center gap-1 text-sm">
                  <Zap size={14} />
                  Multi-LLM
                </span>
              </label>
            </div>
          )}
        </header>

        {/* Model Selection */}
        {activeChat && isMultiLLM && (
          <div
            className="px-6 py-3 border-b flex gap-2 overflow-x-auto"
            style={{ backgroundColor: c.bgSecondary, borderColor: c.border }}
          >
            {availableModels.map(model => (
              <label key={model} className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModels([...selectedModels, model]);
                    } else {
                      setSelectedModels(selectedModels.filter(m => m !== model));
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: c.bgTertiary }}>
                  {model.split('/')[1]}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ backgroundColor: c.bg }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Brain size={64} style={{ color: c.textMuted, opacity: 0.3 }} />
              <p style={{ color: c.textMuted }}>
                {activeChat ? 'Start a conversation...' : 'Select or create a chat'}
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message._id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: message.type === 'user'
                      ? (theme === 'dark' ? '#0B5394' : '#D6E4FF')
                      : (theme === 'dark' ? '#1E1E1E' : '#F3F4F6'),
                    color: message.type === 'user'
                      ? (theme === 'dark' ? '#F3F3F3' : '#1F2937')
                      : c.text,
                    border: `1px solid ${message.type === 'assistant' ? c.border : (theme === 'dark' ? '#0B4A7B' : '#B8D0FF')}`,
                    boxShadow: message.type === 'assistant'
                      ? '0 1px 2px rgba(0,0,0,0.15)'
                      : '0 1px 2px rgba(0,0,0,0.08)'
                  }}
                >
                  <MessageRenderer content={message.content} theme={theme} />
                  {message.multiLLMResponses && (
                    <div className="mt-2 text-xs opacity-70 space-y-1">
                      {message.multiLLMResponses.map((resp, idx) => (
                        <p key={idx}>{resp.model}: {resp.tokens} tokens</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeChat && (
          <div
            className="border-t p-4 t"
            style={{ backgroundColor: c.bgSecondary, borderColor: c.border }}
          >
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isLoading ? 'Waiting for response... please do not send another message.' : 'Type your message... (Shift+Enter for new line)'}
                className="flex-1 px-4 py-2 rounded-lg border resize-none"
                style={{
                  backgroundColor: c.bg,
                  borderColor: c.border,
                  color: c.text
                }}
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: c.accent,
                  color: theme === 'dark' ? c.bg : '#FFF'
                }}
              >
                {isLoading ? 'Waiting...' : <Send size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainMesh;
