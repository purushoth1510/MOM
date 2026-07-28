import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchWithAuth } from "../services/api";

import {
  FaRobot,
  FaPaperPlane,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaBars,
} from "react-icons/fa";


function AIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    localStorage.getItem("username") || "User";

  const chatHistory = location.state?.chatHistory || [];

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState(chatHistory);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [conversationId, setConversationId] = useState(
    location.state?.conversationId || null
  );

  // Sidebar state
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const convoListRef = useRef(null);
  const [showSidebarFooter, setShowSidebarFooter] = useState(false);

  const hasFetchedPending = useRef(false);
  const messagesEndRef = useRef(null);

  const role = localStorage.getItem("role") || "employee";

  const suggestions = [
    "📄 Summarize my latest meeting",
    "📋 Show my pending tasks",
    "📋 Show my completed tasks",
    "📅 Show my meetings this week",
    "📧 Draft follow-up email",
    "📊 Show my meeting analytics",
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const handleConvoScroll = () => {
    const el = convoListRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    // show footer only when scrolled to bottom
    setShowSidebarFooter(atBottom);
  };

  // ensure footer visibility is correct on mount / when conversations change
  useEffect(() => {
    const el = convoListRef.current;
    if (!el) return;
    // run after a short delay to ensure layout settled
    const t = setTimeout(handleConvoScroll, 50);
    return () => clearTimeout(t);
  }, [conversations]);

  // If we arrived from the widget with a pending user message, auto-fetch the AI response
  useEffect(() => {
    if (hasFetchedPending.current) return;
    if (chatHistory.length === 0) return;

    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.sender !== "user") return;

    hasFetchedPending.current = true;

    const fetchPendingReply = async () => {
      try {
        setLoading(true);
        setChatError("");

        const body = { message: lastMsg.text };
        if (conversationId) {
          body.conversation_id = conversationId;
        }

        const response = await fetchWithAuth(
          "http://localhost:8000/api/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: data.reply },
          ]);
          setConversationId(data.conversation_id);
          loadConversations();
        } else {
          setChatError("Unable to reach AI Assistant. Please try again.");
        }
      } catch (error) {
        console.error(error);
        setChatError("Unable to reach AI Assistant. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const loadConversations = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetchWithAuth(
        "http://localhost:8000/api/chat/conversations"
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (convId) => {
    try {
      setLoading(true);
      setChatError("");
      const response = await fetchWithAuth(
        `http://localhost:8000/api/chat/conversations/${convId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setConversationId(convId);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/api/chat/conversations/${convId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        // If we deleted the active conversation, reset
        if (conversationId === convId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setPrompt("");
    setChatError("");
  };


  const sendMessage = async (messageToSend) => {
    if (loading) return;
    
    const text = typeof messageToSend === "string" ? messageToSend : prompt;
    if (!text.trim()) return;

    const userMessage = {
      sender: "user",
      text: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    
    if (typeof messageToSend !== "string") {
      setPrompt("");
    }

    try {
      setLoading(true);
      setChatError("");

      const body = { message: text };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      const response = await fetchWithAuth(
        "http://localhost:8000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
          },
        ]);
        setConversationId(data.conversation_id);
        loadConversations();
      } else {
        setChatError("Unable to reach AI Assistant. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setChatError("Unable to reach AI Assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // Group conversations by date
  const groupConversations = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = { today: [], yesterday: [], week: [], older: [] };

    conversations.forEach((conv) => {
      // Parse "YYYY-MM-DD HH:MM" format
      const convDate = new Date(conv.updated_at.replace(" ", "T"));
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= weekAgo) {
        groups.week.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const grouped = groupConversations();

  const renderConvGroup = (label, convs) => {
    if (convs.length === 0) return null;
    return (
      <div className="mb-1" key={label}>
        <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        {convs.map((conv) => (
          <div
            key={conv.id}
            onClick={() => loadConversation(conv.id)}
            className={`group flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
              conversationId === conv.id
                ? "bg-green-50 text-green-700 border-l-2 border-green-500"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg className="flex-shrink-0 w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="flex-1 text-sm truncate">{conv.title}</span>
            <button
              onClick={(e) => deleteConversation(conv.id, e)}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    );
  };


  return (

    <div className="min-h-screen bg-[#edf4f1] flex">

      {/* Sidebar — Light Theme */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 flex flex-col overflow-hidden flex-shrink-0 bg-white border-r border-gray-200`}
      >
        {/* Conversation List */}
        <div ref={convoListRef} onScroll={handleConvoScroll} className="flex-1 overflow-y-auto flex flex-col">
          {loadingHistory ? (
            <div className="p-6 text-center text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-gray-400 max-w-[220px]">
                <svg className="mx-auto w-14 h-14 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-base font-semibold text-gray-500 mb-1">No conversations yet</p>
                <p className="text-xs text-gray-300">Start a chat to see history</p>
              </div>
            </div>
          ) : (
            <>
              {renderConvGroup("Today", grouped.today)}
              {renderConvGroup("Yesterday", grouped.yesterday)}
              {renderConvGroup("Previous 7 Days", grouped.week)}
              {renderConvGroup("Older", grouped.older)}
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-3 flex-shrink-0 border-t border-gray-200 transition-all duration-200 ${conversations.length > 0 && showSidebarFooter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-white flex-shrink-0"
          style={{ borderBottom: "1px solid #e8e8ed" }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <FaBars />
              )}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 text-sm"
            >
              <FaArrowLeft className="text-xs" />
              Dashboard
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FaRobot className="text-green-600" />
            <h1 className="text-lg font-bold text-gray-800">
              MoM AI Assistant
            </h1>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-sm"
          >
            <FaPlus className="text-xs" />
            New Chat
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col relative">
          <div className="flex-1 max-w-4xl mx-auto w-full px-6 flex flex-col">

            {chatError && (
              <div className="mt-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                {chatError}
              </div>
            )}

            {/* Greeting */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col justify-center items-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                  <FaRobot className="text-3xl text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-3">
                  Hi {displayName},<br/>how can I help today?
                </h1>
                <p className="text-gray-500 text-center mb-10">Your personal meeting assistant</p>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(item)}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-green-300 hover:bg-green-50 transition-all text-left flex items-center gap-3 group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-800">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="flex-1 py-8 space-y-8 pb-8">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mr-4 mt-1 shadow-sm">
                        <FaRobot className="text-white text-xs" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-5 py-3.5 ${
                        message.sender === "user"
                          ? "bg-green-600 text-white rounded-2xl rounded-tr-sm shadow-md"
                          : "bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <div
                          className="leading-relaxed space-y-3 prose prose-sm max-w-none text-gray-700 ai-chat-content"
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        />
                      ) : (
                        <p className="leading-relaxed text-sm font-medium">
                          {message.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start items-start">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mr-4 mt-1 shadow-sm">
                      <FaRobot className="text-white text-xs" />
                    </div>
                    <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Unified Bottom Chat Input */}
        <div className="bg-transparent p-4 sm:p-6 flex-shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 flex items-center px-4 py-2 transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:border-green-400">
              <input
                type="text"
                placeholder="Message MoM Assistant..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !loading) sendMessage(); }}
                className="flex-1 outline-none text-base text-gray-700 py-3 bg-transparent placeholder-gray-400 font-medium"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !prompt.trim()}
                className="ml-3 w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:hover:scale-100 hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <FaPaperPlane className="text-sm ml-[-2px]" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3 font-medium">MoM Assistant can make mistakes. Consider verifying important information.</p>
          </div>
        </div>

      </div>

    </div>

  );

}

export default AIAssistant;