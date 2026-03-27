// pages/ProjectProposals.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getProposalsOfProjectAction, acceptProposalAction, rejectProposalAction } from "../../actions/projectAction";
import { getOrCreateChatAction } from "../../actions/chatAction";
import SpinLoader from "../layout/SpinLoader";
import { ArrowLeft, Star, Clock, DollarSign, MessageSquare, User, Award, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const statusStyle = {
  "pending":   { bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.28)", color:"#fbbf24", dot:"#f59e0b", label:"Pending"   },
  "accepted":  { bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.28)",  color:"#4ade80", dot:"#22c55e", label:"Accepted"  },
  "rejected":  { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",  color:"#f87171", dot:"#ef4444", label:"Rejected"  },
  "withdrawn": { bg:"rgba(148,163,184,0.08)",border:"rgba(148,163,184,0.2)", color:"rgba(148,163,184,0.7)", dot:"#94a3b8", label:"Withdrawn" },
};

// rating is a number (e.g. 0–5); bucket into low / mid / high color
const getRatingColor = (rating) => {
  const r = parseFloat(rating);
  if (!rating || isNaN(r))       return { color:"rgba(148,163,184,0.6)", bg:"rgba(148,163,184,0.08)" };
  if (r >= 4)                    return { color:"#4ade80", bg:"rgba(34,197,94,0.1)"    }; // high  → green
  if (r >= 2.5)                  return { color:"#fbbf24", bg:"rgba(251,191,36,0.1)"   }; // mid   → yellow
  return                                { color:"#f87171", bg:"rgba(239,68,68,0.1)"    }; // low   → red
};

export default function ProjectProposals() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { proposals, isLoading } = useSelector((s) => s.projectProposals);
  const { project } = useSelector((s) => s.projectDetails);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  useEffect(() => { dispatch(getProposalsOfProjectAction(id)); }, [dispatch, id]);

  const handleChat = async (freelancerId) => {
    setChatLoadingId(freelancerId);
    await dispatch(getOrCreateChatAction(freelancerId));
    setChatLoadingId(null);
    navigate("/chat");
  };

  if (isLoading) return <SpinLoader />;

  const isFreelancerSelected = !!project?.selectedFreelancer;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .prop-card{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;}
        .prop-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(99,102,241,0.18);border-color:rgba(99,102,241,0.4)!important;}
        .skill-pill{background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;border-radius:6px;padding:2px 9px;font-size:0.7rem;font-weight:600;}
        .view-btn{background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1));border:1px solid rgba(99,102,241,0.25);color:#a5b4fc;transition:all .2s;}
        .view-btn:hover{background:linear-gradient(135deg,#6366f1,#a855f7);border-color:transparent;color:#fff;box-shadow:0 0 18px rgba(99,102,241,0.4);}
        .stat-chip{background:rgba(30,27,75,0.6);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:6px 12px;}
        .accept-btn{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.28);color:#4ade80;transition:all .2s;}
        .accept-btn:hover{background:rgba(34,197,94,0.22);box-shadow:0 0 16px rgba(34,197,94,0.2);}
        .reject-btn{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);color:#f87171;transition:all .2s;}
        .reject-btn:hover{background:rgba(239,68,68,0.18);box-shadow:0 0 16px rgba(239,68,68,0.15);}
        .action-disabled{opacity:0.35;cursor:not-allowed;pointer-events:none;}
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45 }}
          className="flex items-start gap-4 mb-8">
          <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.93 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 transition-all"
            style={{ background:"rgba(30,27,75,0.6)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
            <ArrowLeft size={16}/>
          </motion.button>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
              ✦ Project Proposals
            </div>
            <h1 className="grad-text text-2xl md:text-3xl font-bold">Received Proposals</h1>
            <p className="text-slate-500 text-sm mt-1">
              {proposals?.length || 0} proposal{proposals?.length !== 1 ? "s" : ""} submitted for this project
            </p>
          </div>

          {proposals?.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl shrink-0"
              style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background:"#22c55e", boxShadow:"0 0 6px #22c55e" }}/>
              <span className="text-slate-300 text-sm font-semibold">
                {proposals.filter(p => p.status === "pending").length} pending
              </span>
            </div>
          )}
        </motion.div>

        {isFreelancerSelected && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl mb-6"
            style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)" }}>
            <CheckCircle size={16} style={{ color:"#818cf8", flexShrink:0 }}/>
            <p className="text-slate-300 text-sm">
              A freelancer has already been selected for this project. Accept/Reject actions are disabled.
            </p>
          </motion.div>
        )}

        {!proposals?.length && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex flex-col items-center justify-center py-28 rounded-2xl"
            style={{ border:"1px dashed rgba(99,102,241,0.22)", background:"rgba(13,12,28,0.7)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
              <MessageSquare size={28} style={{ color:"rgba(99,102,241,0.5)" }}/>
            </div>
            <p className="text-slate-400 font-semibold text-lg">No proposals yet</p>
            <p className="text-slate-600 text-sm mt-2">Freelancers haven't applied to this project yet</p>
          </motion.div>
        )}

        {/* ── GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {proposals?.map((proposal, i) => {
            const st         = statusStyle[proposal.status] || statusStyle["pending"];
            const ratingClr  = getRatingColor(proposal.freelancer?.rating);
            const isPending  = proposal.status === "pending";

            return (
              <motion.div key={proposal._id}
                initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:.4, delay: i * 0.07 }}
                className="prop-card rounded-2xl overflow-hidden flex flex-col"
                style={{ background:"rgba(13,12,28,0.92)", border:"1px solid rgba(99,102,241,0.18)" }}>

                <div className="h-px w-full" style={{ background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.5),rgba(168,85,247,0.3),transparent)" }}/>

                <div className="p-5 pb-4 flex-1">
                  {/* Freelancer header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-0.5 rounded-full"
                          style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}/>
                        <img src={proposal.freelancer?.avatar || "/photo.jpg"} alt=""
                          className="relative w-11 h-11 rounded-full object-cover" style={{ zIndex:1 }}/>
                      </div>
                      <div>
                        <p className="text-slate-100 font-bold text-sm leading-tight">
                          {proposal.freelancer?.name || "Freelancer"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Star size={11} style={{ color:"#fbbf24" }} fill="#fbbf24"/>
                          {/* numeric rating with dynamic colour badge */}
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: ratingClr.bg, color: ratingClr.color }}>
                            {proposal.freelancer?.rating ?? "—"} / 5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{ background:st.bg, border:`1px solid ${st.border}`, color:st.color }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:st.dot }}/>
                      {st.label}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="stat-chip flex flex-col items-center">
                      <DollarSign size={12} style={{ color:"#818cf8" }} className="mb-0.5"/>
                      <span className="text-slate-100 text-xs font-bold">₹{proposal.bidAmount?.toLocaleString()}</span>
                      <span className="text-slate-600" style={{ fontSize:"0.6rem" }}>bid</span>
                    </div>
                    <div className="stat-chip flex flex-col items-center">
                      <Clock size={12} style={{ color:"#818cf8" }} className="mb-0.5"/>
                      <span className="text-slate-100 text-xs font-bold">{proposal.deliveryDays || "—"}</span>
                      <span className="text-slate-600" style={{ fontSize:"0.6rem" }}>days</span>
                    </div>
                    <div className="stat-chip flex flex-col items-center">
                      <Award size={12} style={{ color:"#818cf8" }} className="mb-0.5"/>
                      <span className="text-slate-100 text-xs font-bold">
                        {proposal.freelancer?.totalEarnings ? `₹${(proposal.freelancer.totalEarnings/1000).toFixed(0)}k` : "—"}
                      </span>
                      <span className="text-slate-600" style={{ fontSize:"0.6rem" }}>earned</span>
                    </div>
                  </div>

                  {/* Cover letter */}
                  {proposal.coverLetter && (
                    <div className="mb-4 p-3 rounded-xl"
                      style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.12)" }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare size={11} style={{ color:"rgba(148,163,184,0.5)" }}/>
                        <span className="text-xs font-semibold uppercase tracking-widest"
                          style={{ color:"rgba(148,163,184,0.45)" }}>Cover Letter</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{proposal.coverLetter}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {proposal.freelancer?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proposal.freelancer.skills.slice(0, 4).map((sk, j) => (
                        <span key={j} className="skill-pill">{sk}</span>
                      ))}
                      {proposal.freelancer.skills.length > 4 && (
                        <span className="skill-pill">+{proposal.freelancer.skills.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── FOOTER ── */}
                <div className="px-5 pb-5">
                  {isPending && (
                    <div className={`grid grid-cols-2 gap-2 mb-3 ${isFreelancerSelected ? "action-disabled" : ""}`}>
                      <motion.button
                        whileHover={!isFreelancerSelected ? { scale:1.03 } : {}}
                        whileTap={!isFreelancerSelected ? { scale:.96 } : {}}
                        onClick={() => !isFreelancerSelected && dispatch(acceptProposalAction(proposal._id))}
                        className="accept-btn flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold">
                        <CheckCircle size={13}/> Accept
                      </motion.button>
                      <motion.button
                        whileHover={!isFreelancerSelected ? { scale:1.03 } : {}}
                        whileTap={!isFreelancerSelected ? { scale:.96 } : {}}
                        onClick={() => !isFreelancerSelected && dispatch(rejectProposalAction(proposal._id))}
                        className="reject-btn flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold">
                        <XCircle size={13}/> Reject
                      </motion.button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop:"1px solid rgba(99,102,241,0.1)" }}>
                    <div className="flex items-center gap-1.5">
                      <User size={11} style={{ color:"rgba(148,163,184,0.4)" }}/>
                      <span className="text-slate-600 text-xs">
                        {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }}
                        onClick={() => handleChat(proposal.freelancer?._id)}
                        disabled={chatLoadingId === proposal.freelancer?._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: "rgba(99,102,241,0.12)",
                          border: "1px solid rgba(99,102,241,0.25)",
                          color: "#a5b4fc",
                          opacity: chatLoadingId === proposal.freelancer?._id ? 0.6 : 1,
                        }}>
                        <MessageSquare size={12}/>
                        {chatLoadingId === proposal.freelancer?._id ? "..." : "Chat"}
                      </motion.button>
                      <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }}
                        onClick={() => navigate(`/profile/${proposal.freelancer?._id}`)}
                        className="view-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold">
                        View Profile <ChevronRight size={12}/>
                      </motion.button>
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}