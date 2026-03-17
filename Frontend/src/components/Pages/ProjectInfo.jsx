// pages/ProjectInfo.jsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getProjectDetailsAction, deleteProjectAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";
import {
  DollarSign, Clock, Users, BarChart2, Tag, Paperclip,
  Edit2, Trash2, Calendar, CheckCircle, AlertCircle, Eye
} from "lucide-react";

const statusStyle = {
  "open":              { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80",  dot:"#22c55e"  },
  "proposal-selected": { bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.3)",  color:"#fbbf24",  dot:"#f59e0b"  },
  "in-progress":       { bg:"rgba(99,102,241,0.15)", border:"rgba(99,102,241,0.35)", color:"#a5b4fc",  dot:"#6366f1"  },
  "submitted":         { bg:"rgba(168,85,247,0.12)", border:"rgba(168,85,247,0.3)",  color:"#d8b4fe",  dot:"#a855f7"  },
  "completed":         { bg:"rgba(20,184,166,0.12)", border:"rgba(20,184,166,0.3)",  color:"#5eead4",  dot:"#14b8a6"  },
  "cancelled":         { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",  color:"#fca5a5",  dot:"#ef4444"  },
  "disputed":          { bg:"rgba(249,115,22,0.12)", border:"rgba(249,115,22,0.3)",  color:"#fdba74",  dot:"#f97316"  },
};

const payStyle = {
  "unpaid":           { color:"#f87171", icon:"💳" },
  "escrow-funded":    { color:"#fbbf24", icon:"🔒" },
  "partially-paid":   { color:"#a5b4fc", icon:"⚡" },
  "paid":             { color:"#4ade80", icon:"✅" },
};

const milestoneStyle = {
  "pending":     { color:"rgba(148,163,184,0.7)", bg:"rgba(148,163,184,0.08)",  icon:"⏳" },
  "in-progress": { color:"#a5b4fc",               bg:"rgba(99,102,241,0.12)",   icon:"⚡" },
  "submitted":   { color:"#d8b4fe",               bg:"rgba(168,85,247,0.12)",   icon:"📤" },
  "approved":    { color:"#4ade80",               bg:"rgba(34,197,94,0.1)",     icon:"✅" },
  "rejected":    { color:"#f87171",               bg:"rgba(239,68,68,0.1)",     icon:"❌" },
};

const expIcon = { entry:"🌱", intermediate:"⚡", expert:"🏆" };

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-xl p-4 flex items-start gap-3"
    style={{ background:"rgba(30,27,75,0.45)", border:"1px solid rgba(99,102,241,0.18)" }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ background:"rgba(99,102,241,0.15)" }}>
      <Icon size={16} style={{ color:"#818cf8" }}/>
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(148,163,184,0.5)" }}>{label}</p>
      <p className="text-slate-100 font-bold text-sm mt-0.5">{value}</p>
      {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SectionBox = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background:"rgba(99,102,241,0.15)" }}>
        <Icon size={14} style={{ color:"#818cf8" }}/>
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">{title}</h3>
      <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.25),transparent)" }}/>
    </div>
    {children}
  </div>
);

export default function ProjectInfo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.user);
  const { project, isLoading } = useSelector((s) => s.projectDetails);

  useEffect(() => { 
    dispatch(getProjectDetailsAction(id));
  }, [dispatch, id]);

  if (isLoading || !project) return <SpinLoader />;

  const isClient = user?._id === project.client?._id || user?._id === project.client;
  const s = statusStyle[project.status] || statusStyle["open"];
  const pay = payStyle[project.paymentStatus] || payStyle["unpaid"];

  const handleDelete = () => {
    if (window.confirm("Delete this project?")) {
      dispatch(deleteProjectAction(id));
      navigate("/projects");
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .skill-pill{background:rgba(99,102,241,0.13);border:1px solid rgba(99,102,241,0.22);color:#a5b4fc;border-radius:7px;padding:3px 11px;font-size:0.75rem;font-weight:600;}
        .tag-pill{background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);color:#d8b4fe;border-radius:7px;padding:3px 11px;font-size:0.75rem;font-weight:600;}
        .milestone-row:hover{border-color:rgba(99,102,241,0.35)!important;}
      `}</style>

      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── HERO CARD ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ border:"1px solid rgba(99,102,241,0.2)" }}>

          {/* Top gradient band */}
          <div className="relative px-6 md:px-8 pt-7 pb-6"
            style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(168,85,247,0.08) 100%),rgba(13,12,28,0.95)" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)" }}/>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }}/>
                {project.status.replace(/-/g," ")}
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background:pay.bg || "rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:pay.color }}>
                {pay.icon} {project.paymentStatus.replace(/-/g," ")}
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background:"rgba(30,27,75,0.6)", border:"1px solid rgba(99,102,241,0.15)", color:"#a5b4fc" }}>
                <Eye size={10} className="inline mr-1"/> {project.visibility}
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2 leading-tight"
              style={{ fontFamily:"'Syne',sans-serif" }}>
              {project.title}
            </h1>

            {project.category && (
              <p className="text-indigo-400 text-sm font-semibold mb-4">📁 {project.category}</p>
            )}

            {/* Action buttons (client only) */}
            {isClient && (
              <div className="flex gap-3 mt-4">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                  onClick={() => navigate(`/edit-project/${project._id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", color:"#a5b4fc" }}>
                  <Edit2 size={14}/> Edit Project
                </motion.button>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171" }}>
                  <Trash2 size={14}/> Delete
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── STATS ROW ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={DollarSign} label="Budget" value={`₹${project.budget?.toLocaleString()}`} sub={project.budgetType}/>
          <StatCard icon={Users} label="Proposals" value={project.totalProposals || 0} sub="received"/>
          <StatCard icon={Clock} label="Deadline"
            value={project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "Not set"}/>
          <StatCard icon={BarChart2} label="Experience" value={`${expIcon[project.experienceLevel]} ${project.experienceLevel}`}/>
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Left - 2 col */}
          <div className="md:col-span-2 space-y-5">

            {/* Description */}
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.15 }}>
              <SectionBox icon={AlertCircle} title="Description">
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
              </SectionBox>
            </motion.div>

            {/* Milestones */}
            {project.milestones?.length > 0 && (
              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.2 }}>
                <SectionBox icon={CheckCircle} title="Milestones">
                  <div className="space-y-3">
                    {project.milestones.map((m, i) => {
                      const ms = milestoneStyle[m.status] || milestoneStyle["pending"];
                      return (
                        <div key={i} className="milestone-row flex items-start gap-3 p-3.5 rounded-xl transition-all"
                          style={{ background:ms.bg, border:`1px solid ${ms.color}22` }}>
                          <span className="text-lg shrink-0 mt-0.5">{ms.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-slate-200 font-semibold text-sm">{m.title}</p>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background:ms.bg, color:ms.color, border:`1px solid ${ms.color}44` }}>
                                {m.status}
                              </span>
                            </div>
                            {m.description && <p className="text-slate-500 text-xs mt-1">{m.description}</p>}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-indigo-400 text-xs font-bold">₹{m.amount?.toLocaleString()}</span>
                              {m.dueDate && <span className="text-slate-600 text-xs">Due: {new Date(m.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span>}
                              {m.submissionFiles?.length > 0 && (
                                <span className="text-slate-600 text-xs flex items-center gap-1">
                                  <Paperclip size={10}/> {m.submissionFiles.length} file(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionBox>
              </motion.div>
            )}
          </div>

          {/* Right - 1 col */}
          <div className="space-y-4">

            {/* Skills */}
            <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ duration:.5, delay:.2 }}>
              <SectionBox icon={Tag} title="Skills Required">
                {project.skillsRequired?.length
                  ? <div className="flex flex-wrap gap-2">
                      {project.skillsRequired.map((s, i) => <span key={i} className="skill-pill">{s}</span>)}
                    </div>
                  : <p className="text-slate-600 text-sm">No skills listed</p>}
              </SectionBox>
            </motion.div>

            {/* Tags */}
            {project.tags?.length > 0 && (
              <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ duration:.5, delay:.25 }}>
                <SectionBox icon={Tag} title="Tags">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((t, i) => <span key={i} className="tag-pill">#{t}</span>)}
                  </div>
                </SectionBox>
              </motion.div>
            )}

            {/* Dates */}
            <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ duration:.5, delay:.3 }}>
              <SectionBox icon={Calendar} title="Timeline">
                <div className="space-y-3 text-sm">
                  {[
                    { label:"Posted",    val: project.createdAt },
                    { label:"Started",   val: project.startedAt },
                    { label:"Deadline",  val: project.deadline  },
                    { label:"Completed", val: project.completedAt },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">{label}</span>
                      <span className="text-slate-300 text-xs font-semibold">
                        {val ? new Date(val).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </motion.div>

            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ duration:.5, delay:.35 }}>
                <SectionBox icon={Paperclip} title="Attachments">
                  <div className="space-y-2">
                    {project.attachments.map((file, i) => (
                      <a key={i} href={file} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:border-indigo-400"
                        style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc", textDecoration:"none" }}>
                        <Paperclip size={11}/> File {i + 1}
                      </a>
                    ))}
                  </div>
                </SectionBox>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}