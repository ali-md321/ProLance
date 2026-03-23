// freelancer/Dashboard.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { TrendingUp, Briefcase, CheckCircle, Clock, DollarSign, Star, FileText, Activity } from "lucide-react";
import { getFreelancerStatsAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";

const StatCard = ({ icon: Icon, label, value, sub, color = "#818cf8", delay = 0 }) => (
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45, delay }}
    className="rounded-2xl p-5 relative overflow-hidden"
    style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
      style={{ background:`radial-gradient(circle,${color}18 0%,transparent 70%)`, transform:"translate(30%,-30%)" }}/>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
        <Icon size={18} style={{ color }}/>
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-100 mb-0.5" style={{ fontFamily:"'Syne',sans-serif" }}>{value}</p>
    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(148,163,184,0.55)" }}>{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color:"rgba(148,163,184,0.4)" }}>{sub}</p>}
    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${color}40,transparent)` }}/>
  </motion.div>
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);
  const { stats, isLoading } = useSelector((s) => s.freelancerStats || {});

  useEffect(() => { dispatch(getFreelancerStatsAction()); }, [dispatch]);

  if (isLoading) return <SpinLoader />;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');.grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}`}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45 }} className="mb-8">
        <p className="text-slate-500 text-sm mb-1">Welcome back 👋</p>
        <h1 className="grad-text text-3xl font-bold">{user?.name || "Freelancer"}</h1>
        <p className="text-slate-600 text-sm mt-1">Here's your performance overview</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Earnings"   value={`₹${stats?.totalEarnings?.toLocaleString() || 0}`}  color="#818cf8" delay={.05}/>
        <StatCard icon={Briefcase}  label="Active Projects"  value={stats?.activeProjects  || 0} sub="in progress"        color="#a855f7" delay={.1} />
        <StatCard icon={CheckCircle}label="Completed"        value={stats?.completedProjects|| 0} sub="projects done"     color="#14b8a6" delay={.15}/>
        <StatCard icon={FileText}   label="Proposals Sent"   value={stats?.totalProposals  || 0} sub="total submitted"    color="#f59e0b" delay={.2} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Earnings breakdown */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.25 }}
          className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(99,102,241,0.15)" }}>
              <TrendingUp size={14} style={{ color:"#818cf8" }}/>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Earnings Breakdown</h3>
          </div>
          <div className="space-y-3">
            {[
              { label:"This Month",   value: stats?.thisMonthEarnings,  color:"#818cf8" },
              { label:"Last Month",   value: stats?.lastMonthEarnings,  color:"#a855f7" },
              { label:"In Escrow",    value: stats?.escrowAmount,       color:"#f59e0b" },
              { label:"Pending",      value: stats?.pendingPayments,    color:"#14b8a6" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background:"rgba(30,27,75,0.4)", border:"1px solid rgba(99,102,241,0.1)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ background:color }}/>
                  <span className="text-slate-400 text-sm">{label}</span>
                </div>
                <span className="text-slate-200 font-bold text-sm">₹{value?.toLocaleString() || 0}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Profile stats */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.3 }}
          className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(99,102,241,0.15)" }}>
              <Activity size={14} style={{ color:"#818cf8" }}/>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Profile Stats</h3>
          </div>
          <div className="space-y-3">
            {[
              { label:"Rating",           value: `⭐ ${user?.rating || 0}`, icon: Star      },
              { label:"Hourly Rate",       value: `₹${user?.hourlyRate || 0}/hr`, icon: DollarSign },
              { label:"Experience",        value: `${user?.experience || 0} years`, icon: Clock  },
              { label:"Proposals Accepted",value: stats?.acceptedProposals || 0, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background:"rgba(30,27,75,0.4)", border:"1px solid rgba(99,102,241,0.1)" }}>
                <div className="flex items-center gap-2.5">
                  <Icon size={13} style={{ color:"#818cf8" }}/>
                  <span className="text-slate-400 text-sm">{label}</span>
                </div>
                <span className="text-slate-200 font-bold text-sm">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}