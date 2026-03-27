// components/Chat/ChatPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, MessageSquare, ArrowLeft, Circle, MoreVertical, Phone, Video,
} from "lucide-react";
import {
  getMyChatsAction,
  getOrCreateChatAction,
  getChatMessagesAction,
  setActiveChatAction,
  receiveMessageAction,
  updateChatLastMessage,
  setOnlineUsersAction,
  setTypingAction,
  clearTypingAction,
  markChatReadAction,
} from "../../actions/chatAction";
import { connectSocket, disconnectSocket, getSocket } from "../../utils/socket";
import SpinLoader from "../layout/SpinLoader";

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000)   return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const fullTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

const dayLabel = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return "Today";
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Avatar with online dot ─────────────────────────────────────────────────
const Avatar = ({ user, size = 10, online = false }) => (
  <div className="relative shrink-0">
    <div className={`absolute -inset-0.5 rounded-full`}
      style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }} />
    <img src={user?.avatar || "/photo.jpg"} alt=""
      className={`relative w-${size} h-${size} rounded-full object-cover`}
      style={{ zIndex: 1, width: size * 4, height: size * 4 }} />
    {online && (
      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
        style={{ background: "#22c55e", borderColor: "#0a0c18", zIndex: 2 }} />
    )}
  </div>
);

export default function ChatPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { userId } = useParams();   // optional — open chat with this user directly

  const { user }                     = useSelector((s) => s.user);
  const { chats, isLoading: listLoading } = useSelector((s) => s.myChats);
  const { chat: activeChat, messages, isLoading: msgLoading } = useSelector((s) => s.activeChat);
  const { onlineUsers, typing }      = useSelector((s) => s.chatPresence);

  const [input,       setInput]       = useState("");
  const [search,      setSearch]      = useState("");
  const [mobileView,  setMobileView]  = useState("list"); // "list" | "chat"
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const inputRef       = useRef(null);

  // ── Connect socket once on mount ─────────────────────────────────────────
  useEffect(() => {
    dispatch(getMyChatsAction());
    const socket = connectSocket();

    socket.on("online_users",   (users)   => dispatch(setOnlineUsersAction(users)));
    socket.on("receive_message",(msg)     => {
      dispatch(receiveMessageAction(msg));
      dispatch(updateChatLastMessage({ chatId: msg.chat, lastMessage: msg, lastMessageAt: msg.createdAt }));
    });
    socket.on("chat_updated",   (data)    => dispatch(updateChatLastMessage(data)));
    socket.on("typing_start",   (data)    => dispatch(setTypingAction(data)));
    socket.on("typing_stop",    (data)    => dispatch(clearTypingAction(data)));

    return () => {
      disconnectSocket();
    };
  }, [dispatch]);

  // ── If userId param provided, open that chat immediately ─────────────────
  useEffect(() => {
    if (userId) {
      dispatch(getOrCreateChatAction(userId)).then((chat) => {
        if (chat) openChat(chat);
      });
    }
  }, [userId]);

  // ── Scroll to bottom on new message ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Open a chat room ──────────────────────────────────────────────────────
  const openChat = useCallback((chat) => {
    dispatch(setActiveChatAction(chat));
    dispatch(getChatMessagesAction(chat._id));
    dispatch(markChatReadAction(chat._id));
    const socket = getSocket();
    if (socket) {
      socket.emit("join_chat",  chat._id);
      socket.emit("mark_read",  chat._id);
    }
    setMobileView("chat");
  }, [dispatch]);

  // ── Get the "other" participant in a chat ─────────────────────────────────
  const getOther = (chat) =>
    chat?.participants?.find((p) => p._id !== user?._id);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const socket = getSocket();
    if (socket) {
      socket.emit("send_message", { chatId: activeChat._id, content: input.trim() });
      socket.emit("typing_stop",  { chatId: activeChat._id });
    }
    setInput("");
    clearTimeout(typingTimer.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeChat) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing_start", { chatId: activeChat._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { chatId: activeChat._id });
    }, 1500);
  };

  // ── Filter chats by search ────────────────────────────────────────────────
  const filteredChats = (chats || []).filter((c) => {
    const other = getOther(c);
    return !search || other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const isOtherTyping = activeChat && typing[activeChat._id];

  // ── Group messages by date ────────────────────────────────────────────────
  const groupedMessages = (messages || []).reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
      acc.push({ type: "date", label: dayLabel(msg.createdAt), id: `d-${i}` });
    }
    acc.push({ type: "msg", ...msg });
    return acc;
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex rounded-2xl overflow-hidden"
      style={{ fontFamily: "'DM Sans',sans-serif", background: "rgba(13,12,28,0.95)", border: "1px solid rgba(99,102,241,0.18)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .chat-item{transition:background .15s,border-color .15s;}
        .chat-item:hover{background:rgba(99,102,241,0.08)!important;border-color:rgba(99,102,241,0.2)!important;}
        .chat-item.active{background:linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.1))!important;border-color:rgba(99,102,241,0.35)!important;}
        input::placeholder,textarea::placeholder{color:rgba(100,116,139,0.55);}
        .msg-bubble-mine{background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:18px 4px 18px 18px;}
        .msg-bubble-other{background:rgba(30,27,75,0.8);border:1px solid rgba(99,102,241,0.18);border-radius:4px 18px 18px 18px;}
        .scrollbar::-webkit-scrollbar{width:4px;}
        .scrollbar::-webkit-scrollbar-track{background:transparent;}
        .scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px;}
        @keyframes bounce3{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .typing-dot{animation:bounce3 1.2s ease-in-out infinite;}
        .typing-dot:nth-child(2){animation-delay:.2s;}
        .typing-dot:nth-child(3){animation-delay:.4s;}
      `}</style>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <div className={`flex flex-col border-r w-full md:w-80 lg:w-96 shrink-0 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
        style={{ borderColor: "rgba(99,102,241,0.15)" }}>

        {/* Sidebar header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="grad-text text-xl font-bold">Messages</h2>
            <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(100,116,139,0.55)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 outline-none text-slate-300 text-sm"
              style={{ background: "rgba(30,27,75,0.5)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 10 }} />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto scrollbar py-2 px-2">
          {listLoading && <div className="flex justify-center mt-8"><SpinLoader /></div>}

          {!listLoading && !filteredChats.length && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <MessageSquare size={24} style={{ color: "rgba(99,102,241,0.5)" }} />
              </div>
              <p className="text-slate-500 font-medium text-sm">No conversations yet</p>
              <p className="text-slate-600 text-xs mt-1">Visit a user's profile and start a chat</p>
            </div>
          )}

          {filteredChats.map((chat) => {
            const other    = getOther(chat);
            const isOnline = onlineUsers.includes(other?._id);
            const isActive = activeChat?._id === chat._id;
            const lastMsg  = chat.lastMessage;
            const isMine   = lastMsg?.sender === user?._id || lastMsg?.sender?._id === user?._id;

            return (
              <div key={chat._id} onClick={() => openChat(chat)}
                className={`chat-item flex items-center gap-3 px-3 py-3 rounded-xl mb-1 cursor-pointer ${isActive ? "active" : ""}`}
                style={{ border: "1px solid transparent" }}>

                <Avatar user={other} size={11} online={isOnline} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-slate-200 font-semibold text-sm truncate">{other?.name || "User"}</p>
                    <span className="text-slate-600 shrink-0 ml-2" style={{ fontSize: "0.65rem" }}>
                      {fmt(chat.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-xs truncate" style={{ maxWidth: "80%" }}>
                      {typing[chat._id]
                        ? <span style={{ color: "#818cf8" }}>typing...</span>
                        : lastMsg
                          ? `${isMine ? "You: " : ""}${lastMsg.content || ""}`
                          : <span style={{ color: "rgba(148,163,184,0.4)" }}>Start a conversation</span>
                      }
                    </p>
                    {/* role badge */}
                    <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-md ml-1 capitalize"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", fontSize: "0.6rem" }}>
                      {other?.role}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════ CHAT PANE ══════════════════ */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>

        {!activeChat ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))", border: "1px solid rgba(99,102,241,0.2)" }}>
              <MessageSquare size={36} style={{ color: "rgba(99,102,241,0.5)" }} />
            </div>
            <div className="text-center">
              <p className="grad-text text-xl font-bold mb-1">Your Messages</p>
              <p className="text-slate-500 text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
              {/* Mobile back */}
              <button className="md:hidden mr-1 text-slate-400" onClick={() => setMobileView("list")}>
                <ArrowLeft size={18} />
              </button>

              {(() => {
                const other    = getOther(activeChat);
                const isOnline = onlineUsers.includes(other?._id);
                return (
                  <>
                    <Avatar user={other} size={10} online={isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-100 font-bold text-sm leading-tight">{other?.name}</p>
                      <p className="text-xs" style={{ color: isOnline ? "#22c55e" : "rgba(148,163,184,0.45)" }}>
                        {isOnline ? "● Online" : "● Offline"}
                        <span className="ml-2 capitalize" style={{ color: "rgba(148,163,184,0.4)" }}>{other?.role}</span>
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto scrollbar px-4 py-4 space-y-1">
              {msgLoading && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full typing-dot"
                        style={{ background: "#818cf8", animationDelay: `${i*0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {groupedMessages.map((item) => {
                if (item.type === "date") return (
                  <div key={item.id} className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: "rgba(99,102,241,0.12)" }} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(99,102,241,0.1)", color: "rgba(148,163,184,0.5)" }}>
                      {item.label}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "rgba(99,102,241,0.12)" }} />
                  </div>
                );

                const isMine = item.sender?._id === user?._id || item.sender === user?._id;
                return (
                  <motion.div key={item._id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>

                    {!isMine && (
                      <img src={item.sender?.avatar || "/photo.jpg"} alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                        style={{ border: "1px solid rgba(99,102,241,0.3)" }} />
                    )}

                    <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMine ? "msg-bubble-mine text-white" : "msg-bubble-other text-slate-200"}`}>
                        {item.content}
                      </div>
                      <span className="text-slate-600 px-1" style={{ fontSize: "0.62rem" }}>
                        {fullTime(item.createdAt)}
                        {isMine && (
                          <span className="ml-1" style={{ color: item.isRead ? "#818cf8" : "rgba(148,163,184,0.4)" }}>
                            {item.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {isOtherTyping && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="flex items-end gap-2 mb-2">
                    <div className="msg-bubble-other px-4 py-3 flex items-center gap-1.5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full typing-dot"
                          style={{ background: "#818cf8", animationDelay: `${i*0.2}s` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}>
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 outline-none text-slate-200 text-sm resize-none"
                    style={{
                      background: "rgba(30,27,75,0.55)",
                      border: "1px solid rgba(99,102,241,0.22)",
                      borderRadius: 14,
                      maxHeight: 120,
                      lineHeight: "1.5",
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg,#6366f1,#a855f7)"
                      : "rgba(30,27,75,0.4)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    boxShadow: input.trim() ? "0 0 20px rgba(99,102,241,0.35)" : "none",
                  }}>
                  <Send size={16} style={{ color: input.trim() ? "#fff" : "rgba(148,163,184,0.4)" }} />
                </motion.button>
              </div>
              <p className="text-slate-700 text-xs mt-2 px-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}