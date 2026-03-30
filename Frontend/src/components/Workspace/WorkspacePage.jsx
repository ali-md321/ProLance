// components/Workspace/WorkspacePage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowLeft, Plus, CheckCircle, Clock, AlertCircle, Send, X,
  ChevronDown, ChevronUp, DollarSign, Calendar, Layers,
  MessageSquare, Edit2, Trash2, ExternalLink, FileText,
  User, Briefcase, BarChart2, Flag, RotateCcw,
} from "lucide-react";
import {
  getWorkspaceAction,
  addMilestoneAction,
  editMilestoneAction,
  deleteMilestoneAction,
  startMilestoneAction,
  submitMilestoneAction,
  approveMilestoneAction,
  rejectMilestoneAction,
  completeProjectAction,
} from "../../actions/workspaceAction";
import { getOrCreateChatAction } from "../../actions/chatAction";
import SpinLoader from "../layout/SpinLoader";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const progressPct = (milestones = []) => {
  if (!milestones.length) return 0;
  const done = milestones.filter((m) => m.status === "approved").length;
  return Math.round((done / milestones.length) * 100);
};

const totalBudget = (milestones = []) =>
  milestones.reduce((acc, m) => acc + (m.amount || 0), 0);

const earnedSoFar = (milestones = []) =>
  milestones
    .filter((m) => m.status === "approved")
    .reduce((acc, m) => acc + (m.amount || 0), 0);

/* ─── status configs ──────────────────────────────────────────────────────── */
const MS = {
  pending:     { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.18)", label: "Pending",     icon: Clock       },
  "in-progress":{ color: "#818cf8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)",   label: "In Progress", icon: BarChart2   },
  submitted:   { color: "#d8b4fe", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.3)",   label: "Submitted",   icon: Send        },
  approved:    { color: "#4ade80", bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.3)",    label: "Approved",    icon: CheckCircle },
  rejected:    { color: "#f87171", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.25)",   label: "Rejected",    icon: AlertCircle },
};

const PS = {
  "in-progress": { color: "#818cf8", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)", dot: "#6366f1" },
  completed:     { color: "#4ade80", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.3)",  dot: "#22c55e" },
  cancelled:     { color: "#f87171", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.2)",  dot: "#ef4444" },
  disputed:      { color: "#fdba74", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", dot: "#f97316" },
};

/* ─── tiny reusable UI ────────────────────────────────────────────────────── */
const SectionBox = ({ icon: Icon, title, accent = "#818cf8", children, action }) => (
  <div className="rounded-2xl p-5" style={{ background: "rgba(13,12,28,0.9)", border: "1px solid rgba(99,102,241,0.18)" }}>
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">{title}</h3>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.25),transparent)" }} />
      {action}
    </div>
    {children}
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, min, required }) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      min={min} required={required}
      className="w-full px-4 py-2.5 outline-none text-slate-200 text-sm"
      style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 10 }}
    />
  </div>
);

const TextareaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>}
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-2.5 outline-none text-slate-200 text-sm"
      style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 10, resize: "none" }}
    />
  </div>
);

const GradBtn = ({ onClick, disabled, children, color = "indigo", size = "sm" }) => {
  const bg = color === "green"  ? "linear-gradient(135deg,#22c55e,#16a34a)"
           : color === "red"    ? "linear-gradient(135deg,#ef4444,#dc2626)"
           : color === "purple" ? "linear-gradient(135deg,#a855f7,#7c3aed)"
           :                     "linear-gradient(135deg,#6366f1,#a855f7)";
  const shadow = color === "green"  ? "rgba(34,197,94,0.35)"
               : color === "red"    ? "rgba(239,68,68,0.35)"
               : color === "purple" ? "rgba(168,85,247,0.35)"
               :                     "rgba(99,102,241,0.35)";
  const py = size === "xs" ? "4px 10px" : size === "sm" ? "7px 16px" : "10px 22px";
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}} whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick} disabled={disabled}
      style={{ background: disabled ? "rgba(30,27,75,0.4)" : bg, padding: py,
        boxShadow: disabled ? "none" : `0 0 18px ${shadow}`,
        borderRadius: 10, color: disabled ? "rgba(148,163,184,0.4)" : "#fff",
        fontSize: "0.8rem", fontWeight: 600, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 6 }}>
      {children}
    </motion.button>
  );
};

const GhostBtn = ({ onClick, disabled, children }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.97 } : {}}
    onClick={onClick} disabled={disabled}
    style={{ background: "rgba(30,27,75,0.45)", border: "1px solid rgba(99,102,241,0.22)",
      padding: "7px 14px", borderRadius: 10, color: "#a5b4fc", fontSize: "0.8rem",
      fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 6 }}>
    {children}
  </motion.button>
);

/* ─── Modal wrapper ───────────────────────────────────────────────────────── */
const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl p-6"
          style={{ background: "rgba(15,14,31,0.98)", border: "1px solid rgba(99,102,241,0.3)", maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-200" style={{ fontFamily: "'Syne',sans-serif" }}>{title}</h3>
            <button onClick={onClose} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "4px 8px", color: "#a5b4fc", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MILESTONE CARD                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
function MilestoneCard({ milestone, index, isClient, isFreelancer, projectId, actionLoading, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = MS[milestone.status] || MS.pending;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(20,18,48,0.8)", border: `1px solid ${cfg.border}` }}>

      {/* Header row */}
      <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        {/* Number badge */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-slate-100 font-semibold text-sm truncate">{milestone.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-indigo-400 font-bold text-xs">₹{milestone.amount?.toLocaleString()}</span>
            {milestone.dueDate && (
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Calendar size={10} /> {fmtDate(milestone.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          <StatusIcon size={11} />
          {cfg.label}
        </div>

        {expanded ? <ChevronUp size={14} style={{ color: "#64748b", flexShrink: 0 }} />
                  : <ChevronDown size={14} style={{ color: "#64748b", flexShrink: 0 }} />}
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "rgba(99,102,241,0.12)" }}>

              {milestone.description && (
                <p className="text-slate-400 text-sm leading-relaxed pt-3">{milestone.description}</p>
              )}

              {/* Submission note */}
              {milestone.submissionNote && (
                <div className="rounded-xl p-3" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#d8b4fe" }}>Freelancer Note</p>
                  <p className="text-slate-300 text-sm">{milestone.submissionNote}</p>
                </div>
              )}

              {/* Submission files */}
              {milestone.submissionFiles?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>Submitted Files / Links</p>
                  {milestone.submissionFiles.map((f, i) => (
                    <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:border-indigo-400"
                      style={{ background: "rgba(30,27,75,0.5)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc", textDecoration: "none" }}>
                      <ExternalLink size={11} /> {f.length > 60 ? f.slice(0, 60) + "…" : f}
                    </a>
                  ))}
                </div>
              )}

              {/* Rejection note */}
              {milestone.rejectionNote && (
                <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#f87171" }}>Rejection Feedback</p>
                  <p className="text-slate-300 text-sm">{milestone.rejectionNote}</p>
                </div>
              )}

              {/* ── Action buttons ─────────────────────────────────────────── */}
              <div className="flex flex-wrap gap-2 pt-1">

                {/* FREELANCER ACTIONS */}
                {isFreelancer && milestone.status === "pending" && (
                  <GradBtn onClick={() => onAction("start", milestone._id)} disabled={actionLoading} color="indigo">
                    <BarChart2 size={13} /> Start Work
                  </GradBtn>
                )}

                {isFreelancer && milestone.status === "rejected" && (
                  <GradBtn onClick={() => onAction("start", milestone._id)} disabled={actionLoading} color="indigo">
                    <RotateCcw size={13} /> Restart Work
                  </GradBtn>
                )}

                {isFreelancer && ["in-progress", "rejected"].includes(milestone.status) && (
                  <GradBtn onClick={() => onAction("openSubmit", milestone._id)} disabled={actionLoading} color="purple">
                    <Send size={13} /> Submit for Review
                  </GradBtn>
                )}

                {isFreelancer && milestone.status === "pending" && (
                  <GhostBtn onClick={() => onAction("openSubmit", milestone._id)} disabled={actionLoading}>
                    <Send size={13} /> Submit Directly
                  </GhostBtn>
                )}

                {/* CLIENT ACTIONS */}
                {isClient && milestone.status === "submitted" && (
                  <>
                    <GradBtn onClick={() => onAction("approve", milestone._id)} disabled={actionLoading} color="green">
                      <CheckCircle size={13} /> Approve
                    </GradBtn>
                    <GradBtn onClick={() => onAction("openReject", milestone._id)} disabled={actionLoading} color="red">
                      <X size={13} /> Request Changes
                    </GradBtn>
                  </>
                )}

                {isClient && milestone.status === "pending" && (
                  <>
                    <GhostBtn onClick={() => onAction("openEdit", milestone._id, milestone)}>
                      <Edit2 size={13} /> Edit
                    </GhostBtn>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                      onClick={() => onAction("delete", milestone._id)} disabled={actionLoading}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                        padding: "7px 14px", borderRadius: 10, color: "#f87171", fontSize: "0.8rem",
                        fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Trash2 size={13} /> Delete
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function WorkspacePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user }                      = useSelector((s) => s.user);
  const { project, isLoading, actionLoading } = useSelector((s) => s.workspace);

  // ── modal states ─────────────────────────────────────────────────────────
  const [addOpen,    setAddOpen]    = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activeMid,  setActiveMid]  = useState(null);   // milestone id for current action

  // add/edit form state
  const emptyForm = { title: "", description: "", amount: "", dueDate: "" };
  const [form,     setForm]     = useState(emptyForm);
  const [submitForm, setSubmitForm] = useState({ note: "", files: "" }); // files = newline-separated URLs
  const [rejectNote, setRejectNote] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    dispatch(getWorkspaceAction(id));
  }, [dispatch, id]);

  /* ── dispatch helper — must be ABOVE early return ──────────────────────── */
  const handleAction = useCallback(async (type, milestoneId, milestoneData) => {
    if (type === "start") {
      const r = await dispatch(startMilestoneAction(id, milestoneId));
      if (r.success) toast.success("Milestone started!");
      else toast.error(r.message || "Failed");
    }

    if (type === "approve") {
      const r = await dispatch(approveMilestoneAction(id, milestoneId));
      if (r.success) toast.success(r.message || "Milestone approved!");
      else toast.error(r.message || "Failed");
    }

    if (type === "delete") {
      if (!window.confirm("Delete this milestone?")) return;
      const r = await dispatch(deleteMilestoneAction(id, milestoneId));
      if (r.success) toast.success("Milestone deleted");
      else toast.error(r.message || "Failed");
    }

    if (type === "openSubmit") { setActiveMid(milestoneId); setSubmitForm({ note: "", files: "" }); setSubmitOpen(true); }
    if (type === "openReject") { setActiveMid(milestoneId); setRejectNote(""); setRejectOpen(true); }
    if (type === "openEdit")   { setActiveMid(milestoneId); setForm({ title: milestoneData.title, description: milestoneData.description || "", amount: milestoneData.amount, dueDate: milestoneData.dueDate ? milestoneData.dueDate.slice(0, 10) : "" }); setEditOpen(true); }
  }, [dispatch, id]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (isLoading || !project) return <SpinLoader />;

  const isClient     = user?._id === (project.client?._id || project.client);
  const isFreelancer = user?._id === (project.selectedFreelancer?._id || project.selectedFreelancer);
  const milestones   = project.milestones || [];
  const pct          = progressPct(milestones);
  const ps           = PS[project.status] || PS["in-progress"];

  const other = isClient ? project.selectedFreelancer : project.client;

  const handleChat = async () => {
    const otherId = other?._id || other;
    if (!otherId) return;
    setChatLoading(true);
    await dispatch(getOrCreateChatAction(otherId));
    setChatLoading(false);
    navigate("/chat");
  };

  /* ── submit milestone ──────────────────────────────────────────────────── */
  const handleSubmitMilestone = async () => {
    const filesArr = submitForm.files.split("\n").map(s => s.trim()).filter(Boolean);
    const r = await dispatch(submitMilestoneAction(id, activeMid, { note: submitForm.note, submissionFiles: filesArr }));
    if (r.success) { toast.success("Milestone submitted for review!"); setSubmitOpen(false); }
    else toast.error(r.message || "Failed");
  };

  /* ── reject milestone ──────────────────────────────────────────────────── */
  const handleRejectMilestone = async () => {
    const r = await dispatch(rejectMilestoneAction(id, activeMid, rejectNote));
    if (r.success) { toast.success("Revision requested"); setRejectOpen(false); }
    else toast.error(r.message || "Failed");
  };

  /* ── add milestone ─────────────────────────────────────────────────────── */
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    const r = await dispatch(addMilestoneAction(id, form));
    if (r.success) { toast.success("Milestone added!"); setAddOpen(false); setForm(emptyForm); }
    else toast.error(r.message || "Failed");
  };

  /* ── edit milestone ────────────────────────────────────────────────────── */
  const handleEditMilestone = async (e) => {
    e.preventDefault();
    const r = await dispatch(editMilestoneAction(id, activeMid, form));
    if (r.success) { toast.success("Milestone updated!"); setEditOpen(false); setForm(emptyForm); }
    else toast.error(r.message || "Failed");
  };

  /* ── complete project ──────────────────────────────────────────────────── */
  const handleComplete = async () => {
    if (!window.confirm("Mark this project as completed?")) return;
    const r = await dispatch(completeProjectAction(id));
    if (r.success) toast.success("Project completed! 🎉");
    else toast.error("Failed");
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  RENDER                                                                   */
  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .skill-pill{background:rgba(99,102,241,0.13);border:1px solid rgba(99,102,241,0.22);color:#a5b4fc;border-radius:6px;padding:2px 9px;font-size:0.72rem;font-weight:600;}
        input::placeholder,textarea::placeholder{color:rgba(100,116,139,0.55);}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) saturate(2) hue-rotate(200deg);opacity:.6;}
        textarea{resize:none;}
        .progress-bar-fill{transition:width 0.8s cubic-bezier(.4,0,.2,1);}
      `}</style>

      <div className="max-w-5xl mx-auto space-y-5">

        {/* Back */}
        <motion.button whileHover={{ scale: 1.04 }} onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#a5b4fc" }}>
          <ArrowLeft size={15} /> Back
        </motion.button>

        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.08)),rgba(13,12,28,0.97)", border: "1px solid rgba(99,102,241,0.25)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)" }} />

          <div className="px-6 md:px-8 pt-6 pb-5">
            {/* Role tag + status */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                style={{ background: isClient ? "rgba(251,191,36,0.12)" : "rgba(99,102,241,0.12)", color: isClient ? "#fbbf24" : "#a5b4fc", border: isClient ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(99,102,241,0.3)" }}>
                {isClient ? "👔 Client View" : "💻 Freelancer View"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: ps.bg, border: `1px solid ${ps.border}`, color: ps.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: ps.dot }} />
                {project.status.replace(/-/g, " ")}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>
              {project.title}
            </h1>
            <p className="text-slate-500 text-sm mb-4">Project Workspace</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <GhostBtn onClick={handleChat} disabled={chatLoading}>
                <MessageSquare size={13} />
                {chatLoading ? "Opening…" : `Chat with ${isClient ? "Freelancer" : "Client"}`}
              </GhostBtn>

              {isClient && project.status === "in-progress" && (
                <GradBtn onClick={handleComplete} disabled={actionLoading} color="green" size="sm">
                  <Flag size={13} /> Mark Complete
                </GradBtn>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: DollarSign, label: "Total Budget",   value: `₹${project.budget?.toLocaleString()}` },
            { icon: Layers,     label: "Milestones",     value: milestones.length },
            { icon: CheckCircle,label: "Approved",       value: milestones.filter(m => m.status === "approved").length },
            { icon: Calendar,   label: "Deadline",       value: fmtDate(project.deadline) },
          ].map(({ icon: Icon, label, value }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "rgba(30,27,75,0.45)", border: "1px solid rgba(99,102,241,0.18)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.15)" }}>
                <Icon size={15} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>{label}</p>
                <p className="text-slate-100 font-bold text-sm mt-0.5">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        {milestones.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{ background: "rgba(13,12,28,0.9)", border: "1px solid rgba(99,102,241,0.18)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-300">Overall Progress</p>
              <p className="text-sm font-bold" style={{ color: "#818cf8" }}>{pct}%</p>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.12)" }}>
              <div className="progress-bar-fill h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#a855f7)" }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">₹{earnedSoFar(milestones).toLocaleString()} earned</span>
              <span className="text-xs text-slate-500">₹{totalBudget(milestones).toLocaleString()} total</span>
            </div>
          </motion.div>
        )}

        {/* ── Main 2-col layout ──────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* LEFT — milestones (2/3 width) */}
          <div className="md:col-span-2 space-y-4">
            <SectionBox icon={Layers} title="Milestones"
              action={
                isClient && project.status !== "completed" ? (
                  <GradBtn onClick={() => { setForm(emptyForm); setAddOpen(true); }} size="xs">
                    <Plus size={13} /> Add
                  </GradBtn>
                ) : null
              }>
              {milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl"
                  style={{ border: "1px dashed rgba(99,102,241,0.2)", background: "rgba(13,12,28,0.5)" }}>
                  <Layers size={32} className="mb-3" style={{ color: "rgba(99,102,241,0.3)" }} />
                  <p className="text-slate-500 font-medium text-sm">No milestones yet</p>
                  {isClient && (
                    <p className="text-slate-600 text-xs mt-1">Add milestones to track work progress</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <MilestoneCard
                      key={m._id} milestone={m} index={i}
                      isClient={isClient} isFreelancer={isFreelancer}
                      projectId={id} actionLoading={actionLoading}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </SectionBox>

            {/* Project description */}
            <SectionBox icon={FileText} title="Project Brief">
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </SectionBox>
          </div>

          {/* RIGHT — sidebar (1/3 width) */}
          <div className="space-y-4">

            {/* The other party */}
            <SectionBox icon={isClient ? Briefcase : User} title={isClient ? "Assigned Freelancer" : "Client"}>
              {other ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                    style={{ border: "2px solid rgba(99,102,241,0.3)" }}>
                    <img src={other.avatar || "/photo.jpg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-semibold text-sm">{other.name}</p>
                    <p className="text-slate-500 text-xs">{other.email}</p>
                    {isClient && other.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {other.skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="skill-pill">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Not assigned yet</p>
              )}
            </SectionBox>

            {/* Skills required */}
            {project.skillsRequired?.length > 0 && (
              <SectionBox icon={BarChart2} title="Skills Required">
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired.map((s, i) => (
                    <span key={i} className="skill-pill">{s}</span>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* Timeline */}
            <SectionBox icon={Calendar} title="Timeline">
              <div className="space-y-2.5">
                {[
                  ["Posted",    project.createdAt],
                  ["Started",   project.startedAt],
                  ["Deadline",  project.deadline],
                  ["Completed", project.completedAt],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">{label}</span>
                    <span className="text-slate-300 text-xs font-semibold">{fmtDate(val)}</span>
                  </div>
                ))}
              </div>
            </SectionBox>

            {/* Milestone summary */}
            {milestones.length > 0 && (
              <SectionBox icon={CheckCircle} title="Milestone Summary">
                <div className="space-y-2">
                  {Object.entries(MS).map(([key, cfg]) => {
                    const count = milestones.filter(m => m.status === key).length;
                    if (!count) return null;
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={12} style={{ color: cfg.color }} />
                          <span className="text-xs text-slate-400">{cfg.label}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </SectionBox>
            )}

          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  MODALS                                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      {/* Add milestone */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Milestone">
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <InputField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Design mockups" required />
          <TextareaField label="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what should be delivered…" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Amount (₹)" type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
            <InputField label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <GradBtn size="md" disabled={actionLoading}>
            <Plus size={14} /> {actionLoading ? "Adding…" : "Add Milestone"}
          </GradBtn>
        </form>
      </Modal>

      {/* Edit milestone */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Milestone">
        <form onSubmit={handleEditMilestone} className="space-y-4">
          <InputField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Milestone title" required />
          <TextareaField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What needs to be delivered…" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Amount (₹)" type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
            <InputField label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <GradBtn size="md" disabled={actionLoading}>
            <Edit2 size={14} /> {actionLoading ? "Saving…" : "Save Changes"}
          </GradBtn>
        </form>
      </Modal>

      {/* Submit milestone */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Milestone">
        <div className="space-y-4">
          <TextareaField label="Note to Client" value={submitForm.note} onChange={e => setSubmitForm({ ...submitForm, note: e.target.value })} placeholder="Describe what you've done, any caveats…" rows={4} />
          <TextareaField label="File / Link URLs (one per line)" value={submitForm.files} onChange={e => setSubmitForm({ ...submitForm, files: e.target.value })} placeholder={"https://github.com/you/repo\nhttps://figma.com/your-design"} rows={3} />
          <div className="flex gap-3">
            <GradBtn onClick={handleSubmitMilestone} disabled={actionLoading} color="purple" size="md">
              <Send size={14} /> {actionLoading ? "Submitting…" : "Submit for Review"}
            </GradBtn>
            <GhostBtn onClick={() => setSubmitOpen(false)}>Cancel</GhostBtn>
          </div>
        </div>
      </Modal>

      {/* Reject / request changes */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Request Changes">
        <div className="space-y-4">
          <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs text-slate-400">The freelancer will see this feedback and can resubmit the milestone.</p>
          </div>
          <TextareaField label="Feedback" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Explain what needs to be changed or improved…" rows={4} />
          <div className="flex gap-3">
            <GradBtn onClick={handleRejectMilestone} disabled={actionLoading} color="red" size="md">
              <AlertCircle size={14} /> {actionLoading ? "Sending…" : "Request Changes"}
            </GradBtn>
            <GhostBtn onClick={() => setRejectOpen(false)}>Cancel</GhostBtn>
          </div>
        </div>
      </Modal>

    </div>
  );
}