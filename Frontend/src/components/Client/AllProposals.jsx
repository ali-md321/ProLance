// pages/client/proposals.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllClientProposalsAction } from "../../actions/projectAction";
import { getOrCreateChatAction } from "../../actions/chatAction";
import SpinLoader from "../layout/SpinLoader";
import {
  Star, Clock, DollarSign, MessageSquare, User, Award,
  ChevronRight, Folder, Calendar, Filter, ArrowUpDown,
  CheckCircle, XCircle, Inbox
} from "lucide-react";

const statusStyle = {
  "pending":   { bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.28)", color:"#fbbf24", dot:"#f59e0b",  label:"Pending"   },
  "accepted":  { bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.28)",  color:"#4ade80", dot:"#22c55e",  label:"Accepted"  },
  "rejected":  { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",  color:"#f87171", dot:"#ef4444",  label:"Rejected"  },
  "withdrawn": { bg:"rgba(148,163,184,0.08)",border:"rgba(148,163,184,0.2)", color:"rgba(148,163,184,0.7)", dot:"#94a3b8", label:"Withdrawn" },
};

const projectStatusStyle = {
  "open":              { color:"#4ade80",  bg:"rgba(34,197,94,0.1)"    },
  "proposal-selected": { color:"#fbbf24",  bg:"rgba(251,191,36,0.1)"   },
  "in-progress":       { color:"#a5b4fc",  bg:"rgba(99,102,241,0.12)"  },
  "completed":         { color:"#5eead4",  bg:"rgba(20,184,166,0.1)"   },
  "cancelled":         { color:"#f87171",  bg:"rgba(239,68,68,0.08)"   },
};

const getRatingColor = (rating) => {
  const r = parseFloat(rating);
  if (!rating || isNaN(r))  return { color:"rgba(148,163,184,0.6)", bg:"rgba(148,163,184,0.08)" };
  if (r >= 4)               return { color:"#4ade80", bg:"rgba(34,197,94,0.1)"   };
  if (r >= 2.5)             return { color:"#fbbf24", bg:"rgba(251,191,36,0.1)"  };
  return                           { color:"#f87171", bg:"rgba(239,68,68,0.1)"   };
};

const SORT_OPTIONS = [
  { value:"newest",      label:"Newest First"   },
  { value:"oldest",      label:"Oldest First"   },
  { value:"bid-high",    label:"Bid: High → Low" },
  { value:"bid-low",     label:"Bid: Low → High" },
  { value:"rating-high", label:"Rating: High → Low" },
];

const FILTER_OPTIONS = ["all", "pending", "accepted", "rejected", "withdrawn"];

export default function AllProposals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { proposals, isLoading } = useSelector((s) => s.allClientProposals);

  const [sort,         setSort]         = useState("newest");
  const [filter,       setFilter]       = useState("all");
  const [sortOpen,     setSortOpen]     = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  useEffect(() => { dispatch(getAllClientProposalsAction()); }, [dispatch]);

  const handleChat = async (freelancerId) => {
    setChatLoadingId(freelancerId);
    await dispatch(getOrCreateChatAction(freelancerId));
    setChatLoadingId(null);
    navigate("/chat");
  };

  if (isLoading) return <SpinLoader />;

  // ── filter ──
  const filtered = (proposals || []).filter(p =>
    filter === "all" ? true : p.status === filter
  );

  // ── sort ──
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest")      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "oldest")      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "bid-high")    return (b.bidAmount || 0) - (a.bidAmount || 0);
    if (sort === "bid-low")     return (a.bidAmount || 0) - (b.bidAmount || 0);
    if (sort === "rating-high") return (b.freelancer?.rating || 0) - (a.freelancer?.rating || 0);
    return 0;
  });

  // ── group by project ──
  const grouped = sorted.reduce((acc, proposal) => {
    const pid = proposal.project?._id || "unknown";
    if (!acc[pid]) acc[pid] = { project: proposal.project, proposals: [] };
    acc[pid].proposals.push(proposal);
    return acc;
  }, {});

  const totalPending = (proposals || []).filter(p => p.status === "pending").length;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .prop-card{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;}
        .prop-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(99,102,241,0.18);border-color:rgba(99,102,241,0.4)!important;}
        .skill-pill{background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;border-radius:6px;padding:2px 8px;font-size:0.68rem;font-weight:600;}
        .view-btn{background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1));border:1px solid rgba(99,102,241,0.25);color:#a5b4fc;transition:all .2s;}
        .view-btn:hover{background:linear-gradient(135deg,#6366f1,#a855f7);border-color:transparent;color:#fff;box-shadow:0 0 16px rgba(99,102,241,0.4);}
        .stat-chip{background:rgba(30,27,75,0.6);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:5px 10px;}
        .dropdown{background:rgba(13,12,28,0.97);border:1px solid rgba(99,102,241,0.25);border-radius:12px;overflow:hidden;z-index:50;}
        .dropdown-item{padding:8px 14px;font-size:0.8rem;font-weight:500;color:rgba(148,163,184,0.8);cursor:pointer;transition:all .15s;}
        .dropdown-item:hover,.dropdown-item.active{background:rgba(99,102,241,0.15);color:#a5b4fc;}
        .project-divider{background:linear-gradient(90deg,rgba(99,102,241,0.4),rgba(168,85,247,0.2),transparent);}
        .filter-chip{border:1px solid rgba(99,102,241,0.2);color:rgba(148,163,184,0.65);font-size:0.72rem;font-weight:600;border-radius:8px;padding:5px 12px;cursor:pointer;transition:all .18s;}
        .filter-chip:hover{border-color:rgba(99,102,241,0.4);color:#a5b4fc;}
        .filter-chip.active{background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.12));border-color:rgba(99,102,241,0.45);color:#a5b4fc;}
      `}</style>

      <div className="max-w-7xl mx-auto">

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45 }}
          className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
                ✦ All Proposals
              </div>
              <h1 className="grad-text text-2xl md:text-3xl font-bold">Received Proposals</h1>
              <p className="text-slate-500 text-sm mt-1">
                {proposals?.length || 0} total · {totalPending} pending across all projects
              </p>
            </div>

            {/* Summary chips */}
            <div className="flex items-center gap-3 flex-wrap">
              {["pending","accepted","rejected"].map(s => {
                const st  = statusStyle[s];
                const cnt = (proposals || []).filter(p => p.status === s).length;
                return (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background:st.bg, border:`1px solid ${st.border}` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background:st.dot }}/>
                    <span className="text-xs font-bold" style={{ color:st.color }}>{cnt} {s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} style={{ color:"rgba(148,163,184,0.5)" }}/>
              {FILTER_OPTIONS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`filter-chip capitalize ${filter === f ? "active" : ""}`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="ml-auto relative">
              <button onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background:"rgba(30,27,75,0.6)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
                <ArrowUpDown size={13}/>
                {SORT_OPTIONS.find(s => s.value === sort)?.label}
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                    transition={{ duration:.15 }}
                    className="dropdown absolute right-0 mt-1 w-44"
                    style={{ backdropFilter:"blur(16px)" }}>
                    {SORT_OPTIONS.map(opt => (
                      <div key={opt.value}
                        className={`dropdown-item ${sort === opt.value ? "active" : ""}`}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}>
                        {opt.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── EMPTY ── */}
        {!sorted.length && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex flex-col items-center justify-center py-28 rounded-2xl"
            style={{ border:"1px dashed rgba(99,102,241,0.2)", background:"rgba(13,12,28,0.7)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
              <Inbox size={28} style={{ color:"rgba(99,102,241,0.5)" }}/>
            </div>
            <p className="text-slate-400 font-semibold text-lg">No proposals found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your filter</p>
          </motion.div>
        )}

        {/* ── GROUPED BY PROJECT ── */}
        <div className="space-y-10">
          {Object.values(grouped).map((group, gi) => {
            const proj      = group.project;
            const pStatus   = projectStatusStyle[proj?.status] || projectStatusStyle["open"];

            return (
              <motion.div key={proj?._id || gi}
                initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:.45, delay: gi * 0.08 }}>

                {/* Project header band */}
                <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl"
                  style={{ background:"rgba(13,12,28,0.85)", border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.15))", border:"1px solid rgba(99,102,241,0.3)" }}>
                    <Folder size={16} style={{ color:"#818cf8" }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-slate-100 font-bold text-sm truncate"
                        style={{ fontFamily:"'Syne',sans-serif" }}>
                        {proj?.title || "Unknown Project"}
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize shrink-0"
                        style={{ background:pStatus.bg, color:pStatus.color }}>
                        {proj?.status?.replace(/-/g," ") || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {proj?.budget && (
                        <span className="flex items-center gap-1 text-xs" style={{ color:"rgba(148,163,184,0.55)" }}>
                          <DollarSign size={10}/> ₹{proj.budget?.toLocaleString()} {proj.budgetType && `· ${proj.budgetType}`}
                        </span>
                      )}
                      {proj?.deadline && (
                        <span className="flex items-center gap-1 text-xs" style={{ color:"rgba(148,163,184,0.55)" }}>
                          <Calendar size={10}/>
                          {new Date(proj.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                        </span>
                      )}
                      <span className="text-xs font-semibold" style={{ color:"rgba(99,102,241,0.7)" }}>
                        {group.proposals.length} proposal{group.proposals.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/projects/${proj?._id}`)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
                    View Project <ChevronRight size={11}/>
                  </button>
                </div>

                {/* Proposals grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {group.proposals.map((proposal, pi) => {
                    const st        = statusStyle[proposal.status] || statusStyle["pending"];
                    const ratingClr = getRatingColor(proposal.freelancer?.rating);

                    return (
                      <motion.div key={proposal._id}
                        initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                        transition={{ duration:.35, delay: pi * 0.06 }}
                        className="prop-card rounded-2xl overflow-hidden flex flex-col"
                        style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.16)" }}>

                        {/* Top accent */}
                        <div className="h-px w-full"
                          style={{ background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.45),rgba(168,85,247,0.25),transparent)" }}/>

                        <div className="p-4 pb-3 flex-1">

                          {/* Freelancer row */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                <div className="absolute -inset-0.5 rounded-full"
                                  style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}/>
                                <img src={proposal.freelancer?.avatar || "/photo.jpg"} alt=""
                                  className="relative w-10 h-10 rounded-full object-cover" style={{ zIndex:1 }}/>
                              </div>
                              <div>
                                <p className="text-slate-100 font-bold text-sm leading-tight">
                                  {proposal.freelancer?.name || "Freelancer"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Star size={10} style={{ color:"#fbbf24" }} fill="#fbbf24"/>
                                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                                    style={{ background:ratingClr.bg, color:ratingClr.color }}>
                                    {proposal.freelancer?.rating ?? "—"} / 5
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Status */}
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shrink-0"
                              style={{ background:st.bg, border:`1px solid ${st.border}`, color:st.color }}>
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:st.dot }}/>
                              {st.label}
                            </div>
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-3 gap-1.5 mb-3">
                            <div className="stat-chip flex flex-col items-center">
                              <DollarSign size={11} style={{ color:"#818cf8" }} className="mb-0.5"/>
                              <span className="text-slate-100 text-xs font-bold">₹{proposal.bidAmount?.toLocaleString()}</span>
                              <span className="text-slate-600" style={{ fontSize:"0.58rem" }}>bid</span>
                            </div>
                            <div className="stat-chip flex flex-col items-center">
                              <Clock size={11} style={{ color:"#818cf8" }} className="mb-0.5"/>
                              <span className="text-slate-100 text-xs font-bold">{proposal.deliveryDays || "—"}</span>
                              <span className="text-slate-600" style={{ fontSize:"0.58rem" }}>days</span>
                            </div>
                            <div className="stat-chip flex flex-col items-center">
                              <Award size={11} style={{ color:"#818cf8" }} className="mb-0.5"/>
                              <span className="text-slate-100 text-xs font-bold">
                                {proposal.freelancer?.totalEarnings
                                  ? `₹${(proposal.freelancer.totalEarnings/1000).toFixed(0)}k`
                                  : "—"}
                              </span>
                              <span className="text-slate-600" style={{ fontSize:"0.58rem" }}>earned</span>
                            </div>
                          </div>

                          {/* Cover letter preview */}
                          {proposal.coverLetter && (
                            <div className="mb-3 p-2.5 rounded-xl"
                              style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.1)" }}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare size={10} style={{ color:"rgba(148,163,184,0.45)" }}/>
                                <span className="text-xs font-semibold uppercase tracking-widest"
                                  style={{ color:"rgba(148,163,184,0.4)", fontSize:"0.62rem" }}>Cover Letter</span>
                              </div>
                              <p className="text-slate-400 leading-relaxed line-clamp-2" style={{ fontSize:"0.72rem" }}>
                                {proposal.coverLetter}
                              </p>
                            </div>
                          )}

                          {/* Skills */}
                          {proposal.freelancer?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {proposal.freelancer.skills.slice(0, 3).map((sk, j) => (
                                <span key={j} className="skill-pill">{sk}</span>
                              ))}
                              {proposal.freelancer.skills.length > 3 && (
                                <span className="skill-pill">+{proposal.freelancer.skills.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4">
                          <div className="flex items-center justify-between pt-3"
                            style={{ borderTop:"1px solid rgba(99,102,241,0.1)" }}>
                            <div className="flex items-center gap-1.5">
                              <User size={10} style={{ color:"rgba(148,163,184,0.35)" }}/>
                              <span className="text-slate-600" style={{ fontSize:"0.68rem" }}>
                                {proposal.createdAt
                                  ? new Date(proposal.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})
                                  : "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                                onClick={() => handleChat(proposal.freelancer?._id)}
                                disabled={chatLoadingId === proposal.freelancer?._id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                  background: "rgba(99,102,241,0.12)",
                                  border: "1px solid rgba(99,102,241,0.25)",
                                  color: "#a5b4fc",
                                  opacity: chatLoadingId === proposal.freelancer?._id ? 0.6 : 1,
                                }}>
                                <MessageSquare size={11}/>
                                {chatLoadingId === proposal.freelancer?._id ? "..." : "Chat"}
                              </motion.button>
                              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                                onClick={() => navigate(`/profile/${proposal.freelancer?._id}`)}
                                className="view-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                Profile <ChevronRight size={11}/>
                              </motion.button>
                              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                                onClick={() => navigate(`/projects/${proj?._id}/proposals`)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)", color:"#818cf8" }}>
                                All <ChevronRight size={11}/>
                              </motion.button>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}