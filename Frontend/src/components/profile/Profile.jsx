// pages/Profile.jsx
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { getUserDetailsAction } from "../../actions/userAction";
import SpinLoader from "../layout/SpinLoader";

const InfoCard = ({ title, value, icon }) => (
  <motion.div whileHover={{ y:-3 }} transition={{ type:"spring", stiffness:300 }}
    className="relative rounded-2xl p-5 transition-all"
    style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.2)" }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color:"rgba(148,163,184,0.6)" }}>{title}</p>
        <p className="text-slate-100 font-semibold text-sm mt-1">{value}</p>
      </div>
      {icon && <span className="text-2xl opacity-70">{icon}</span>}
    </div>
    <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)" }}/>
  </motion.div>
);

const getPlatformIcon = (platform = "") => {
  const p = platform.toLowerCase();
  if (p.includes("github"))   return "🐙";
  if (p.includes("linkedin")) return "💼";
  if (p.includes("dribbble")) return "🏀";
  if (p.includes("behance"))  return "🅱️";
  if (p.includes("figma"))    return "🎨";
  if (p.includes("youtube"))  return "▶️";
  if (p.includes("twitter"))  return "🐦";
  return "🔗";
};

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);
  const { userDetails, isLoading } = useSelector((s) => s.userDetails);
  const isMe = user?._id === id || "me" === id;

  useEffect(() => {
    dispatch(getUserDetailsAction(id === "me" ? user._id : id));
  }, [dispatch, id]);

  if (isLoading || !userDetails) return <SpinLoader />;

  const profile = userDetails;

  return (
    <div className="min-h-screen px-4 py-12 relative overflow-hidden"
      style={{ fontFamily:"'DM Sans',sans-serif", background:"#0a0c18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text { font-family:'Syne',sans-serif; background:linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .section-title { font-family:'Syne',sans-serif; }
        .skill-tag { background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.25); color:#a5b4fc; border-radius:8px; padding:4px 12px; font-size:0.78rem; font-weight:600; }
        .portfolio-card:hover { border-color:rgba(99,102,241,0.5)!important; box-shadow:0 0 20px rgba(99,102,241,0.12); }
      `}</style>

      <div style={{ position:"absolute", top:"8%", left:"5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.11) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"10%", right:"5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* HEADER CARD */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6 }}
          className="relative rounded-2xl p-6 md:p-8 mb-6"
          style={{ background:"rgba(13,12,28,0.9)", backdropFilter:"blur(24px)", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px" style={{ background:"linear-gradient(90deg,transparent,#6366f1,transparent)" }}/>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", padding:2 }}>
                <div className="w-full h-full rounded-full" style={{ background:"#0a0c18" }}/>
              </div>
              <img src={profile?.avatar || "/photo.jpg"} alt=""
                className="relative w-24 h-24 rounded-full object-cover" style={{ zIndex:1 }}/>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2" style={{ borderColor:"#0a0c18", zIndex:2 }}/>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
                {profile.role}
              </div>
              <h1 className="section-title text-2xl md:text-3xl font-bold text-slate-100 mb-1">{profile.name}</h1>
              <p className="text-slate-500 text-sm">{profile.email}</p>
            </div>

            {isMe && (
              <Link to="/edit-user"
                className="shrink-0 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 20px rgba(99,102,241,0.3)" }}>
                Edit Profile
              </Link>
            )}
          </div>

          <div className="mt-6 pt-6" style={{ borderTop:"1px solid rgba(99,102,241,0.12)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.5)" }}>Bio</p>
            <p className="text-slate-400 text-sm leading-relaxed">{profile.bio || "No bio added yet."}</p>
          </div>
        </motion.div>

        {/* CLIENT DATA */}
        {profile.role === "client" && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.15 }}>
            <h2 className="section-title text-lg font-bold text-slate-300 mb-4 px-1">Client Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard title="Company" value={profile.companyName || "Not added"} icon="🏢"/>
              <InfoCard title="Website"  value={profile.website    || "Not added"} icon="🌐"/>
              <InfoCard title="Total Spent" value={`₹${profile.totalSpent || 0}`}  icon="💸"/>
              <InfoCard title="Rating"   value={`⭐ ${profile.rating || 0}`}        icon="📊"/>
            </div>
          </motion.div>
        )}

        {/* FREELANCER DATA */}
        {profile.role === "freelancer" && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.15 }}
            className="space-y-5">
            <h2 className="section-title text-lg font-bold text-slate-300 mb-4 px-1">Freelancer Overview</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard title="Experience"     value={`${profile.experience} yrs`}   icon="🧠"/>
              <InfoCard title="Hourly Rate"    value={`₹${profile.hourlyRate}/hr`}    icon="⏱️"/>
              <InfoCard title="Total Earnings" value={`₹${profile.totalEarnings}`}    icon="💰"/>
              <InfoCard title="Rating"         value={`⭐ ${profile.rating}`}          icon="🏆"/>
            </div>

            {/* Skills */}
            <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color:"rgba(148,163,184,0.55)" }}>Skills</p>
              {profile.skills?.length
                ? <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                  </div>
                : <p className="text-slate-500 text-sm">No skills added</p>}
            </div>

            {/* Portfolio Links */}
            {profile.portfolioLinks?.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">🔗</span>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(148,163,184,0.55)" }}>Portfolio Links</p>
                  <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.25),transparent)" }}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.portfolioLinks.map((link, i) => (
                    <motion.a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      whileHover={{ y:-2 }} transition={{ type:"spring", stiffness:300 }}
                      className="portfolio-card flex items-center gap-3 p-3.5 rounded-xl transition-all"
                      style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.2)", textDecoration:"none" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background:"rgba(99,102,241,0.15)" }}>
                        {getPlatformIcon(link.platform)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-200 text-sm font-semibold truncate">{link.platform}</p>
                        <p className="text-indigo-400 text-xs truncate">{link.url}</p>
                      </div>
                      <span className="ml-auto text-slate-600 text-xs shrink-0">↗</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;