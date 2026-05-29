import React, { useState, useEffect } from "react";
import { Lock, MessageCircle } from "lucide-react";
import Navbar from "./Layout/Navbar";
import ShareChatModal from "./Chat/ShareChatModal";
import axios from "axios";
import ParticleBackground from "./Layout/ParticleBackground";
import LLMColumn from "./Chat/LLMColumn";
import Sidebar from "./Layout/Sidebar";
import { UserDataContext } from "../context/UserContext";
import { useContext } from "react";
import {
  verifyPaymentStatus,
  getLocalPaymentStatus,
} from "../utils/paymentUtils.js";

const Home = ({ paymentDone, setPaymentDone }) => {
  const [visibleLLMs, setVisibleLLMs] = useState({
    ChatGPT: true,
    Gemini: true,
    DeepSeek: true,
    Perplexity: true,
    Lama: false,
  });

  const [messages, setMessages] = useState({
    ChatGPT: [],
    Gemini: [],
    DeepSeek: [],
    Perplexity: [],
    Lama: [],
  });
  const [chatMessages, setChatMessages] = useState({
    "initial-1": {
      ChatGPT: [],
      Gemini: [],
      DeepSeek: [],
      Perplexity: [],
      Lama: [],
    },
    "initial-2": {
      ChatGPT: [],
      Gemini: [],
      DeepSeek: [],
      Perplexity: [],
      Lama: [],
    },
  });

  const [isTyping, setIsTyping] = useState({
    "initial-1": {
      ChatGPT: false,
      Gemini: false,
      DeepSeek: false,
      Perplexity: false,
      Lama: false,
    },
    "initial-2": {
      ChatGPT: false,
      Gemini: false,
      DeepSeek: false,
      Perplexity: false,
      Lama: false,
    },
  });

  const llmConfigs = [
    {
      name: "ChatGPT",
      color: "bg-green-600",
      // model: "openai/gpt-4o-mini",
      model: "openai/gpt-oss-20b:free",
    },
    {
      name: "Gemini",
      color: "bg-blue-600",
      // model: "google/gemini-2.5-flash",
      model: "google/gemma-3n-e4b-it:free",
    },
    {
      name: "DeepSeek",
      color: "bg-purple-600",
      // model: "deepseek/deepseek-chat-v3.1",
      // model: "deepseek/deepseek-chat-v3.1:free",
      model: "tngtech/deepseek-r1t2-chimera:free",
    },
    {
      name: "Perplexity",
      color: "bg-orange-600",
      // model: "perplexity/sonar-pro",
      model: "nvidia/nemotron-nano-9b-v2:free",
    },
    {
      name: "Lama",
      color: "bg-cyan-600",
      // model: "meta-llama/llama-4-maverick",
      model: "meta-llama/llama-3.3-8b-instruct:free",
    },
  ];

  const [input, setInput] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  // state for Multi-LLM messages + typing

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMultiLLMBox, setShowMultiLLMBox] = useState(false);

  const [chats, setChats] = useState([
    // { id: "initial-1", title: "Chat 1", subtitle: "New Conversation" },
    // { id: "initial-2", title: "Chat 2", subtitle: "New Conversation" },
  ]);
  const [activeChat, setActiveChat] = useState(null);
  const [multiLLMMessages, setMultiLLMMessages] = useState([]);
  const [multiLLMTyping, setMultiLLMTyping] = useState(false);

  // Share functionality states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Map backend model IDs to frontend display names
  const modelToNameMap = {
    "openai/gpt-4o-mini": "ChatGPT",
    "google/gemini-2.5-flash": "Gemini",
    "deepseek/deepseek-chat-v3.1": "DeepSeek",
    "perplexity/sonar-pro": "Perplexity",
    "meta-llama/llama-4-maverick": "Lama",
  };

  const handleCloseLLM = (llmName) => {
    setVisibleLLMs((prev) => ({ ...prev, [llmName]: false }));
  };

  const handleRestoreLLM = (llmName) => {
    setVisibleLLMs((prev) => ({ ...prev, [llmName]: true }));
  };

  const getVisibleLLMs = () =>
    llmConfigs.filter((llm) => visibleLLMs[llm.name]);
  const getClosedLLMs = () =>
    llmConfigs.filter((llm) => !visibleLLMs[llm.name]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(200, e.clientX), 500);
    setSidebarWidth(newWidth);
  };
  const handleMouseUp = () => setIsResizing(false);

  const { user } = useContext(UserDataContext);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizing]);

  const generateResponse = (llmName, query) => {
    const responses = {
      ChatGPT: `ChatGPT response to: "${query}". This is a simulated response.`,
      Gemini: `Gemini's analysis of: "${query}". Detailed insights.`,
      DeepSeek: `DeepSeek's deep analysis: "${query}". Technical details.`,
      Perplexity: `Perplexity's research on: "${query}". Relevant findings.`,
      Lama: `Lama's insights: "${query}". Scalable solutions.`,
    };
    return responses[llmName] || `Response from ${llmName}`;
  };

  useEffect(() => {
    async function getChatMesssages() {
      try {
        const token = localStorage.getItem("token");
        // Don't fetch if no activeChat is set
        if (!activeChat || activeChat === "initial-1") {
          console.log("No active chat to fetch messages for");
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/chat/${activeChat}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        // console.log("Messages from server:", res.data);

        if (res.data.success) {
          const messages = res.data.messages;

          // Reset messages for current chat
          setChatMessages((prev) => ({
            ...prev,
            [activeChat]: {
              ChatGPT: [],
              Gemini: [],
              DeepSeek: [],
              Perplexity: [],
              Lama: [],
            },
          }));

          // Process each message
          messages.forEach((msg) => {
            if (msg.type === "user") {
              // Create user message object
              const userMessage = {
                id: msg._id,
                type: "user",
                content: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString(),
              };

              // Add user message to all LLM columns
              Object.keys(visibleLLMs).forEach((llmName) => {
                if (visibleLLMs[llmName]) {
                  setChatMessages((prev) => ({
                    ...prev,
                    [activeChat]: {
                      ...prev[activeChat],
                      [llmName]: [...prev[activeChat][llmName], userMessage],
                    },
                  }));
                }
              });
            } else if (msg.type === "ai") {
              const aiMessage = {
                id: msg._id,
                type: "ai",
                content: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString(),
              };

              // Map the backend model to frontend display name
              const modelName = modelToNameMap[msg.model];

              if (modelName && visibleLLMs[modelName]) {
                setChatMessages((prev) => ({
                  ...prev,
                  [activeChat]: {
                    ...prev[activeChat],
                    [modelName]: [
                      ...(prev[activeChat][modelName] || []),
                      aiMessage,
                    ],
                  },
                }));
              } else {
                console.warn("⚠️ Unknown or hidden model:", msg.model);
              }
            }
          });

          // Update Multi-LLM messages if box is open
          if (showMultiLLMBox) {
            setMultiLLMMessages([]); // Reset messages

            // Create an array to hold all messages in order
            const allMultiLLMMessages = [];

            // Add all user messages first
            messages.forEach((msg) => {
              if (msg.type === "user") {
                allMultiLLMMessages.push({
                  id: msg._id,
                  type: "user",
                  content: msg.content,
                  time: new Date(msg.createdAt).toLocaleTimeString(),
                });
              }
            });

            // Add AI messages that are multi-LLM responses
            messages.forEach((msg) => {
              if (msg.type === "ai" && msg.isMultiLLM) {
                allMultiLLMMessages.push({
                  id: msg._id,
                  type: "ai",
                  content: msg.content,
                  time: new Date(msg.createdAt).toLocaleTimeString(),
                });
              }
            });

            // Set all messages at once
            setMultiLLMMessages(allMultiLLMMessages);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Handle specific error cases
        if (error.response?.status === 500) {
          console.warn("Server error while fetching messages");
        }
      }
    }

    getChatMesssages();
  }, [activeChat, setChats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const prompt = input;
    setInput("");

    const userMessage = {
      id: Date.now() + "-user",
      type: "user",
      content: prompt,
      time: new Date().toLocaleTimeString(),
    };

    // ✅ Add user message to all visible LLMs in current chat
    setChatMessages((prev) => ({
      ...prev,
      [activeChat]: Object.fromEntries(
        Object.entries(prev[activeChat]).map(([llm, msgs]) => [
          llm,
          [...msgs, userMessage],
        ])
      ),
    }));

    // ✅ Also add to Multi-LLM column if it's open
    if (showMultiLLMBox) {
      // Add user message to Multi-LLM column
      const multiLLMUserMessage = {
        ...userMessage,
        isMultiLLM: true, // Mark as Multi-LLM message
      };
      setMultiLLMMessages((prev) => [...prev, multiLLMUserMessage]);
      setMultiLLMTyping(true);

      // Log to verify message is added
      // console.log("Added user message to Multi-LLM:", multiLLMUserMessage);
    }

    // ✅ Set typing indicators for active chat only
    setIsTyping((prev) => ({
      ...prev,
      [activeChat]: Object.fromEntries(
        Object.entries(visibleLLMs).map(([llm, isVisible]) => [llm, isVisible])
      ),
    }));

    try {
      const selectedLLMs = llmConfigs
        .filter((llm) => visibleLLMs[llm.name])
        .map((llm) => llm.model);

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/chat/${activeChat}/messages`,
        {
          prompt: prompt,
          selectedLLMs: selectedLLMs,
          isMultiLLM: showMultiLLMBox,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;
      // console.log("AAGYA");

      // console.log("Backend return Data : ", res);

      if (data.success) {
        const results = data.data.results;

        // --- Normal LLM responses ---
        llmConfigs.forEach((llm) => {
          if (!visibleLLMs[llm.name]) return;
          const aiMessage = {
            id: Date.now() + "-" + llm.name,
            type: "ai",
            content: results[llm.model] || "⚠️ No response",
            time: new Date().toLocaleTimeString(),
          };
          setChatMessages((prev) => ({
            ...prev,
            [activeChat]: {
              ...prev[activeChat],
              [llm.name]: [...prev[activeChat][llm.name], aiMessage],
            },
          }));
          setIsTyping((prev) => ({
            ...prev,
            [activeChat]: {
              ...prev[activeChat],
              [llm.name]: false,
            },
          }));
        });

        // --- Multi-LLM response ---
        if (showMultiLLMBox && data.data.multiLLMResponse) {
          const multiLLMAIMessage = {
            id: Date.now() + "-multi",
            type: "ai",
            content: data.data.multiLLMResponse,
            time: new Date().toLocaleTimeString(),
            isMultiLLM: true, // Mark as Multi-LLM message
          };
          setMultiLLMMessages((prev) => [...prev, multiLLMAIMessage]);
          // console.log("Added AI response to Multi-LLM:", multiLLMAIMessage);
          setMultiLLMTyping(false);
        }
      }
    } catch (err) {
      setIsTyping(false);
      if (err.response) {
        if (err.response.status === 401) {
          alert("Inshufficient Creds❌❌❌");
        }
      }
      console.error("❌ Error in handleSubmit:", err);
    }
  };

  async function createChat() {
    try {
      const token = localStorage.getItem("token");
      const createChatResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/chat/`,
        {
          title: `New Chat`, // We'll update this after getting the response
          subtitle: "New Conversation",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!createChatResponse.data.success) {
        console.error("Failed to create chat:", createChatResponse.data.error);
        return;
      }

      // console.log("Created new chat:", createChatResponse.data);

      const data = createChatResponse.data.chat;
      // Create new chat object using MongoDB _id
      const newChat = {
        id: data._id,
        title: `Chat ${chats.length + 1}`, // Set the title based on current chat count
        subtitle: data.subtitle,
      };

      // Update the chat title in the backend
      // await axios.put(
      //   `${import.meta.env.VITE_BACKEND_URL}api/chat/${data._id}`,
      //   { title: newChat.title },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // Update local state
      setChats((prevChats) => {
        if (prevChats.some((c) => c.id === newChat.id)) return prevChats;
        return [...prevChats, newChat];
      });

      // Initialize messages for this new chat
      setChatMessages((prev) => ({
        ...prev,
        [newChat.id]: {
          ChatGPT: [],
          Gemini: [],
          DeepSeek: [],
          Perplexity: [],
          Lama: [],
        },
      }));

      // Initialize typing state for the new chat
      setIsTyping((prev) => ({
        ...prev,
        [newChat.id]: {
          ChatGPT: false,
          Gemini: false,
          DeepSeek: false,
          Perplexity: false,
          Lama: false,
        },
      }));

      // Set as active chat
      setActiveChat(newChat.id);

      return newChat;
    } catch (error) {
      console.error("Error creating new chat:", error);
      throw error;
    }
  }

  // get from db and push in chat
  async function getChats() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/chat/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && Array.isArray(response.data.chats)) {
        const loadedChats = response.data.chats.map((chat) => ({
          id: chat._id,
          title: chat.title || `Chat ${chats.length + 1}`,
          subtitle: chat.subtitle,
        }));

        // Set chats
        setChats(loadedChats);

        // Initialize message states for each chat
        const messageStates = {};
        const typingStates = {};
        loadedChats.forEach((chat) => {
          messageStates[chat.id] = {
            ChatGPT: [],
            Gemini: [],
            DeepSeek: [],
            Perplexity: [],
            Lama: [],
          };
          typingStates[chat.id] = {
            ChatGPT: false,
            Gemini: false,
            DeepSeek: false,
            Perplexity: false,
            Lama: false,
          };
        });

        setChatMessages(messageStates);
        setIsTyping(typingStates);

        // Set active chat to the first chat if available
        if (loadedChats.length > 0) {
          setActiveChat(loadedChats[0].id);
        } else {
          // If no chats exist, create a new one
          await createChat();
        }
      }
      // console.log("Loaded chats:", response.data);
    } catch (error) {
      console.error("Error loading chats:", error);
      // If there's an error loading chats, create a new one
      createChat();
    }
  }

  useEffect(() => {
    // Only fetch existing chats
    getChats();
  }, []);

  const handleNewChat = async () => {
    const token = localStorage.getItem("token");
    const createChat = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}api/chat/`,
      {
        title: `Chat ${chats.length + 1} `,
        // subtitle: "New Conversation",
        subtitle: "Creating test",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    const data = createChat.data.chat;
    // Example new chat object
    const newChat = {
      id: data._id,
      title: data.title,
      subtitle: data.subtitle,
    };

    // Push into chats

    setChats((prevChats) => {
      if (prevChats.some((c) => c.id === newChat.id)) return prevChats;
      return [...prevChats, newChat];
    });

    // Initialize messages for this new chat
    // Initialize messages and typing state for this new chat
    setChatMessages((prev) => ({
      ...prev,
      [newChat.id]: {
        ChatGPT: [],
        Gemini: [],
        DeepSeek: [],
        Perplexity: [],
        Lama: [],
      },
    }));
    // Initialize typing state for the new chat
    setIsTyping((prev) => ({
      ...prev,
      [newChat.id]: {
        ChatGPT: false,
        Gemini: false,
        DeepSeek: false,
        Perplexity: false,
        Lama: false,
      },
    }));

    setActiveChat(newChat.id);
  };

  const handleDeleteChat = async (chatId) => {
    if (chats.length <= 1) return;
    // console.log("delete ChatId :", chatId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}api/chat/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (err) {
      if (err.response) {
        alert("Cannot able to delete chat ", err);
      }
    }

    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);
    if (activeChat === chatId) {
      setActiveChat(updatedChats[0].id);
      setMessages({
        ChatGPT: [],
        Gemini: [],
        DeepSeek: [],
        Perplexity: [],
        Lama: [],
      });
    }
  };

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // First check local storage for quick response
        const payment = localStorage.getItem("paymentStatus");
        if (payment === "paid") {
          setPaymentDone(true);
        }

        // Then verify with backend
        const verifyPayment = await verifyPaymentStatus();
        if (verifyPayment) {
          setPaymentDone(true);
          localStorage.setItem("paymentStatus", "paid");
        } else {
          setPaymentDone(false);
          localStorage.removeItem("paymentStatus");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        if (err.response?.status === 401) {
          setPaymentDone(false);
          localStorage.removeItem("paymentStatus");
        }
      }
    };

    // Initial check
    checkPayment();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkPayment, 5 * 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, []); // Only run on mount

  const handleShare = async () => {
    if (!activeChat) {
      alert("No chat selected to share");
      return;
    }

    // Open share modal and pass current chat id/title
    const current = chats.find(
      (c) => c._id === activeChat || c.id === activeChat
    );
    const chatTitle = current?.title || "Untitled Chat";

    setIsShareModalOpen(true);
    setShareLink("");

    // Provide chatId and title to modal via props (ShareChatModal receives chatId, chatTitle)
    // The modal itself will call the backend endpoint to generate the share link
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />

      {/* Navbar */}
      <Navbar
        onShare={handleShare}
        isActiveChat={activeChat !== null}
        sidebarWidth={sidebarWidth}
      />

      {/* Share Modal */}
      <ShareChatModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        chatId={activeChat}
        chatTitle={
          (chats.find((c) => c._id === activeChat || c.id === activeChat) || {})
            .title
        }
      />

      {/* Sidebar */}
      <Sidebar
        sidebarWidth={sidebarWidth}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleMouseDown={handleMouseDown}
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        handleNewChat={handleNewChat}
        handleDeleteChat={handleDeleteChat}
        getClosedLLMs={getClosedLLMs}
        handleRestoreLLM={handleRestoreLLM}
        paymentDone={paymentDone}
        setPaymentDone={setPaymentDone}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative z-10 pt-16">
        {/* LLM Columns */}
        <div
          className="flex-1 grid gap-4 pl-6 pr-6 pt-2.5 pb-6 overflow-hidden "
          style={{
            gridTemplateColumns: `repeat(${
              getVisibleLLMs().length + (showMultiLLMBox ? 1 : 0)
            }, 1fr)`,
          }}
        >
          {/* Multi-LLM column appears first if enabled */}
          {showMultiLLMBox && (
            <LLMColumn
              key="Multi-LLM"
              name="Multi-LLM"
              model="multi-llm"
              color="bg-pink-600"
              messages={multiLLMMessages}
              isTyping={multiLLMTyping}
              onClose={() => setShowMultiLLMBox(false)}
              isVisible={true}
            />
          )}

          {/* Other LLMs */}
          {getVisibleLLMs().map((llm) => (
            <LLMColumn
              key={llm.name}
              name={llm.name}
              model={llm.model}
              color={llm.color}
              messages={chatMessages[activeChat]?.[llm.name] || []}
              isTyping={isTyping[activeChat]?.[llm.name]}
              onClose={handleCloseLLM}
              isVisible={visibleLLMs[llm.name]}
            />
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-md">
          <div className="flex gap-4">
            {/* Multi-LLM Button */}

            <button
              onClick={() => paymentDone && setShowMultiLLMBox((prev) => !prev)}
              disabled={!paymentDone}
              className="relative bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Multi-LLM
              {/* Overlay */}
              {!paymentDone && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                  <Lock className="text-white w-5 h-5" />
                </div>
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              placeholder="Ask all LLMs simultaneously..."
              className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
