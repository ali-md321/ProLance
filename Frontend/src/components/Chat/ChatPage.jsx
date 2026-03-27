// components/Chat/ChatPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, MessageSquare, ArrowLeft } from "lucide-react";
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

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso), now = new Date(), diff = now - d;
  if (diff < 60000)    return "now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};
const fullTime  = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const dayLabel  = (iso) => {
  const d = new Date(iso), now = new Date();
  if (isSameDay(d, now)) return "Today";
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (isSameDay(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Avatar = ({ user, size = 40, online = false, unread = false }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div className="absolute -inset-0.5 rounded-full"
      style={{ background: unread
        ? "linear-gradient(135deg,#818cf8,#c084fc)"
        : "linear-gradient(135deg,rgba(99,102,241,0.4),rgba(168,85,247,0.25))" }} />
    <img src={user?.avatar || "/photo.jpg"} alt=""
      className="relative rounded-full object-cover w-full h-full" style={{ zIndex: 1 }} />
    {online && (
      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
        style={{ background: "#22c55e", borderColor: "#0a0c18", zIndex: 2 }} />
    )}
  </div>
);

export default function ChatPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { userId } = useParams();

  const { user }                                              = useSelector((s) => s.user);
  const { chats, isLoading: listLoading }                    = useSelector((s) => s.myChats);
  const { chat: activeChat, messages, isLoading: msgLoading } = useSelector((s) => s.activeChat);
  const { onlineUsers, typing }                              = useSelector((s) => s.chatPresence);

  const [input,      setInput]      = useState("");
  const [search,     setSearch]     = useState("");
  const [mobileView, setMobileView] = useState("list");
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const inputRef       = useRef(null);
  const autoOpenedRef  = useRef(false);

  useEffect(() => {
    dispatch(getMyChatsAction());
    const socket = connectSocket();
    socket.on("online_users",    (u) => dispatch(setOnlineUsersAction(u)));
    socket.on("receive_message", (m) => {
      dispatch(receiveMessageAction(m));
      dispatch(updateChatLastMessage({ chatId: m.chat, lastMessage: m, lastMessageAt: m.createdAt }));
    });
    socket.on("chat_updated",    (d) => dispatch(updateChatLastMessage(d)));
    socket.on("typing_start",    (d) => dispatch(setTypingAction(d)));
    socket.on("typing_stop",     (d) => dispatch(clearTypingAction(d)));
    return () => disconnectSocket();
  }, [dispatch]);

  useEffect(() => {
    if (activeChat && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      dispatch(getChatMessagesAction(activeChat._id));
      dispatch(markChatReadAction(activeChat._id));
      const s = connectSocket();
      s.emit("join_chat", activeChat._id);
      s.emit("mark_read", activeChat._id);
      setMobileView("chat");
    }
  }, [activeChat, dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(getOrCreateChatAction(userId)).then((chat) => {
        if (chat) openChat(chat);
      });
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = useCallback((chat) => {
    autoOpenedRef.current = true;
    dispatch(setActiveChatAction(chat));
    dispatch(getChatMessagesAction(chat._id));
    dispatch(markChatReadAction(chat._id));
    const s = getSocket();
    if (s) { s.emit("join_chat", chat._id); s.emit("mark_read", chat._id); }
    setMobileView("chat");
  }, [dispatch]);

  const closeChat = useCallback(() => {
    autoOpenedRef.current = false;
    dispatch(setActiveChatAction(null));
    setMobileView("list");
  }, [dispatch]);

  const getOther = (chat) => chat?.participants?.find((p) => p._id !== user?._id);

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const s = getSocket();
    if (s) {
      s.emit("send_message", { chatId: activeChat._id, content: input.trim() });
      s.emit("typing_stop",  { chatId: activeChat._id });
    }
    setInput("");
    clearTimeout(typingTimer.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeChat) return;
    const s = getSocket();
    if (!s) return;
    s.emit("typing_start", { chatId: activeChat._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => s.emit("typing_stop", { chatId: activeChat._id }), 1500);
  };

  const filteredChats = (chats || []).filter((c) => {
    const o = getOther(c);
    return !search || o?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const isOtherTyping = activeChat && typing[activeChat._id];

  const groupedMessages = (messages || []).reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    if (!prev || !isSameDay(prev.createdAt, msg.createdAt))
      acc.push({ type: "date", label: dayLabel(msg.createdAt), id: `d-${i}` });
    acc.push({ type: "msg", ...msg });
    return acc;
  }, []);

  const getUnreadCount = (chat) => {
    const counts = chat.unreadCounts;
    if (!counts || !user?._id) return 0;
    if (counts instanceof Map) return counts.get(user._id) || 0;
    if (typeof counts === "object") return counts[user._id] || 0;
    return 0;
  };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:"#0a0c18", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .cp-sidebar{width:300px;flex-shrink:0;display:flex;flex-direction:column;background:rgba(13,12,28,0.98);border-right:1px solid rgba(99,102,241,0.13);}
        .cp-pane{flex:1;display:flex;flex-direction:column;min-width:0;height:100%;}
        @media(max-width:767px){
          .cp-sidebar{width:100%;}
          .cp-sidebar.mob-hide{display:none;}
          .cp-pane.mob-hide{display:none;}
        }
        .ci{display:flex;align-items:center;gap:11px;padding:10px 10px;border-radius:13px;cursor:pointer;transition:background .15s,border-color .15s;border:1px solid transparent;margin-bottom:2px;position:relative;overflow:hidden;}
        .ci:hover{background:rgba(99,102,241,0.07);border-color:rgba(99,102,241,0.18);}
        .ci.ci-active{background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.11));border-color:rgba(99,102,241,0.38);}
        .ci.ci-unread{background:rgba(99,102,241,0.055);border-color:rgba(99,102,241,0.2);}
        .ci.ci-unread::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,#818cf8,#c084fc);box-shadow:0 0 8px rgba(129,140,248,0.6);}
        .ubadge{min-width:19px;height:19px;border-radius:10px;padding:0 5px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-size:.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(99,102,241,0.45);flex-shrink:0;animation:bp .22s cubic-bezier(.34,1.56,.64,1);}
        @keyframes bp{from{transform:scale(.4);opacity:0;}to{transform:scale(1);opacity:1;}}
        .schip{font-size:.6rem;font-weight:600;padding:2px 7px;border-radius:6px;text-transform:capitalize;flex-shrink:0;background:rgba(99,102,241,0.1);color:rgba(165,180,252,0.6);border:1px solid rgba(99,102,241,0.15);}
        .si{width:100%;padding:8px 12px 8px 34px;background:rgba(20,19,40,0.7);border:1px solid rgba(99,102,241,0.16);border-radius:11px;outline:none;color:#cbd5e1;font-size:.82rem;transition:border-color .2s;}
        .si:focus{border-color:rgba(99,102,241,0.45);}
        .si::placeholder{color:rgba(100,116,139,.5);}
        .msgs{flex:1;overflow-y:auto;padding:14px 16px 8px;display:flex;flex-direction:column;gap:1px;}
        .msgs::-webkit-scrollbar{width:4px;}
        .msgs::-webkit-scrollbar-track{background:transparent;}
        .msgs::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.22);border-radius:99px;}
        .bm{padding:9px 14px;font-size:.875rem;line-height:1.55;word-break:break-word;}
        .bm-me{background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:18px 4px 18px 18px;color:#fff;}
        .bm-other{background:rgba(25,22,55,0.9);border:1px solid rgba(99,102,241,0.18);border-radius:4px 18px 18px 18px;color:#e2e8f0;}
        .ddiv{display:flex;align-items:center;gap:10px;margin:14px 0 8px;}
        .ddiv::before,.ddiv::after{content:'';flex:1;height:1px;background:rgba(99,102,241,0.1);}
        .ddiv span{font-size:.67rem;font-weight:600;color:rgba(148,163,184,.4);padding:3px 10px;background:rgba(99,102,241,0.07);border-radius:99px;white-space:nowrap;}
        .minput{width:100%;padding:11px 14px;background:rgba(18,16,38,.85);border:1px solid rgba(99,102,241,0.2);border-radius:14px;outline:none;color:#e2e8f0;font-size:.875rem;resize:none;line-height:1.5;max-height:120px;transition:border-color .2s;}
        .minput:focus{border-color:rgba(99,102,241,.45);}
        .minput::placeholder{color:rgba(100,116,139,.5);}
        .sbtn{width:43px;height:43px;border-radius:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all .2s;}
        .sbtn-on{background:linear-gradient(135deg,#6366f1,#a855f7);box-shadow:0 0 18px rgba(99,102,241,.4);}
        .sbtn-off{background:rgba(30,27,75,.5);border:1px solid rgba(99,102,241,.14);cursor:not-allowed;}
        @keyframes td{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        .td{animation:td 1.2s ease-in-out infinite;}
        .td:nth-child(2){animation-delay:.15s;}
        .td:nth-child(3){animation-delay:.3s;}
      `}</style>

      {/* ═══ SIDEBAR ═══ */}
      <div className={`cp-sidebar ${mobileView === "chat" ? "mob-hide" : ""}`}>

        {/* Header */}
        <div style={{ padding:"18px 14px 12px", borderBottom:"1px solid rgba(99,102,241,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <h2 className="grad" style={{ fontSize:"1.2rem", fontWeight:800, lineHeight:1 }}>Messages</h2>
              <p style={{ fontSize:".7rem", color:"rgba(148,163,184,.4)", marginTop:3, fontWeight:500 }}>
                {filteredChats.length} conversation{filteredChats.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99,
              background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" }}/>
              <span style={{ fontSize:".68rem", fontWeight:600, color:"#4ade80" }}>{onlineUsers.length} online</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position:"relative" }}>
            <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(100,116,139,.5)", pointerEvents:"none" }}/>
            <input className="si" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…"/>
          </div>
        </div>

        {/* List */}
        <div className="msgs" style={{ padding:"6px 6px" }}>
          {listLoading && <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}><SpinLoader /></div>}

          {!listLoading && !filteredChats.length && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"50px 20px", textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14,
                background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
                <MessageSquare size={22} style={{ color:"rgba(99,102,241,.45)" }}/>
              </div>
              <p style={{ color:"#64748b", fontWeight:600, fontSize:".875rem", marginBottom:3 }}>No conversations yet</p>
              <p style={{ color:"rgba(100,116,139,.45)", fontSize:".75rem" }}>Start a chat from any profile or proposal</p>
            </div>
          )}

          {filteredChats.map((chat) => {
            const other     = getOther(chat);
            const isOnline  = onlineUsers.includes(other?._id);
            const isActive  = activeChat?._id === chat._id;
            const unread    = getUnreadCount(chat);
            const hasUnread = unread > 0 && !isActive;
            const lastMsg   = chat.lastMessage;
            const isMine    = lastMsg?.sender === user?._id || lastMsg?.sender?._id === user?._id;
            const isTyping  = typing[chat._id];

            return (
              <div key={chat._id}
                onClick={() => openChat(chat)}
                className={`ci ${isActive ? "ci-active" : ""} ${hasUnread ? "ci-unread" : ""}`}>
                <Avatar user={other} size={44} online={isOnline} unread={hasUnread}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                    <p style={{ color: hasUnread ? "#e2e8f0" : "#94a3b8", fontWeight: hasUnread ? 700 : 500,
                      fontSize:".875rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>
                      {other?.name || "User"}
                    </p>
                    <span style={{ fontSize:".64rem", flexShrink:0, marginLeft:4,
                      color: hasUnread ? "rgba(129,140,248,.85)" : "rgba(100,116,139,.5)",
                      fontWeight: hasUnread ? 600 : 400 }}>
                      {fmt(chat.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:5 }}>
                    <p style={{ fontSize:".76rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1,
                      color: isTyping ? "#818cf8" : hasUnread ? "rgba(203,213,225,.75)" : "rgba(100,116,139,.65)",
                      fontWeight: hasUnread ? 500 : 400 }}>
                      {isTyping ? "typing…" : lastMsg ? `${isMine ? "You: " : ""}${lastMsg.content || ""}` : "Start a conversation"}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      {hasUnread && <span className="ubadge">{unread > 99 ? "99+" : unread}</span>}
                      <span className="schip">{other?.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ CHAT PANE ═══ */}
      <div className={`cp-pane ${mobileView === "list" ? "mob-hide" : ""}`}>

        {!activeChat ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:32, height:"100%" }}>
            <motion.div animate={{ scale:[1,1.04,1] }} transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }}
              style={{ width:84, height:84, borderRadius:26, display:"flex", alignItems:"center", justifyContent:"center",
                background:"linear-gradient(135deg,rgba(99,102,241,0.13),rgba(168,85,247,0.08))",
                border:"1px solid rgba(99,102,241,0.2)", boxShadow:"0 0 36px rgba(99,102,241,0.09)" }}>
              <MessageSquare size={38} style={{ color:"rgba(99,102,241,.5)" }}/>
            </motion.div>
            <div style={{ textAlign:"center" }}>
              <p className="grad" style={{ fontSize:"1.3rem", fontWeight:800, marginBottom:8 }}>Your Messages</p>
              <p style={{ color:"rgba(100,116,139,.65)", fontSize:".875rem", lineHeight:1.6 }}>
                Select a conversation or start one<br/>from any profile or proposal
              </p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              {[{ val:filteredChats.length, label:"Chats" },{ val:onlineUsers.length, label:"Online" }].map(({ val, label }) => (
                <div key={label} style={{ padding:"10px 20px", borderRadius:12, textAlign:"center",
                  background:"rgba(30,27,75,.45)", border:"1px solid rgba(99,102,241,.14)" }}>
                  <p style={{ color:"#a5b4fc", fontWeight:700, fontSize:"1.05rem", fontFamily:"'Syne',sans-serif" }}>{val}</p>
                  <p style={{ color:"rgba(100,116,139,.55)", fontSize:".7rem", marginTop:2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            {(() => {
              const other = getOther(activeChat);
              const isOnline = onlineUsers.includes(other?._id);
              return (
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                  borderBottom:"1px solid rgba(99,102,241,0.12)",
                  background:"rgba(13,12,28,0.85)", backdropFilter:"blur(12px)", flexShrink:0 }}>

                  <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.92 }}
                    onClick={closeChat}
                    style={{ width:34, height:34, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, cursor:"pointer", background:"rgba(99,102,241,0.1)",
                      border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
                    <ArrowLeft size={15}/>
                  </motion.button>

                  <Avatar user={other} size={38} online={isOnline}/>

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:"#e2e8f0", fontWeight:700, fontSize:".875rem", lineHeight:1.2,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {other?.name}
                    </p>
                    <p style={{ fontSize:".7rem", marginTop:2, fontWeight:500 }}>
                      {isOtherTyping
                        ? <span style={{ color:"#818cf8" }}>typing…</span>
                        : <span style={{ color: isOnline ? "#4ade80" : "rgba(148,163,184,.4)" }}>
                            {isOnline ? "● Online" : "● Offline"}
                            <span style={{ color:"rgba(148,163,184,.3)", marginLeft:8, textTransform:"capitalize" }}>{other?.role}</span>
                          </span>
                      }
                    </p>
                  </div>

                  <span style={{ padding:"4px 11px", borderRadius:8, fontSize:".7rem", fontWeight:600,
                    textTransform:"capitalize", flexShrink:0,
                    background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
                    {other?.role}
                  </span>
                </div>
              );
            })()}

            {/* Messages */}
            <div className="msgs">
              {msgLoading && (
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, padding:"32px 0" }}>
                  {[0,1,2].map(i => <div key={i} className="td" style={{ width:8, height:8, borderRadius:"50%", background:"#818cf8", animationDelay:`${i*.15}s` }}/>)}
                </div>
              )}

              {!msgLoading && messages?.length === 0 && (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", textAlign:"center" }}>
                  <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12,
                    background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.18)" }}>
                    <MessageSquare size={20} style={{ color:"rgba(99,102,241,.4)" }}/>
                  </div>
                  <p style={{ color:"#64748b", fontWeight:600, fontSize:".875rem", marginBottom:3 }}>No messages yet</p>
                  <p style={{ color:"rgba(100,116,139,.45)", fontSize:".78rem" }}>Be the first to say hello 👋</p>
                </div>
              )}

              {groupedMessages.map((item) => {
                if (item.type === "date") return (
                  <div key={item.id} className="ddiv"><span>{item.label}</span></div>
                );
                const isMine = item.sender?._id === user?._id || item.sender === user?._id;
                return (
                  <motion.div key={item._id}
                    initial={{ opacity:0, y:7, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:.17 }}
                    style={{ display:"flex", alignItems:"flex-end", gap:7, marginBottom:3,
                      flexDirection: isMine ? "row-reverse" : "row" }}>
                    {!isMine && (
                      <img src={item.sender?.avatar || "/photo.jpg"} alt=""
                        style={{ width:27, height:27, borderRadius:"50%", objectFit:"cover", flexShrink:0, marginBottom:2,
                          border:"1px solid rgba(99,102,241,.22)" }}/>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", gap:3, maxWidth:"68%",
                      alignItems: isMine ? "flex-end" : "flex-start" }}>
                      <div className={`bm ${isMine ? "bm-me" : "bm-other"}`}>{item.content}</div>
                      <span style={{ fontSize:".6rem", color:"rgba(100,116,139,.5)", paddingInline:4 }}>
                        {fullTime(item.createdAt)}
                        {isMine && (
                          <span style={{ marginLeft:5, color: item.isRead ? "#818cf8" : "rgba(148,163,184,.4)" }}>
                            {item.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              <AnimatePresence>
                {isOtherTyping && (
                  <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    style={{ display:"flex", alignItems:"flex-end", gap:7, marginBottom:3 }}>
                    <div className="bm bm-other" style={{ display:"flex", alignItems:"center", gap:5 }}>
                      {[0,1,2].map(i => <div key={i} className="td" style={{ width:6, height:6, borderRadius:"50%", background:"#818cf8", animationDelay:`${i*.15}s` }}/>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div style={{ padding:"10px 14px 14px", borderTop:"1px solid rgba(99,102,241,0.1)", flexShrink:0,
              background:"rgba(10,12,24,.75)", backdropFilter:"blur(12px)" }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:9 }}>
                <textarea ref={inputRef} rows={1} value={input}
                  onChange={handleInputChange} onKeyDown={handleKeyDown}
                  placeholder="Type a message…" className="minput"/>
                <motion.button
                  whileHover={input.trim() ? { scale:1.06 } : {}} whileTap={input.trim() ? { scale:.93 } : {}}
                  onClick={sendMessage} disabled={!input.trim()}
                  className={`sbtn ${input.trim() ? "sbtn-on" : "sbtn-off"}`}>
                  <Send size={16} style={{ color: input.trim() ? "#fff" : "rgba(148,163,184,.35)" }}/>
                </motion.button>
              </div>
              <p style={{ fontSize:".67rem", color:"rgba(100,116,139,.38)", marginTop:5, paddingInline:3 }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}