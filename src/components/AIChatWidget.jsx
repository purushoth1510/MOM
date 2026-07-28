import { useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "../services/api";
import { FaRobot, FaPaperPlane, FaTimes, FaExpand } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AIChatWidget() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "employee";
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Only show for employees
  if (role === "admin" || role === "super_admin") return null;

  const sendMessage = async () => {
    if (loading) return;
    
    const text = prompt.trim();
    if (!text) return;

    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      setLoading(true);
      setChatError("");

      const body = { message: text };
      if (conversationId) body.conversation_id = conversationId;

      const response = await fetchWithAuth("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
        setConversationId(data.conversation_id);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[370px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "500px", border: "1px solid #e5e7eb" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                <FaRobot className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-800 text-sm">MoM AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/ai-assistant", { state: { chatHistory: messages, conversationId } })}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Open full view"
              >
                <FaExpand className="text-xs" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Close"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <FaRobot className="text-green-500 text-3xl" />
                </div>
                <p className="text-gray-400 text-sm">Ask anything about your meetings.</p>
              </div>
            )}

            {chatError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-xs">
                {chatError}
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    message.sender === "user"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.sender === "ai" ? (
                    <div
                      className="leading-6 space-y-1 ai-chat-content"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                    />
                  ) : (
                    <p className="leading-6">{message.text}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FaRobot className="text-green-500 text-sm" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <input
                type="text"
                placeholder="Ask anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !prompt.trim()}
                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999] group">
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-3 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg font-medium">
            AI Assistant
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            isOpen
              ? "bg-gray-700 hover:bg-gray-800"
              : "bg-green-600 hover:bg-green-700 animate-initial-pulse"
          }`}
        >
          {isOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaRobot className="text-2xl" />
          )}
        </button>
      </div>
    </>
  );
}

export default AIChatWidget;
