import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, MessageCircle, X } from 'lucide-react';
import MessageRenderer from './MessageRenderer';
import { askAI } from '../lib/llmApi';

const AIAssistantSidebar = ({ theme = 'dark', activeFile = null, onInsertCode = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: 'Hello! 👋 I can help you with your code. Ask me anything about the current file, how to debug issues, or request code modifications.' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const colors = {
    dark: {
      bg: '#1E1E1E',
      bgSecondary: '#252526',
      bgTertiary: '#2D2D2D',
      border: '#3E3E42',
      text: '#E0E0E0',
      textMuted: '#9CA3AF',
      accent: '#B0C4DE',
      accentHover: '#C0D0E8',
      success: '#A9B7B7',
    },
    light: {
      bg: '#FFFFFF',
      bgSecondary: '#F8F8F8',
      bgTertiary: '#F0F0F0',
      border: '#E0E0E0',
      text: '#2D2D2D',
      textMuted: '#6B7280',
      accent: '#36454F',
      accentHover: '#4B5A68',
      success: '#8A9A9A',
    }
  };

  const c = colors[theme];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInsertCode = (code, language) => {
    if (onInsertCode) {
      onInsertCode(code, language);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askAI(
        question,
        activeFile?.content || '',
        activeFile?.language || 'javascript'
      );

      if (response.success) {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: response.answer
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: `Sorry, I couldn't process your request: ${response.message}`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: error.response?.data?.message || 'Error: Unable to get response. Make sure the OpenRouter API key is configured.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Bar - Right side minimal bar */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[3%] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundColor: c.bgSecondary,
          borderLeft: `1px solid ${c.border}`,
          zIndex: 45
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-2 items-center">
          <MessageCircle size={24} style={{ color: c.accent }} />
          <span className="text-xs font-semibold" style={{ color: c.textMuted }}>AI</span>
        </div>
      </div>

      {/* Sidebar Panel - Slides in from right */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#fff0] bg-opacity-0 z-40"
            onClick={() => setIsOpen(false)}
            style={{ right: '64px' }}
          />

          {/* Chat Panel */}
          <div
            className="fixed top-0 bottom-0 right-16 w-[30%] flex flex-col shadow-2xl border-l transition-all duration-300 z-41"
            style={{
              backgroundColor: c.bg,
              borderColor: c.border
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: c.border, backgroundColor: c.bgSecondary }}
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={20} style={{ color: c.accent }} />
                <h3 className="font-semibold" style={{ color: c.text }}>AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:opacity-70 transition-opacity"
                style={{ color: c.textMuted }}
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Current File Info */}
            {activeFile && (
              <div
                className="px-4 py-2 text-xs border-b"
                style={{ backgroundColor: c.bgTertiary, borderColor: c.border, color: c.textMuted }}
              >
                Current file: <span style={{ color: c.accent }}>{activeFile.name}</span>
              </div>
            )}

            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: c.bgSecondary }}
            >
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="px-4 py-2 rounded-lg max-w-xs text-sm"
                    style={{
                      backgroundColor: msg.type === 'user' ? c.accent : c.bgTertiary,
                      color: msg.type === 'user' ? (theme === 'dark' ? '#1E1E1E' : '#FFFFFF') : c.text,
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.type === 'user' ? (
                      msg.text
                    ) : (
                      <MessageRenderer 
                        content={msg.text} 
                        theme={theme}
                        onInsertCode={handleInsertCode}
                      />
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: c.bgTertiary }}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: c.accent, animationDelay: '0s' }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: c.accent, animationDelay: '0.2s' }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: c.accent, animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="border-t p-3 space-y-2"
              style={{ borderColor: c.border, backgroundColor: c.bgSecondary }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your code..."
                  className="flex-1 px-3 py-2 rounded-lg border focus:outline-none text-sm transition-all"
                  style={{
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    color: c.text
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  style={{
                    backgroundColor: c.accent,
                    color: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs" style={{ color: c.textMuted }}>
                Ask questions about the code or request modifications
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AIAssistantSidebar;