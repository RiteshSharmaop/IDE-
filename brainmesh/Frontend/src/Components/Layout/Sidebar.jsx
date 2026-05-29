import React from "react";
import { Sparkles, Crown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ChatHistory from "../Chat/ChatHistory";
import { LOGO_URL, NAME } from "../../constants";
import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";

const Sidebar = ({
  sidebarWidth,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleMouseDown,
  chats,
  activeChat,
  setActiveChat,
  handleNewChat,
  handleDeleteChat,
  getClosedLLMs,
  handleRestoreLLM,
  paymentDone, 
  setPaymentDone 
}) => {
  return (
    <div
      className="bg-gray-800/30 backdrop-blur-md border-r border-gray-700/50 flex flex-col relative z-10 transition-all duration-300"
      style={{
        width: sidebarCollapsed ? "60px" : `${sidebarWidth}px`,
        minWidth: sidebarCollapsed ? "60px" : "200px",
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-4 -right-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1 z-20 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={26} className="cursor-pointer" />
        ) : (
          <ChevronLeft size={26} className="cursor-pointer" />
        )}
      </button>

      {!sidebarCollapsed ? (
        <>
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                {/* <Sparkles size={18} className="text-white" /> */}
                <iframe
                    src={LOGO_URL}
                    width="40"
                    height="40"
                    frameBorder="0"
                    className="giphy-embed rounded-2xl shadow-lg"
                    allowFullScreen
                    title="gif-chimpanzee"
                ></iframe>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {NAME}
              </h1>
            </div>

            {/* Upgrade Plan */}
            {!paymentDone && (
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2  mb-2">
                <Crown size={16} className="text-yellow-400" />
                <span className="font-semibold text-sm">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Unlock unlimited queries and advanced features
              </p>
              
             
              <Link
                to="/payment"
                className=" w-full bg-gradient-to-r from-purple-600 to-blue-600 
                          hover:from-purple-700 hover:to-blue-700 
                          text-white text-base font-medium 
                          py-2 px-1 rounded-xl transition-all shadow-md text-center block"
              >
                Upgrade Now
              </Link>
            </div>
            )}
          </div>

          {/* Chat History */}
          <div className="flex-1 p-4 overflow-y-auto">
            <ChatHistory
              chats={chats}
              activeChat={activeChat}
              onSelectChat={setActiveChat}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
            />
          </div>

          {/* Closed LLMs */}
          {getClosedLLMs().length > 0 && (
            <div className="p-4 border-t border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Closed LLMs
              </h3>
              <div className="space-y-2">
                {getClosedLLMs().map((llm) => (
                  <button
                    key={llm.name}
                    onClick={() => handleRestoreLLM(llm.name)}
                    className="w-full text-left p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>{llm.name}</span>
                    <Plus size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Collapsed Sidebar */
        <div className="p-2 flex flex-col items-center gap-4 mt-16">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <iframe
              src={LOGO_URL}
              width="40"
              height="40"
              frameBorder="0"
              className="giphy-embed rounded-2xl shadow-lg"
              allowFullScreen
              title="gif-chimpanzee"
              ></iframe>
          </div>

          {/* Log out */}
          <LogoutButton />


          <button
            onClick={handleNewChat}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* Resize Handle */}
      {!sidebarCollapsed && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-purple-500/50 transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

export default Sidebar;
