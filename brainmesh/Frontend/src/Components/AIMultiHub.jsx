import React, { useEffect, useState, useRef } from "react";

// This single-file React component implements the UI you requested:
// - Left sidebar with app name (slide bar), "New Chat" button, chat list, and Upgrade plan
// - Main area with 5 columns (ChatGPT, Gemini, DeepSeek, Perplexity, CloudSonar)
// - A bottom input where user types and on submit the text is sent to all LLM columns
// - Simple particles background using react-tsparticles (placeholder)
// - Clean Tailwind-based styling (Tailwind must be enabled in your project)
// - Mocked LLM responses (replace with real API calls)

// NOTE: To make the particles work, install: react-tsparticles and tsparticles
// npm i react-tsparticles tsparticles
// Also ensure Tailwind CSS is configured for your React app.

import { FaRobot, FaBolt, FaSearch, FaCloud, FaCommentDots } from "react-icons/fa";
import Particles from "react-tsparticles";

const MODEL_NAMES = [
  "ChatGPT",
  "Gemini",
  "DeepSeek",
  "Perplexity",
  "CloudSonar",
];

function UpgradeCard() {
  return (
    <div className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/20">
      <h4 className="font-semibold">Upgrade Plan</h4>
      <p className="text-sm mt-2">Get priority answers, more tokens, and advanced features.</p>
      <ul className="mt-3 text-sm space-y-1">
        <li>• 100k monthly tokens</li>
        <li>• Lower latency</li>
        <li>• Team sharing</li>
      </ul>
      <button className="mt-4 w-full rounded-lg py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700">
        Upgrade
      </button>
    </div>
  );
}

function ChatList({ chats, selectedChatId, onSelect, onNewChat }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white">AI</div>
          <div className="font-semibold">AI MultiHub</div>
        </div>
        <button onClick={onNewChat} className="text-sm px-3 py-1 bg-white/20 rounded-md">
          + New Chat
        </button>
      </div>

      <div className="space-y-2">
        {chats.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors flex items-start gap-3 ${
              c.id === selectedChatId ? "bg-white/5 border-l-4 border-indigo-500" : ""
            }`}
          >
            <div className="text-sm font-medium">{c.title}</div>
            <div className="text-xs text-white/50">{c.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AIMultiHub() {
  const [chats, setChats] = useState([
    { id: "c1", title: "Chat 1: Brainstorm", subtitle: "Ideas & notes" },
    { id: "c2", title: "Chat 2: Project Section", subtitle: "Project plan & tasks" },
  ]);
  const [selectedChatId, setSelectedChatId] = useState(chats[0].id);

  // messages state keeps a mapping: chatId -> modelName -> array of messages
  const [messages, setMessages] = useState(() => {
    const init = {};
    chats.forEach((c) => (init[c.id] = MODEL_NAMES.reduce((acc, m) => ({ ...acc, [m]: [] }), {})));
    return init;
  });

  const [input, setInput] = useState("");
  const [loadingModels, setLoadingModels] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    // ensure messages structure contains the selected chat when a new chat is added
    setMessages((prev) => {
      const copy = { ...prev };
      chats.forEach((c) => {
        if (!copy[c.id]) copy[c.id] = MODEL_NAMES.reduce((acc, m) => ({ ...acc, [m]: [] }), {});
      });
      return copy;
    });
  }, [chats]);

  function handleNewChat() {
    const id = `c${Date.now()}`;
    const newChat = { id, title: `Chat ${chats.length + 1}`, subtitle: "New conversation" };
    setChats((s) => [newChat, ...s]);
    setSelectedChatId(id);
  }

  function addLocalMessage(chatId, model, role, text) {
    setMessages((prev) => {
      const next = { ...prev };
      if (!next[chatId]) next[chatId] = MODEL_NAMES.reduce((acc, m) => ({ ...acc, [m]: [] }), {});
      next[chatId][model] = [...(next[chatId][model] || []), { role, text }];
      return next;
    });
  }

  // Mock function that simulates calling each model and returning an answer.
  // Replace this with real API calls to ChatGPT, Gemini, etc.
  async function fetchResponsesForAllModels(prompt, chatId) {
    setLoadingModels(MODEL_NAMES.reduce((acc, m) => ({ ...acc, [m]: true }), {}));

    // Add the user's prompt locally for each model's conversation
    MODEL_NAMES.forEach((m) => addLocalMessage(chatId, m, "user", prompt));

    // Simulate staggered responses
    MODEL_NAMES.forEach((model, idx) => {
      const delay = 700 + idx * 400; // staggered timing for aesthetic
      setTimeout(() => {
        const fakeAnswer = `(${model}) Response to: "${prompt}" — this is a mocked reply. Replace with real API call.`;
        addLocalMessage(chatId, model, "assistant", fakeAnswer);
        setLoadingModels((prev) => ({ ...prev, [model]: false }));
      }, delay);
    });
  }

  function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    fetchResponsesForAllModels(text, selectedChatId);
    inputRef.current?.focus();
  }

  const currentMessages = messages[selectedChatId] || MODEL_NAMES.reduce((acc, m) => ({ ...acc, [m]: [] }), {});

  return (
    <div className="min-h-screen relative bg-[#0b1020] text-white font-sans">
      {/* Particles background */}
      <Particles
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: { events: { onHover: { enable: true, mode: "repulse" } } },
          particles: {
            number: { value: 40 },
            size: { value: { min: 1, max: 3 } },
            move: { enable: true, speed: 0.6 },
            color: { value: "#7c3aed" },
            links: { enable: true, color: "#7c3aed", opacity: 0.12 },
          },
        }}
        className="absolute inset-0 -z-10"
      />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar: 3 columns wide */}
          <aside className="col-span-3 bg-gradient-to-b from-white/4 to-white/2 rounded-2xl p-5 h-[80vh] sticky top-8 overflow-auto border border-white/10">
            <ChatList
              chats={chats}
              selectedChatId={selectedChatId}
              onSelect={setSelectedChatId}
              onNewChat={handleNewChat}
            />

            <div className="mt-6">
              <UpgradeCard />
            </div>

            <div className="mt-6 text-xs text-white/50">
              <div>Tip: Type in the box below and press Send. All columns will produce answers.</div>
            </div>
          </aside>

          {/* Middle + Right: 9 columns wide. We'll split into five equal columns inside. */}
          <main className="col-span-9">
            {/* Top slide bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">AI MultiHub</div>
                <div className="text-sm text-white/60">— Multi-LLM playground</div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/10">New Chat</button>
                <button className="px-4 py-2 rounded-lg bg-indigo-600">Sign In</button>
              </div>
            </div>

            {/* Five columns area */}
            <div className="grid grid-cols-5 gap-4 h-[62vh]">
              {MODEL_NAMES.map((m) => (
                <div key={m} className="bg-gradient-to-b from-white/3 to-white/2 rounded-xl p-3 flex flex-col border border-white/6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {m === "ChatGPT" && <FaRobot />}
                      {m === "Gemini" && <FaBolt />}
                      {m === "DeepSeek" && <FaSearch />}
                      {m === "Perplexity" && <FaCommentDots />}
                      {m === "CloudSonar" && <FaCloud />}
                      <div className="font-semibold ml-1">{m}</div>
                    </div>
                    <div className="text-xs text-white/50">{loadingModels[m] ? "Thinking..." : "Ready"}</div>
                  </div>

                  <div className="flex-1 overflow-auto pr-2 pb-2">
                    <div className="space-y-3">
                      {(currentMessages[m] || []).map((msg, i) => (
                        <div key={i} className={`${msg.role === "user" ? "text-sm text-white/70" : "bg-white/5 p-2 rounded-md text-sm"}`}>
                          <div className="font-medium text-xs text-white/60">{msg.role}</div>
                          <div className="mt-1 break-words">{msg.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-white/60">Model info • short summary</div>
                </div>
              ))}
            </div>

            {/* Bottom input area */}
            <form onSubmit={handleSend} className="mt-4 bg-white/3 rounded-lg p-3 flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here... (this will be sent to all models)"
                className="flex-1 min-h-[56px] bg-transparent resize-none outline-none p-2 text-sm"
              />
              <div className="flex flex-col gap-2">
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Clear all messages for the chat
                    setMessages((prev) => ({ ...prev, [selectedChatId]: MODEL_NAMES.reduce((acc, m) => ({ ...acc, [m]: [] }), {}) }));
                  }}
                  className="px-3 py-2 rounded-lg bg-white/10 text-sm"
                >
                  Clear
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
