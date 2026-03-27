// components/Chat/StartChatButton.jsx
// Drop this on any Profile page — it opens or creates a DM with that user
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { getOrCreateChatAction } from "../../actions/chatAction";

export default function StartChatButton({ userId, label = "Message" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = async () => {
    const chat = await dispatch(getOrCreateChatAction(userId));
    if (chat) {
      // navigate to the chat page; the route will auto-open the conversation
      navigate(`/chat/user/${userId}`);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
      style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.12))",
        border: "1px solid rgba(99,102,241,0.35)",
        color: "#a5b4fc",
      }}
    >
      <MessageSquare size={15} />
      {label}
    </motion.button>
  );
}
