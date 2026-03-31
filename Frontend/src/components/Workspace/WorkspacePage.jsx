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
  User, Briefcase, BarChart2, Flag, RotateCcw, Star,
  CreditCard, TrendingUp, Zap, Award, Lock,
} from "lucide-react";
import {
  getWorkspaceAction, addMilestoneAction, editMilestoneAction,
  deleteMilestoneAction, startMilestoneAction, submitMilestoneAction,
  approveMilestoneAction, rejectMilestoneAction, completeProjectAction,
  createPaymentIntentAction, confirmPaymentAction,
  reviewFreelancerAction, reviewClientAction,
} from "../../actions/workspaceAction";
import { getOrCreateChatAction } from "../../actions/chatAction";
import SpinLoader from "../layout/SpinLoader";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const progressPct = (ms = []) => {
  if (!ms.length) return 0;
  return Math.round(ms.filter(m => m.status === "approved").length / ms.length * 100);
};
const earnedSoFar = (ms = []) =>
  ms.filter(m => m.status === "approved").reduce((a, m) => a + (m.amount || 0), 0);
const totalMs = (ms = []) =>
  ms.reduce((a, m) => a + (m.amount || 0), 0);

/* ─── status maps ─────────────────────────────────────────────────────────── */
const MS_CFG = {
  pending:      { color:"#94a3b8", glow:"rgba(148,163,184,0.15)", border:"rgba(148,163,184,0.2)",  label:"Pending",     emoji:"⏳", icon: Clock       },
  "in-progress":{ color:"#818cf8", glow:"rgba(99,102,241,0.2)",   border:"rgba(99,102,241,0.35)",  label:"In Progress", emoji:"⚡", icon: BarChart2   },
  submitted:    { color:"#c084fc", glow:"rgba(168,85,247,0.2)",   border:"rgba(168,85,247,0.4)",   label:"Under Review",emoji:"📤", icon: Send        },
  approved:     { color:"#4ade80", glow:"rgba(34,197,94,0.2)",    border:"rgba(34,197,94,0.35)",   label:"Approved",    emoji:"✅", icon: CheckCircle },
  rejected:     { color:"#f87171", glow:"rgba(239,68,68,0.2)",    border:"rgba(239,68,68,0.3)",    label:"Revision",    emoji:"🔄", icon: AlertCircle },
};
const PS_CFG = {
  "in-progress":{ color:"#818cf8", bg:"rgba(99,102,241,0.1)",  border:"rgba(99,102,241,0.3)",  dot:"#6366f1", label:"In Progress" },
  completed:    { color:"#4ade80", bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.3)",   dot:"#22c55e", label:"Completed"   },
  cancelled:    { color:"#f87171", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.2)",   dot:"#ef4444", label:"Cancelled"   },
  disputed:     { color:"#fdba74", bg:"rgba(249,115,22,0.12)", border:"rgba(249,115,22,0.3)",  dot:"#f97316", label:"Disputed"    },
};
const PAY_CFG = {
  unpaid:          { color:"#f87171", label:"Unpaid",       icon:"💳" },
  "escrow-funded": { color:"#fbbf24", label:"In Escrow",    icon:"🔒" },
  "partially-paid":{ color:"#818cf8", label:"Partial",      icon:"⚡" },
  paid:            { color:"#4ade80", label:"Paid ✓",       icon:"✅" },
};

/* ─── tiny atoms ──────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
  .ws-grad{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .ws-card{background:rgba(13,12,28,0.92);border:1px solid rgba(99,102,241,0.16);border-radius:20px;}
  .ws-pill{background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;border-radius:6px;padding:2px 9px;font-size:.72rem;font-weight:600;}
  input::placeholder,textarea::placeholder{color:rgba(100,116,139,0.5);}
  input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.4) sepia(1) saturate(2) hue-rotate(200deg);opacity:.6;}
  textarea{resize:none;}
  .ms-card-hover{transition:border-color .2s,box-shadow .2s;}
  .ms-card-hover:hover{box-shadow:0 4px 24px rgba(99,102,241,0.12);}
  .star-btn{background:none;border:none;cursor:pointer;padding:2px;transition:transform .15s;}
  .star-btn:hover{transform:scale(1.2);}
  .progress-fill{transition:width .9s cubic-bezier(.4,0,.2,1);}
  .tab-active{background:linear-gradient(135deg,rgba(99,102,241,0.22),rgba(168,85,247,0.14));border-color:rgba(99,102,241,0.42)!important;color:#a5b4fc!important;}
`;

const GBtn = ({ onClick, disabled, color="indigo", size="sm", children, full }) => {
  const bg = {
    indigo:"linear-gradient(135deg,#6366f1,#a855f7)",
    green: "linear-gradient(135deg,#22c55e,#16a34a)",
    red:   "linear-gradient(135deg,#ef4444,#dc2626)",
    purple:"linear-gradient(135deg,#a855f7,#7c3aed)",
    gold:  "linear-gradient(135deg,#f59e0b,#d97706)",
  }[color];
  const sh = {
    indigo:"rgba(99,102,241,.35)", green:"rgba(34,197,94,.35)",
    red:"rgba(239,68,68,.35)",     purple:"rgba(168,85,247,.35)",
    gold:"rgba(245,158,11,.35)",
  }[color];
  const py = size==="xs" ? "4px 10px" : size==="md" ? "10px 20px" : "7px 15px";
  return (
    <motion.button whileHover={!disabled?{scale:1.03}:{}} whileTap={!disabled?{scale:.96}:{}}
      onClick={onClick} disabled={disabled}
      style={{
        background: disabled ? "rgba(30,27,75,.4)" : bg,
        padding: py, borderRadius:10, width: full?"100%":undefined,
        boxShadow: disabled?"none":`0 0 16px ${sh}`,
        color: disabled?"rgba(148,163,184,.4)":"#fff",
        fontSize:".82rem", fontWeight:600, border:"none",
        cursor: disabled?"not-allowed":"pointer",
        display:"inline-flex", alignItems:"center", gap:6, justifyContent:"center",
      }}>
      {children}
    </motion.button>
  );
};

const Ghost = ({ onClick, disabled, children, danger }) => (
  <motion.button whileHover={!disabled?{scale:1.02}:{}} whileTap={!disabled?{scale:.97}:{}}
    onClick={onClick} disabled={disabled}
    style={{
      background: danger ? "rgba(239,68,68,.08)" : "rgba(30,27,75,.5)",
      border:`1px solid ${danger?"rgba(239,68,68,.25)":"rgba(99,102,241,.22)"}`,
      padding:"7px 14px", borderRadius:10,
      color: danger?"#f87171":"#a5b4fc",
      fontSize:".82rem", fontWeight:600,
      cursor: disabled?"not-allowed":"pointer",
      display:"inline-flex", alignItems:"center", gap:6,
      opacity: disabled?.6:1,
    }}>
    {children}
  </motion.button>
);

const Field = ({ label, type="text", value, onChange, placeholder, min, required, rows }) => (
  <div>
    {label && <label style={{ display:"block", fontSize:".72rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(148,163,184,.55)", marginBottom:6 }}>{label}</label>}
    {rows ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ width:"100%", padding:"10px 14px", background:"rgba(20,18,48,.7)", border:"1px solid rgba(99,102,241,.22)", borderRadius:10, color:"#e2e8f0", fontSize:".875rem", outline:"none", boxSizing:"border-box" }}/>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        min={min} required={required}
        style={{ width:"100%", padding:"10px 14px", background:"rgba(20,18,48,.7)", border:"1px solid rgba(99,102,241,.22)", borderRadius:10, color:"#e2e8f0", fontSize:".875rem", outline:"none", boxSizing:"border-box" }}/>
    )}
  </div>
);

const Modal = ({ open, onClose, title, icon: Icon, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose}
        style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)" }}>
        <motion.div initial={{scale:.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.92,opacity:0}}
          transition={{duration:.2}}
          onClick={e=>e.stopPropagation()}
          style={{ width:"100%", maxWidth:500, background:"rgba(12,11,26,.98)", border:"1px solid rgba(99,102,241,.3)", borderRadius:20, padding:24, maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {Icon && <div style={{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,.15)" }}><Icon size={15} style={{color:"#818cf8"}}/></div>}
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#e2e8f0", fontSize:"1rem" }}>{title}</h3>
            </div>
            <button onClick={onClose} style={{ background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.2)", borderRadius:8, padding:"4px 8px", color:"#a5b4fc", cursor:"pointer" }}><X size={14}/></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Star Rating ─────────────────────────────────────────────────────────── */
const StarRating = ({ value, onChange, size=28 }) => (
  <div style={{ display:"flex", gap:6 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} className="star-btn" onClick={() => onChange(n)} type="button">
        <Star size={size} fill={n<=value?"#fbbf24":"none"} stroke={n<=value?"#fbbf24":"rgba(148,163,184,.4)"} />
      </button>
    ))}
  </div>
);

/* ─── Milestone Card (redesigned) ────────────────────────────────────────── */
function MilestoneCard({ m, idx, isClient, isFreelancer, actionLoading, onAction }) {
  const [open, setOpen] = useState(false);
  const cfg = MS_CFG[m.status] || MS_CFG.pending;
  const Icon = cfg.icon;
  const daysLeft = m.dueDate ? Math.ceil((new Date(m.dueDate) - Date.now()) / 86400000) : null;

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.3,delay:idx*.05}}
      className="ms-card-hover"
      style={{ borderRadius:16, overflow:"hidden", border:`1px solid ${cfg.border}`, background:"rgba(16,14,36,.9)" }}>

      {/* top accent bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${cfg.color}80,${cfg.color}20)` }}/>

      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }} onClick={()=>setOpen(!open)}>
        {/* index bubble */}
        <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".8rem", fontWeight:800, flexShrink:0, background:`${cfg.color}18`, color:cfg.color, border:`1.5px solid ${cfg.border}`, boxShadow:`0 0 12px ${cfg.glow}` }}>
          {idx+1}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:"#e2e8f0", fontWeight:700, fontSize:".9rem", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ color:"#818cf8", fontWeight:700, fontSize:".78rem" }}>₹{m.amount?.toLocaleString()}</span>
            {daysLeft !== null && (
              <span style={{ fontSize:".72rem", color: daysLeft<0?"#f87171": daysLeft<=3?"#fbbf24":"rgba(148,163,184,.5)", display:"flex", alignItems:"center", gap:3 }}>
                <Calendar size={10}/> {daysLeft<0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </span>
            )}
          </div>
        </div>

        {/* status pill */}
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:`${cfg.color}15`, border:`1px solid ${cfg.border}`, color:cfg.color, fontSize:".7rem", fontWeight:700, flexShrink:0 }}>
          <Icon size={10}/> {cfg.label}
        </div>

        <div style={{ color:"rgba(100,116,139,.5)", flexShrink:0 }}>
          {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </div>
      </div>

      {/* expanded */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.2}} style={{overflow:"hidden"}}>
            <div style={{ padding:"0 16px 16px", borderTop:`1px solid rgba(99,102,241,.1)` }}>
              {m.description && <p style={{ color:"rgba(148,163,184,.8)", fontSize:".84rem", lineHeight:1.7, paddingTop:12 }}>{m.description}</p>}

              {/* submission note */}
              {m.submissionNote && (
                <div style={{ marginTop:12, padding:"10px 14px", borderRadius:12, background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)" }}>
                  <p style={{ fontSize:".7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#c084fc", marginBottom:4 }}>💬 Freelancer Note</p>
                  <p style={{ color:"#e2e8f0", fontSize:".84rem" }}>{m.submissionNote}</p>
                </div>
              )}

              {/* files */}
              {m.submissionFiles?.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <p style={{ fontSize:".7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"rgba(148,163,184,.5)", marginBottom:8 }}>Deliverables</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {m.submissionFiles.map((f,i) => (
                      <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:10, background:"rgba(30,27,75,.5)", border:"1px solid rgba(99,102,241,.2)", color:"#a5b4fc", textDecoration:"none", fontSize:".78rem", fontWeight:500 }}>
                        <ExternalLink size={11}/> {f.length>55 ? f.slice(0,55)+"…" : f}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* rejection note */}
              {m.rejectionNote && (
                <div style={{ marginTop:12, padding:"10px 14px", borderRadius:12, background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)" }}>
                  <p style={{ fontSize:".7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#f87171", marginBottom:4 }}>⚠️ Revision Requested</p>
                  <p style={{ color:"#e2e8f0", fontSize:".84rem" }}>{m.rejectionNote}</p>
                </div>
              )}

              {/* actions */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:14 }}>
                {isFreelancer && m.status==="pending" && (
                  <GBtn onClick={()=>onAction("start",m._id)} disabled={actionLoading}><Zap size={12}/> Start Work</GBtn>
                )}
                {isFreelancer && ["in-progress","rejected"].includes(m.status) && (
                  <GBtn onClick={()=>onAction("openSubmit",m._id)} disabled={actionLoading} color="purple"><Send size={12}/> Submit Work</GBtn>
                )}
                {isFreelancer && m.status==="pending" && (
                  <Ghost onClick={()=>onAction("openSubmit",m._id)} disabled={actionLoading}><Send size={12}/> Submit Directly</Ghost>
                )}
                {isFreelancer && m.status==="rejected" && (
                  <GBtn onClick={()=>onAction("start",m._id)} disabled={actionLoading}><RotateCcw size={12}/> Restart</GBtn>
                )}

                {isClient && m.status==="submitted" && (
                  <>
                    <GBtn onClick={()=>onAction("approve",m._id)} disabled={actionLoading} color="green"><CheckCircle size={12}/> Approve</GBtn>
                    <GBtn onClick={()=>onAction("openReject",m._id)} disabled={actionLoading} color="red"><X size={12}/> Request Changes</GBtn>
                  </>
                )}
                {isClient && m.status==="pending" && (
                  <>
                    <Ghost onClick={()=>onAction("openEdit",m._id,m)}><Edit2 size={12}/> Edit</Ghost>
                    <Ghost onClick={()=>onAction("delete",m._id)} danger><Trash2 size={12}/> Delete</Ghost>
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

/* ─── Payment Panel (Stripe) ─────────────────────────────────────────────── */
function PaymentPanel({ project, onPay }) {
  const [step, setStep] = useState("idle"); // idle | confirm | processing | done
  const pay = PAY_CFG[project.paymentStatus] || PAY_CFG.unpaid;

  if (project.paymentStatus === "paid") {
    return (
      <div style={{ padding:"16px", borderRadius:14, background:"rgba(34,197,94,.07)", border:"1px solid rgba(34,197,94,.25)", textAlign:"center" }}>
        <p style={{ fontSize:"1.5rem", marginBottom:4 }}>✅</p>
        <p style={{ color:"#4ade80", fontWeight:700, fontSize:".9rem" }}>Payment Complete</p>
        <p style={{ color:"rgba(148,163,184,.6)", fontSize:".78rem", marginTop:2 }}>₹{project.budget?.toLocaleString()} paid to freelancer</p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div style={{ padding:"16px", borderRadius:14, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.22)" }}>
        <p style={{ color:"#e2e8f0", fontWeight:700, marginBottom:8 }}>Confirm Payment</p>
        <p style={{ color:"rgba(148,163,184,.7)", fontSize:".84rem", marginBottom:4 }}>Amount: <strong style={{color:"#818cf8"}}>₹{project.budget?.toLocaleString()}</strong></p>
        <p style={{ color:"rgba(148,163,184,.7)", fontSize:".84rem", marginBottom:12 }}>Freelancer: <strong style={{color:"#e2e8f0"}}>{project.selectedFreelancer?.name}</strong></p>
        <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(30,27,75,.6)", border:"1px solid rgba(99,102,241,.2)", marginBottom:14 }}>
          <p style={{ color:"rgba(148,163,184,.6)", fontSize:".75rem", display:"flex", alignItems:"center", gap:5 }}>
            <Lock size={11}/> Payments processed securely via Stripe
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <GBtn onClick={()=>onPay(setStep)} color="gold" size="md" full><CreditCard size={14}/> Pay ₹{project.budget?.toLocaleString()}</GBtn>
          <Ghost onClick={()=>setStep("idle")}>Cancel</Ghost>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"16px", borderRadius:14, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.2)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <p style={{ color:"#e2e8f0", fontWeight:700, fontSize:".9rem" }}>Payment</p>
        <span style={{ fontSize:".75rem", fontWeight:700, color:pay.color }}>{pay.icon} {pay.label}</span>
      </div>
      <p style={{ color:"rgba(148,163,184,.6)", fontSize:".8rem", marginBottom:12 }}>
        Project completed. Release payment to the freelancer.
      </p>
      <GBtn onClick={()=>setStep("confirm")} color="gold" full size="md">
        <CreditCard size={14}/> Pay Freelancer ₹{project.budget?.toLocaleString()}
      </GBtn>
    </div>
  );
}

/* ─── Review Panel ────────────────────────────────────────────────────────── */
function ReviewPanel({ project, isClient, isFreelancer, onSubmitReview }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const alreadyReviewedAsClient     = project.isReviewedByClient;
  const alreadyReviewedAsFreelancer = project.isReviewedByFreelancer;

  if (isClient) {
    if (alreadyReviewedAsClient) {
      const r = project.clientReview;
      return (
        <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)" }}>
          <p style={{ color:"#4ade80", fontWeight:700, fontSize:".85rem", marginBottom:6 }}>✅ Your Review Submitted</p>
          <div style={{ display:"flex", gap:3, marginBottom:4 }}>
            {[1,2,3,4,5].map(n=><Star key={n} size={14} fill={n<=r.rating?"#fbbf24":"none"} stroke={n<=r.rating?"#fbbf24":"rgba(148,163,184,.3)"}/>)}
          </div>
          {r.comment && <p style={{ color:"rgba(148,163,184,.7)", fontSize:".82rem" }}>{r.comment}</p>}
        </div>
      );
    }
    return (
      <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.18)" }}>
        <p style={{ color:"#e2e8f0", fontWeight:700, fontSize:".85rem", marginBottom:10 }}>⭐ Rate the Freelancer</p>
        <StarRating value={rating} onChange={setRating} />
        <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience…" rows={3}
          style={{ width:"100%", marginTop:10, padding:"8px 12px", background:"rgba(20,18,48,.7)", border:"1px solid rgba(99,102,241,.2)", borderRadius:10, color:"#e2e8f0", fontSize:".84rem", outline:"none", resize:"none", boxSizing:"border-box" }}/>
        <div style={{ marginTop:10 }}>
          <GBtn onClick={()=>onSubmitReview({rating,comment})} disabled={!rating} size="md" full>
            <Star size={13}/> Submit Review
          </GBtn>
        </div>
      </div>
    );
  }

  if (isFreelancer) {
    if (alreadyReviewedAsFreelancer) {
      const r = project.freelancerReview;
      return (
        <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)" }}>
          <p style={{ color:"#4ade80", fontWeight:700, fontSize:".85rem", marginBottom:6 }}>✅ Your Review Submitted</p>
          <div style={{ display:"flex", gap:3, marginBottom:4 }}>
            {[1,2,3,4,5].map(n=><Star key={n} size={14} fill={n<=r.rating?"#fbbf24":"none"} stroke={n<=r.rating?"#fbbf24":"rgba(148,163,184,.3)"}/>)}
          </div>
          {r.comment && <p style={{ color:"rgba(148,163,184,.7)", fontSize:".82rem" }}>{r.comment}</p>}
        </div>
      );
    }
    return (
      <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.18)" }}>
        <p style={{ color:"#e2e8f0", fontWeight:700, fontSize:".85rem", marginBottom:10 }}>⭐ Rate the Client</p>
        <StarRating value={rating} onChange={setRating} />
        <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="How was working with this client?" rows={3}
          style={{ width:"100%", marginTop:10, padding:"8px 12px", background:"rgba(20,18,48,.7)", border:"1px solid rgba(99,102,241,.2)", borderRadius:10, color:"#e2e8f0", fontSize:".84rem", outline:"none", resize:"none", boxSizing:"border-box" }}/>
        <div style={{ marginTop:10 }}>
          <GBtn onClick={()=>onSubmitReview({rating,comment})} disabled={!rating} size="md" full>
            <Star size={13}/> Submit Review
          </GBtn>
        </div>
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function WorkspacePage() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { user }   = useSelector(s => s.user);
  const { project, isLoading, actionLoading, paymentLoading } = useSelector(s => s.workspace);

  // modals
  const [addOpen,    setAddOpen]    = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activeMid,  setActiveMid]  = useState(null);

  // forms
  const emptyForm = { title:"", description:"", amount:"", dueDate:"" };
  const [form,       setForm]       = useState(emptyForm);
  const [submitForm, setSubmitForm] = useState({ note:"", files:"" });
  const [rejectNote, setRejectNote] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // tabs
  const [tab, setTab] = useState("milestones"); // milestones | overview | payment | review

  useEffect(() => { dispatch(getWorkspaceAction(id)); }, [dispatch, id]);

  // ── handleAction — MUST be before early return ─────────────────────────
  const handleAction = useCallback(async (type, milestoneId, milestoneData) => {
    if (type === "start") {
      const r = await dispatch(startMilestoneAction(id, milestoneId));
      if (r.success) toast.success("Milestone started! Let's go 🚀");
      else toast.error(r.message || "Failed");
    }
    if (type === "approve") {
      const r = await dispatch(approveMilestoneAction(id, milestoneId));
      if (r.success) {
        if (r.allApproved) toast.success("All milestones approved! You can now mark the project complete. 🎉", {autoClose:5000});
        else toast.success("Milestone approved ✅");
      } else toast.error(r.message || "Failed");
    }
    if (type === "delete") {
      if (!window.confirm("Delete this milestone?")) return;
      const r = await dispatch(deleteMilestoneAction(id, milestoneId));
      if (r.success) toast.success("Milestone deleted");
      else toast.error(r.message || "Failed");
    }
    if (type === "openSubmit") { setActiveMid(milestoneId); setSubmitForm({note:"",files:""}); setSubmitOpen(true); }
    if (type === "openReject") { setActiveMid(milestoneId); setRejectNote(""); setRejectOpen(true); }
    if (type === "openEdit")   {
      setActiveMid(milestoneId);
      setForm({ title:milestoneData.title, description:milestoneData.description||"", amount:milestoneData.amount, dueDate:milestoneData.dueDate?milestoneData.dueDate.slice(0,10):"" });
      setEditOpen(true);
    }
  }, [dispatch, id]);

  // ── Early return after all hooks ──────────────────────────────────────
  if (isLoading || !project) return <SpinLoader />;

  const myId        = user?._id;
  const isClient    = myId === (project.client?._id || project.client);
  const isFreelancer= myId === (project.selectedFreelancer?._id || project.selectedFreelancer);
  const milestones  = project.milestones || [];
  const pct         = progressPct(milestones);
  const ps          = PS_CFG[project.status] || PS_CFG["in-progress"];
  const other       = isClient ? project.selectedFreelancer : project.client;
  const isCompleted = project.status === "completed";

  const handleChat = async () => {
    const otherId = other?._id || other;
    if (!otherId) return;
    setChatLoading(true);
    await dispatch(getOrCreateChatAction(otherId));
    setChatLoading(false);
    navigate("/chat");
  };

  const handleComplete = async () => {
    if (!window.confirm("Mark this project as completed? This cannot be undone.")) return;
    const r = await dispatch(completeProjectAction(id));
    if (r.success) { toast.success("Project completed! 🎉"); setTab("payment"); }
    else toast.error(r.message || "Failed");
  };

  const handlePay = async (setStep) => {
    setStep("processing");
    const r = await dispatch(createPaymentIntentAction(id));
    if (!r.success) { toast.error(r.message || "Payment failed"); setStep("confirm"); return; }
    // In a real app you'd mount Stripe Elements here.
    // For now we simulate confirm immediately (replace with real Stripe flow).
    const SIMULATED_PI_ID = `pi_simulated_${Date.now()}`;
    const confirm = await dispatch(confirmPaymentAction(id, SIMULATED_PI_ID));
    if (confirm.success) { toast.success("Payment sent to freelancer! 💰"); setStep("done"); }
    else { toast.error(confirm.message || "Confirmation failed"); setStep("confirm"); }
  };

  const handleReview = async (payload) => {
    let r;
    if (isClient)     r = await dispatch(reviewFreelancerAction(id, payload));
    if (isFreelancer) r = await dispatch(reviewClientAction(id, payload));
    if (r?.success) toast.success("Review submitted! ⭐");
    else toast.error(r?.message || "Failed");
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    const r = await dispatch(addMilestoneAction(id, form));
    if (r.success) { toast.success("Milestone added!"); setAddOpen(false); setForm(emptyForm); }
    else toast.error(r.message || "Failed");
  };

  const handleEditMilestone = async (e) => {
    e.preventDefault();
    const r = await dispatch(editMilestoneAction(id, activeMid, form));
    if (r.success) { toast.success("Milestone updated!"); setEditOpen(false); }
    else toast.error(r.message || "Failed");
  };

  const handleSubmitMilestone = async () => {
    const filesArr = submitForm.files.split("\n").map(s=>s.trim()).filter(Boolean);
    const r = await dispatch(submitMilestoneAction(id, activeMid, { note:submitForm.note, submissionFiles:filesArr }));
    if (r.success) { toast.success("Submitted for review! 📤"); setSubmitOpen(false); }
    else toast.error(r.message || "Failed");
  };

  const handleRejectMilestone = async () => {
    const r = await dispatch(rejectMilestoneAction(id, activeMid, rejectNote));
    if (r.success) { toast.success("Revision requested"); setRejectOpen(false); }
    else toast.error(r.message || "Failed");
  };

  // tabs config
  const tabs = [
    { key:"milestones", label:"Milestones", icon:Layers },
    { key:"overview",   label:"Overview",   icon:FileText },
    ...(isCompleted ? [
      { key:"payment", label:"Payment", icon:CreditCard },
      { key:"review",  label:"Review",  icon:Star },
    ] : []),
  ];

  /* ─── render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:"100vh" }}>
      <style>{css}</style>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"0 4px" }}>

        {/* ── Back ── */}
        <motion.button whileHover={{scale:1.04}} onClick={()=>navigate(-1)}
          style={{ display:"flex", alignItems:"center", gap:6, color:"#a5b4fc", fontWeight:600, fontSize:".84rem", background:"none", border:"none", cursor:"pointer", marginBottom:16 }}>
          <ArrowLeft size={15}/> Back
        </motion.button>

        {/* ── HERO ── */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.5}}
          style={{ borderRadius:22, overflow:"hidden", marginBottom:20,
            background:"linear-gradient(135deg,rgba(99,102,241,.13),rgba(168,85,247,.07)),rgba(12,11,26,.97)",
            border:"1px solid rgba(99,102,241,.22)" }}>
          {/* shimmer top line */}
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)" }}/>
          <div style={{ padding:"22px 24px 18px" }}>
            {/* badges */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:".72rem", fontWeight:700, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:".07em",
                background: isClient ? "rgba(251,191,36,.1)" : "rgba(99,102,241,.12)",
                color: isClient ? "#fbbf24" : "#a5b4fc",
                border: isClient ? "1px solid rgba(251,191,36,.28)" : "1px solid rgba(99,102,241,.3)" }}>
                {isClient ? "👔 Client" : "💻 Freelancer"}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:".72rem", fontWeight:700, padding:"4px 12px", borderRadius:20,
                background:ps.bg, border:`1px solid ${ps.border}`, color:ps.color }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:ps.dot, boxShadow:`0 0 6px ${ps.dot}` }}/>
                {ps.label}
              </span>
              {isCompleted && (
                <span style={{ fontSize:".72rem", fontWeight:700, padding:"4px 12px", borderRadius:20,
                  background:(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).color==="#4ade80"?"rgba(34,197,94,.1)":"rgba(249,115,22,.1)",
                  color:(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).color,
                  border:`1px solid ${(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).color}40` }}>
                  {(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).icon} {(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).label}
                </span>
              )}
            </div>

            <h1 className="ws-grad" style={{ fontSize:"1.65rem", fontWeight:800, marginBottom:4, lineHeight:1.2 }}>{project.title}</h1>
            <p style={{ color:"rgba(148,163,184,.5)", fontSize:".82rem", marginBottom:16 }}>Project Workspace</p>

            {/* progress bar */}
            {milestones.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:".76rem", color:"rgba(148,163,184,.6)", fontWeight:500 }}>
                    {milestones.filter(m=>m.status==="approved").length}/{milestones.length} milestones approved
                  </span>
                  <span style={{ fontSize:".76rem", fontWeight:800, color:"#818cf8" }}>{pct}%</span>
                </div>
                <div style={{ height:6, borderRadius:99, background:"rgba(99,102,241,.12)", overflow:"hidden" }}>
                  <div className="progress-fill" style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:"linear-gradient(90deg,#6366f1,#a855f7)" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:".7rem", color:"rgba(148,163,184,.4)" }}>₹{earnedSoFar(milestones).toLocaleString()} approved</span>
                  <span style={{ fontSize:".7rem", color:"rgba(148,163,184,.4)" }}>₹{totalMs(milestones).toLocaleString()} total</span>
                </div>
              </div>
            )}

            {/* action buttons */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              <Ghost onClick={handleChat} disabled={chatLoading}>
                <MessageSquare size={13}/> {chatLoading ? "Opening…" : `Chat with ${isClient?"Freelancer":"Client"}`}
              </Ghost>
              {isClient && project.status==="in-progress" && (
                <GBtn onClick={handleComplete} disabled={actionLoading} color="green">
                  <Flag size={13}/> Mark Complete
                </GBtn>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── STATS ROW ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {[
            { icon:DollarSign, label:"Budget",     val:`₹${project.budget?.toLocaleString()}` },
            { icon:Layers,     label:"Milestones", val:milestones.length },
            { icon:CheckCircle,label:"Approved",   val:milestones.filter(m=>m.status==="approved").length },
            { icon:Calendar,   label:"Deadline",   val:fmtDate(project.deadline) },
          ].map(({ icon:Icon, label, val },i) => (
            <motion.div key={label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.06}}
              className="ws-card" style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:"rgba(99,102,241,.14)" }}>
                <Icon size={15} style={{color:"#818cf8"}}/>
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:".68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(148,163,184,.5)" }}>{label}</p>
                <p style={{ color:"#e2e8f0", fontWeight:800, fontSize:".9rem", marginTop:1 }}>{val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", gap:6, marginBottom:20, padding:"4px", borderRadius:14, background:"rgba(13,12,28,.8)", border:"1px solid rgba(99,102,241,.13)", width:"fit-content" }}>
          {tabs.map(({ key, label, icon:TIcon }) => (
            <button key={key} onClick={()=>setTab(key)}
              className={tab===key ? "tab-active" : ""}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:"1px solid transparent", background:"none", color:"rgba(148,163,184,.6)", fontSize:".82rem", fontWeight:600, cursor:"pointer", transition:"all .2s" }}>
              <TIcon size={13}/> {label}
            </button>
          ))}
        </div>

        {/* ── CONTENT GRID ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>

          {/* LEFT */}
          <div>
            {/* MILESTONES TAB */}
            {tab==="milestones" && (
              <div className="ws-card" style={{ padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,.15)" }}>
                      <Layers size={14} style={{color:"#818cf8"}}/>
                    </div>
                    <h3 style={{ color:"#e2e8f0", fontWeight:700, fontSize:".9rem", textTransform:"uppercase", letterSpacing:".06em" }}>Milestones</h3>
                  </div>
                  {isClient && !isCompleted && (
                    <GBtn onClick={()=>{setForm(emptyForm);setAddOpen(true);}} size="xs"><Plus size={13}/> Add</GBtn>
                  )}
                </div>

                {milestones.length===0 ? (
                  <div style={{ padding:"40px 20px", textAlign:"center", borderRadius:14, border:"1px dashed rgba(99,102,241,.2)", background:"rgba(13,12,28,.5)" }}>
                    <Layers size={32} style={{ color:"rgba(99,102,241,.3)", marginBottom:10 }}/>
                    <p style={{ color:"rgba(148,163,184,.6)", fontWeight:600, fontSize:".88rem" }}>No milestones yet</p>
                    {isClient && <p style={{ color:"rgba(148,163,184,.4)", fontSize:".78rem", marginTop:4 }}>Break the project into trackable milestones</p>}
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {milestones.map((m,i) => (
                      <MilestoneCard key={m._id} m={m} idx={i} isClient={isClient} isFreelancer={isFreelancer} actionLoading={actionLoading} onAction={handleAction}/>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OVERVIEW TAB */}
            {tab==="overview" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="ws-card" style={{ padding:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:30, height:30, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,.15)" }}>
                      <FileText size={14} style={{color:"#818cf8"}}/>
                    </div>
                    <h3 style={{ color:"#e2e8f0", fontWeight:700, fontSize:".9rem", textTransform:"uppercase", letterSpacing:".06em" }}>Project Brief</h3>
                  </div>
                  <p style={{ color:"rgba(148,163,184,.8)", fontSize:".875rem", lineHeight:1.75, whiteSpace:"pre-line" }}>{project.description}</p>
                </div>
                {project.attachments?.length > 0 && (
                  <div className="ws-card" style={{ padding:20 }}>
                    <h3 style={{ color:"rgba(148,163,184,.6)", fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Attachments</h3>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {project.attachments.map((f,i) => (
                        <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:10, background:"rgba(30,27,75,.5)", border:"1px solid rgba(99,102,241,.2)", color:"#a5b4fc", textDecoration:"none", fontSize:".8rem" }}>
                          <ExternalLink size={11}/> {f}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT TAB */}
            {tab==="payment" && isCompleted && (
              <div className="ws-card" style={{ padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ width:30, height:30, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(245,158,11,.15)" }}>
                    <CreditCard size={14} style={{color:"#f59e0b"}}/>
                  </div>
                  <h3 style={{ color:"#e2e8f0", fontWeight:700, fontSize:".9rem", textTransform:"uppercase", letterSpacing:".06em" }}>Payment</h3>
                </div>

                {isClient ? (
                  <PaymentPanel project={project} onPay={handlePay}/>
                ) : (
                  <div style={{ padding:"16px", borderRadius:14, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.18)", textAlign:"center" }}>
                    <TrendingUp size={32} style={{ color:"#818cf8", marginBottom:10 }}/>
                    <p style={{ color:"#e2e8f0", fontWeight:700, marginBottom:4 }}>Payment Status</p>
                    <p style={{ fontSize:"1.6rem", fontWeight:800, color:(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).color }}>
                      {(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).icon} ₹{project.budget?.toLocaleString()}
                    </p>
                    <p style={{ color:"rgba(148,163,184,.5)", fontSize:".8rem", marginTop:4 }}>{(PAY_CFG[project.paymentStatus]||PAY_CFG.unpaid).label}</p>
                  </div>
                )}
              </div>
            )}

            {/* REVIEW TAB */}
            {tab==="review" && isCompleted && (
              <div className="ws-card" style={{ padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ width:30, height:30, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(251,191,36,.15)" }}>
                    <Star size={14} style={{color:"#fbbf24"}}/>
                  </div>
                  <h3 style={{ color:"#e2e8f0", fontWeight:700, fontSize:".9rem", textTransform:"uppercase", letterSpacing:".06em" }}>Reviews</h3>
                </div>
                <ReviewPanel project={project} isClient={isClient} isFreelancer={isFreelancer} onSubmitReview={handleReview}/>

                {/* show both reviews if available */}
                {project.clientReview && project.isReviewedByClient && isFreelancer && (
                  <div style={{ marginTop:16, padding:"14px 16px", borderRadius:14, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.18)" }}>
                    <p style={{ color:"rgba(148,163,184,.5)", fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Client's Review of You</p>
                    <div style={{ display:"flex", gap:3, marginBottom:6 }}>
                      {[1,2,3,4,5].map(n=><Star key={n} size={14} fill={n<=project.clientReview.rating?"#fbbf24":"none"} stroke={n<=project.clientReview.rating?"#fbbf24":"rgba(148,163,184,.3)"}/>)}
                    </div>
                    {project.clientReview.comment && <p style={{ color:"rgba(148,163,184,.7)", fontSize:".84rem" }}>{project.clientReview.comment}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Other party */}
            <div className="ws-card" style={{ padding:16 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(148,163,184,.5)", marginBottom:12 }}>
                {isClient ? "Assigned Freelancer" : "Client"}
              </p>
              {other ? (
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", overflow:"hidden", flexShrink:0, border:"2px solid rgba(99,102,241,.3)" }}>
                    <img src={other.avatar||"/photo.jpg"} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ color:"#e2e8f0", fontWeight:700, fontSize:".88rem" }}>{other.name}</p>
                    <p style={{ color:"rgba(148,163,184,.5)", fontSize:".74rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{other.email}</p>
                    {other.rating > 0 && (
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:3 }}>
                        <Star size={11} fill="#fbbf24" stroke="#fbbf24"/>
                        <span style={{ color:"#fbbf24", fontSize:".75rem", fontWeight:700 }}>{other.rating}</span>
                      </div>
                    )}
                    {isClient && other.skills?.slice(0,3).map((s,i)=>
                      <span key={i} className="ws-pill" style={{ marginRight:4, marginTop:4, display:"inline-block" }}>{s}</span>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color:"rgba(148,163,184,.5)", fontSize:".84rem" }}>Not assigned yet</p>
              )}
            </div>

            {/* Timeline */}
            <div className="ws-card" style={{ padding:16 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(148,163,184,.5)", marginBottom:12 }}>Timeline</p>
              {[["Posted",project.createdAt],["Started",project.startedAt],["Deadline",project.deadline],["Completed",project.completedAt]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:"rgba(148,163,184,.5)", fontSize:".78rem" }}>{l}</span>
                  <span style={{ color:"#e2e8f0", fontSize:".78rem", fontWeight:600 }}>{fmtDate(v)}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            {project.skillsRequired?.length > 0 && (
              <div className="ws-card" style={{ padding:16 }}>
                <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(148,163,184,.5)", marginBottom:10 }}>Skills Required</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {project.skillsRequired.map((s,i)=><span key={i} className="ws-pill">{s}</span>)}
                </div>
              </div>
            )}

            {/* Milestone counts */}
            {milestones.length > 0 && (
              <div className="ws-card" style={{ padding:16 }}>
                <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(148,163,184,.5)", marginBottom:12 }}>Status Breakdown</p>
                {Object.entries(MS_CFG).map(([key,cfg])=>{
                  const count = milestones.filter(m=>m.status===key).length;
                  if (!count) return null;
                  const Icon = cfg.icon;
                  return (
                    <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <Icon size={12} style={{color:cfg.color}}/>
                        <span style={{ color:"rgba(148,163,184,.65)", fontSize:".8rem" }}>{cfg.label}</span>
                      </div>
                      <span style={{ color:cfg.color, fontWeight:700, fontSize:".82rem" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Add milestone */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Milestone" icon={Plus}>
        <form onSubmit={handleAddMilestone} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Design Mockups" required/>
          <Field label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What will be delivered…" rows={3}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Amount (₹)" type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="5000" required/>
            <Field label="Due Date" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
          </div>
          <GBtn size="md" full disabled={actionLoading}><Plus size={14}/>{actionLoading?"Adding…":"Add Milestone"}</GBtn>
        </form>
      </Modal>

      {/* Edit milestone */}
      <Modal open={editOpen} onClose={()=>setEditOpen(false)} title="Edit Milestone" icon={Edit2}>
        <form onSubmit={handleEditMilestone} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Milestone title" required/>
          <Field label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What will be delivered…" rows={3}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Amount (₹)" type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/>
            <Field label="Due Date" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
          </div>
          <GBtn size="md" full disabled={actionLoading}><Edit2 size={14}/>{actionLoading?"Saving…":"Save Changes"}</GBtn>
        </form>
      </Modal>

      {/* Submit work */}
      <Modal open={submitOpen} onClose={()=>setSubmitOpen(false)} title="Submit Milestone Work" icon={Send}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="Note to Client" value={submitForm.note} onChange={e=>setSubmitForm({...submitForm,note:e.target.value})} placeholder="Describe what you've completed, any context…" rows={4}/>
          <Field label="Deliverable URLs (one per line)" value={submitForm.files} onChange={e=>setSubmitForm({...submitForm,files:e.target.value})} placeholder={"https://github.com/you/repo\nhttps://figma.com/design-link"} rows={3}/>
          <div style={{ display:"flex", gap:8 }}>
            <GBtn onClick={handleSubmitMilestone} disabled={actionLoading} color="purple" size="md" full><Send size={14}/>{actionLoading?"Submitting…":"Submit for Review"}</GBtn>
            <Ghost onClick={()=>setSubmitOpen(false)}>Cancel</Ghost>
          </div>
        </div>
      </Modal>

      {/* Request changes */}
      <Modal open={rejectOpen} onClose={()=>setRejectOpen(false)} title="Request Changes" icon={AlertCircle}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", borderRadius:12, background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)" }}>
            <p style={{ color:"rgba(148,163,184,.7)", fontSize:".82rem" }}>The freelancer will see your feedback and can resubmit.</p>
          </div>
          <Field label="Feedback" value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Explain what needs to be changed or improved…" rows={4}/>
          <div style={{ display:"flex", gap:8 }}>
            <GBtn onClick={handleRejectMilestone} disabled={actionLoading} color="red" size="md" full><AlertCircle size={14}/>{actionLoading?"Sending…":"Request Changes"}</GBtn>
            <Ghost onClick={()=>setRejectOpen(false)}>Cancel</Ghost>
          </div>
        </div>
      </Modal>

    </div>
  );
}