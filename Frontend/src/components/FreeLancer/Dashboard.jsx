// freelancer/Dashboard.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, Briefcase, CheckCircle, Clock, DollarSign,
  Star, FileText, Activity, ArrowRight, Zap,
} from "lucide-react";
import { getFreelancerStatsAction } from "../../actions/workspaceAction";
import SpinLoader from "../layout/SpinLoader";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
  .grad{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .dash-card{background:rgba(13,12,28,0.92);border:1px solid rgba(99,102,241,0.16);border-radius:20px;position:relative;overflow:hidden;}
  .stat-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:12px;background:rgba(30,27,75,0.45);border:1px solid rgba(99,102,241,0.1);margin-bottom:8px;}
  .quick-link{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(30,27,75,0.4);border:1px solid rgba(99,102,241,0.14);cursor:pointer;transition:all .2s;}
  .quick-link:hover{background:rgba(99,102,241,0.12);border-color:rgba(99,102,241,0.3);transform:translateX(3px);}
`;

const StatCard = ({ icon: Icon, label, value, sub, color = "#818cf8", delay = 0 }) => (
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45, delay }}
    className="dash-card" style={{ padding:20 }}>
    <div style={{ position:"absolute", top:0, right:0, width:80, height:80, borderRadius:"50%", background:`radial-gradient(circle,${color}20 0%,transparent 70%)`, transform:"translate(30%,-30%)", pointerEvents:"none" }}/>
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
      <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:`${color}18`, border:`1px solid ${color}28`, flexShrink:0 }}>
        <Icon size={18} style={{ color }}/>
      </div>
    </div>
    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.6rem", fontWeight:800, color:"#e2e8f0", marginBottom:2 }}>{value}</p>
    <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", color:"rgba(148,163,184,.5)" }}>{label}</p>
    {sub && <p style={{ fontSize:".72rem", color:"rgba(148,163,184,.35)", marginTop:2 }}>{sub}</p>}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color}50,transparent)` }}/>
  </motion.div>
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.user);
  const { freelancerStats: stats, statsLoading } = useSelector(s => s.workspace);

  useEffect(() => { dispatch(getFreelancerStatsAction()); }, [dispatch]);

  if (statsLoading && !stats) return <SpinLoader />;

  const ratingStars = Math.round(stats?.rating || user?.rating || 0);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{css}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45 }} style={{ marginBottom:28 }}>
        <p style={{ color:"rgba(148,163,184,.5)", fontSize:".84rem", marginBottom:4 }}>Welcome back 👋</p>
        <h1 className="grad" style={{ fontSize:"1.9rem", fontWeight:800, lineHeight:1.1 }}>{user?.name || "Freelancer"}</h1>
        <p style={{ color:"rgba(148,163,184,.4)", fontSize:".82rem", marginTop:4 }}>Here's your performance overview</p>
      </motion.div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <StatCard icon={DollarSign} label="Total Earnings"   value={`₹${(stats?.totalEarnings||0).toLocaleString()}`}  color="#818cf8" delay={.05}/>
        <StatCard icon={Briefcase}  label="Active Projects"  value={stats?.activeProjects||0}    sub="in progress"     color="#a855f7" delay={.1}/>
        <StatCard icon={CheckCircle}label="Completed"        value={stats?.completedProjects||0}  sub="projects done"  color="#14b8a6" delay={.15}/>
        <StatCard icon={FileText}   label="Proposals Sent"   value={stats?.totalProposals||0}     sub="total"          color="#f59e0b" delay={.2}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

        {/* Earnings breakdown */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.25 }} className="dash-card" style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:28, height:28, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,.15)" }}>
              <TrendingUp size={13} style={{color:"#818cf8"}}/>
            </div>
            <h3 style={{ color:"rgba(148,163,184,.8)", fontSize:".78rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em" }}>Earnings Breakdown</h3>
          </div>
          {[
            { label:"This Month",  value:stats?.thisMonthEarnings,  color:"#818cf8" },
            { label:"Last Month",  value:stats?.lastMonthEarnings,  color:"#a855f7" },
            { label:"In Escrow",   value:stats?.escrowAmount,       color:"#f59e0b" },
            { label:"Pending",     value:stats?.pendingPayments,    color:"#14b8a6" },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-row">
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}` }}/>
                <span style={{ color:"rgba(148,163,184,.7)", fontSize:".84rem" }}>{label}</span>
              </div>
              <span style={{ color:"#e2e8f0", fontWeight:700, fontSize:".84rem" }}>₹{(value||0).toLocaleString()}</span>
            </div>
          ))}
        </motion.div>

        {/* Profile stats */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.3 }} className="dash-card" style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:28, height:28, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,.15)" }}>
              <Activity size={13} style={{color:"#818cf8"}}/>
            </div>
            <h3 style={{ color:"rgba(148,163,184,.8)", fontSize:".78rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em" }}>Profile Stats</h3>
          </div>

          {/* Star rating display */}
          <div className="stat-row">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Star size={13} style={{color:"#fbbf24"}}/>
              <span style={{ color:"rgba(148,163,184,.7)", fontSize:".84rem" }}>Rating</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={13} fill={n<=ratingStars?"#fbbf24":"none"} stroke={n<=ratingStars?"#fbbf24":"rgba(148,163,184,.3)"}/>
              ))}
              <span style={{ color:"#fbbf24", fontWeight:700, fontSize:".82rem", marginLeft:4 }}>
                {stats?.rating || user?.rating || 0}
              </span>
            </div>
          </div>

          {[
            { label:"Hourly Rate",        value:`₹${user?.hourlyRate||0}/hr`,             icon:DollarSign },
            { label:"Experience",         value:`${user?.experience||0} yrs`,             icon:Clock      },
            { label:"Accepted Proposals", value:stats?.acceptedProposals||0,              icon:CheckCircle},
          ].map(({ label, value, icon:Icon }) => (
            <div key={label} className="stat-row">
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Icon size={13} style={{color:"#818cf8"}}/>
                <span style={{ color:"rgba(148,163,184,.7)", fontSize:".84rem" }}>{label}</span>
              </div>
              <span style={{ color:"#e2e8f0", fontWeight:700, fontSize:".84rem" }}>{value}</span>
            </div>
          ))}

          {/* Quick links */}
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
            <div className="quick-link" onClick={()=>navigate("/freelancer/browse-projects")}>
              <Zap size={13} style={{color:"#818cf8"}}/> <span style={{ color:"#a5b4fc", fontSize:".82rem", fontWeight:600 }}>Browse Projects</span>
              <ArrowRight size={12} style={{ color:"rgba(148,163,184,.4)", marginLeft:"auto" }}/>
            </div>
            <div className="quick-link" onClick={()=>navigate("/freelancer/active-projects")}>
              <Briefcase size={13} style={{color:"#a855f7"}}/> <span style={{ color:"#a5b4fc", fontSize:".82rem", fontWeight:600 }}>Active Projects</span>
              <ArrowRight size={12} style={{ color:"rgba(148,163,184,.4)", marginLeft:"auto" }}/>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}