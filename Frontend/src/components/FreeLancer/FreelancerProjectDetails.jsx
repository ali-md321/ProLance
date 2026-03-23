// freelancer/FreelancerProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectDetailsAction, submitProposalAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";
import { ArrowLeft, DollarSign, Clock, Users, BarChart2, Tag, Paperclip, Send, AlertCircle, CheckCircle, Calendar } from "lucide-react";

const expIcon = { entry:"🌱", intermediate:"⚡", expert:"🏆" };
const statusStyle = {
  "open":              { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80",  dot:"#22c55e"  },
  "proposal-selected": { bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.3)",  color:"#fbbf24",  dot:"#f59e0b"  },
  "in-progress":       { bg:"rgba(99,102,241,0.15)", border:"rgba(99,102,241,0.35)", color:"#a5b4fc",  dot:"#6366f1"  },
  "completed":         { bg:"rgba(20,184,166,0.12)", border:"rgba(20,184,166,0.3)",  color:"#5eead4",  dot:"#14b8a6"  },
  "cancelled":         { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",  color:"#fca5a5",  dot:"#ef4444"  },
};

const InputF = ({ label, id, type="text", placeholder, value, onChange, focused, setFocused }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.55)" }}>{label}</label>
    <div className="relative">
      <motion.div animate={{ opacity: focused===id ? 1 : 0 }} className="absolute -inset-px pointer-events-none"
        style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", borderRadius:13 }}>
        <div className="w-full h-full" style={{ background:"#0f0e1f", borderRadius:12 }}/>
      </motion.div>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
        className="relative w-full px-4 py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium"
        style={{ background:"rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, zIndex:1 }}/>
    </div>
  </div>
);

export default function FreelancerProjectDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { project, isLoading } = useSelector((s) => s.projectDetails);
  const { user } = useSelector((s) => s.user);
  const [showProposal, setShowProposal] = useState(false);
  const [focused, setFocused] = useState("");
  const [proposal, setProposal] = useState({ coverLetter:"", bidAmount:"", deliveryDays:"" });

  useEffect(() => { dispatch(getProjectDetailsAction(id)); }, [dispatch, id]);

  const handleProposalSubmit = (e) => {
    e.preventDefault();
    dispatch(submitProposalAction({ ...proposal, projectId: id }));
    setShowProposal(false);
  };

  if (isLoading || !project) return <SpinLoader />;

  const s = statusStyle[project.status] || statusStyle["open"];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .skill-pill{background:rgba(99,102,241,0.13);border:1px solid rgba(99,102,241,0.22);color:#a5b4fc;border-radius:7px;padding:3px 11px;font-size:0.75rem;font-weight:600;}
        .tag-pill{background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);color:#d8b4fe;border-radius:7px;padding:3px 11px;font-size:0.75rem;font-weight:600;}
        textarea{resize:none;}
        textarea::placeholder,input::placeholder{color:rgba(100,116,139,0.55);}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) saturate(2) hue-rotate(200deg);opacity:.6;}
      `}</style>

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back */}
        <motion.button whileHover={{ scale:1.05 }} onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold mb-2"
          style={{ color:"#a5b4fc" }}>
          <ArrowLeft size={15}/> Back to Projects
        </motion.button>

        {/* Hero */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ border:"1px solid rgba(99,102,241,0.2)" }}>
          <div className="relative px-6 md:px-8 pt-7 pb-6"
            style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08)),rgba(13,12,28,0.95)" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)" }}/>
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }}/>
                {project.status.replace(/-/g," ")}
              </div>
              {project.category && (
                <div className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
                  📁 {project.category}
                </div>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4 leading-tight"
              style={{ fontFamily:"'Syne',sans-serif" }}>{project.title}</h1>
            {project.status === "open" && (
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                onClick={() => setShowProposal(!showProposal)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 20px rgba(99,102,241,0.35)" }}>
                <Send size={14}/> {showProposal ? "Cancel Proposal" : "Submit Proposal"}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Proposal form */}
        <AnimatePresence>
          {showProposal && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
              transition={{ duration:.3 }} className="overflow-hidden">
              <div className="rounded-2xl p-6" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.25)" }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(99,102,241,0.15)" }}>
                    <Send size={13} style={{ color:"#818cf8" }}/>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Your Proposal</h3>
                  <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.3),transparent)" }}/>
                </div>
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.55)" }}>Cover Letter</label>
                    <div className="relative">
                      <motion.div animate={{ opacity: focused==="cover" ? 1 : 0 }} className="absolute -inset-px pointer-events-none"
                        style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", borderRadius:13 }}>
                        <div className="w-full h-full" style={{ background:"#0f0e1f", borderRadius:12 }}/>
                      </motion.div>
                      <textarea id="cover" placeholder="Why are you the best fit for this project?" value={proposal.coverLetter}
                        onChange={e => setProposal({...proposal, coverLetter:e.target.value})} rows={4}
                        onFocus={() => setFocused("cover")} onBlur={() => setFocused("")}
                        className="relative w-full px-4 py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium"
                        style={{ background:"rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, zIndex:1 }} required/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputF id="bid" label="Bid Amount (₹)" type="number" placeholder="Your price"
                      value={proposal.bidAmount} onChange={e => setProposal({...proposal, bidAmount:e.target.value})}
                      focused={focused} setFocused={setFocused}/>
                    <InputF id="days" label="Delivery (Days)" type="number" placeholder="e.g. 14"
                      value={proposal.deliveryDays} onChange={e => setProposal({...proposal, deliveryDays:e.target.value})}
                      focused={focused} setFocused={setFocused}/>
                  </div>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} type="submit"
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 24px rgba(99,102,241,0.35)" }}>
                    <Send size={14}/> Submit Proposal
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon:DollarSign, label:"Budget",     value:`₹${project.budget?.toLocaleString()}`, sub:project.budgetType },
            { icon:Users,      label:"Proposals",  value:project.totalProposals || 0,            sub:"received"         },
            { icon:Clock,      label:"Deadline",   value:project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "Not set", sub:"" },
            { icon:BarChart2,  label:"Experience", value:`${expIcon[project.experienceLevel]} ${project.experienceLevel}`, sub:"" },
          ].map(({ icon:Icon, label, value, sub }) => (
            <div key={label} className="rounded-xl p-4 flex items-start gap-3"
              style={{ background:"rgba(30,27,75,0.45)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:"rgba(99,102,241,0.15)" }}>
                <Icon size={15} style={{ color:"#818cf8" }}/>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(148,163,184,0.5)" }}>{label}</p>
                <p className="text-slate-100 font-bold text-sm mt-0.5">{value}</p>
                {sub && <p className="text-slate-600 text-xs">{sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            {/* Description */}
            <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(99,102,241,0.15)" }}><AlertCircle size={13} style={{ color:"#818cf8" }}/></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Description</h3>
                <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.25),transparent)" }}/>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
            {/* Milestones */}
            {project.milestones?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(99,102,241,0.15)" }}><CheckCircle size={13} style={{ color:"#818cf8" }}/></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Milestones</h3>
                  <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.25),transparent)" }}/>
                </div>
                <div className="space-y-3">
                  {project.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background:"rgba(30,27,75,0.4)", border:"1px solid rgba(99,102,241,0.15)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ background:"rgba(99,102,241,0.2)", color:"#a5b4fc" }}>{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 font-semibold text-sm">{m.title}</p>
                        {m.description && <p className="text-slate-500 text-xs mt-0.5">{m.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-indigo-400 text-xs font-bold">₹{m.amount?.toLocaleString()}</span>
                          {m.dueDate && <span className="text-slate-600 text-xs">Due: {new Date(m.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right */}
          <div className="space-y-4">
            {/* Skills */}
            <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <div className="flex items-center gap-2 mb-3"><Tag size={13} style={{ color:"#818cf8" }}/><h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Skills</h3></div>
              <div className="flex flex-wrap gap-2">
                {project.skillsRequired?.length ? project.skillsRequired.map((s,i) => <span key={i} className="skill-pill">{s}</span>) : <p className="text-slate-600 text-sm">None listed</p>}
              </div>
            </div>
            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
                <div className="flex items-center gap-2 mb-3"><Tag size={13} style={{ color:"#818cf8" }}/><h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Tags</h3></div>
                <div className="flex flex-wrap gap-2">{project.tags.map((t,i) => <span key={i} className="tag-pill">#{t}</span>)}</div>
              </div>
            )}
            {/* Timeline */}
            <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <div className="flex items-center gap-2 mb-3"><Calendar size={13} style={{ color:"#818cf8" }}/><h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Timeline</h3></div>
              <div className="space-y-2.5">
                {[["Posted", project.createdAt],["Deadline", project.deadline],["Started", project.startedAt]].map(([label,val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">{label}</span>
                    <span className="text-slate-300 text-xs font-semibold">{val ? new Date(val).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
                <div className="flex items-center gap-2 mb-3"><Paperclip size={13} style={{ color:"#818cf8" }}/><h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Attachments</h3></div>
                <div className="space-y-2">
                  {project.attachments.map((f,i) => (
                    <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium hover:border-indigo-400 transition-all"
                      style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc", textDecoration:"none" }}>
                      <Paperclip size={11}/> File {i+1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}   