// freelancer/MyProposals.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyProposalsAction } from "../../actions/projectAction";
import { getOrCreateChatAction } from "../../actions/chatAction";
import SpinLoader from "../layout/SpinLoader";
import { FileText, DollarSign, Clock, ChevronRight, MessageSquare } from "lucide-react";

const propStatusStyle = {
  "pending":  { bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.3)",  color:"#fbbf24", dot:"#f59e0b", label:"Pending"  },
  "accepted": { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80", dot:"#22c55e", label:"Accepted" },
  "rejected": { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",  color:"#fca5a5", dot:"#ef4444", label:"Rejected" },
};

export default function MyProposals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { proposals, isLoading } = useSelector((s) => s.myProposals);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  useEffect(() => { dispatch(getMyProposalsAction()); }, [dispatch]);

  const handleChat = async (e, clientId) => {
    e.stopPropagation(); // prevent card click navigating to project
    if (!clientId) return;
    setChatLoadingId(clientId);
    await dispatch(getOrCreateChatAction(clientId));
    setChatLoadingId(null);
    navigate("/chat");
  };

  if (isLoading) return <SpinLoader />;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');.grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}`}</style>
      <div className="mb-7">
        <h1 className="grad-text text-3xl font-bold mb-1">My Proposals</h1>
        <p className="text-slate-500 text-sm">{proposals?.length || 0} proposals submitted</p>
      </div>

      {!proposals?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border:"1px dashed rgba(99,102,241,0.25)", background:"rgba(13,12,28,0.6)" }}>
          <FileText size={38} className="mb-3" style={{ color:"rgba(99,102,241,0.35)" }}/>
          <p className="text-slate-500 font-medium">No proposals yet</p>
          <p className="text-slate-600 text-sm mt-1">Browse projects and submit your first proposal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal, i) => {
            const ps = propStatusStyle[proposal.status] || propStatusStyle["pending"];
            const clientId = proposal.project?.client;
            return (
              <motion.div key={proposal._id}
                initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay: i*0.06 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all hover:border-indigo-400"
                style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}
                onClick={() => navigate(`/freelancer/projects/${proposal.project?._id}`)}>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-100 font-bold text-base leading-tight mb-1 truncate"
                    style={{ fontFamily:"'Syne',sans-serif" }}>
                    {proposal.project?.title || "Project"}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{proposal.coverLetter}</p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background:ps.bg, border:`1px solid ${ps.border}`, color:ps.color }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background:ps.dot }}/>
                    {ps.label}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-indigo-400 font-bold">
                      <DollarSign size={11}/>₹{proposal.bidAmount?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock size={11}/>{proposal.deliveryDays}d
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={(e) => handleChat(e, clientId)}
                  disabled={chatLoadingId === clientId}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.28)",
                    color: "#a5b4fc",
                    opacity: chatLoadingId === clientId ? 0.6 : 1,
                  }}>
                  <MessageSquare size={13}/>
                  {chatLoadingId === clientId ? "..." : "Chat Client"}
                </motion.button>
                <ChevronRight size={16} className="hidden sm:block shrink-0" style={{ color:"rgba(99,102,241,0.4)" }}/>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}