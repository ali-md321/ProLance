// pages/client/MyProjects.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyProjectsAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";
import { Briefcase, Clock, DollarSign, Users, ChevronRight, Plus } from "lucide-react";

const categoryCovers = {
  "web development":   "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  "mobile app":        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
  "graphic design":    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
  "ui/ux":             "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80",
  "data science":      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "machine learning":  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  "video editing":     "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
  "writing":           "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80",
  "seo":               "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80",
  "blockchain":        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
  "default":           "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
};

const getCover = (category = "", skills = []) => {
  const key = [category, ...skills].map(s => s.toLowerCase()).find(s =>
    Object.keys(categoryCovers).some(k => s.includes(k))
  );
  if (!key) return categoryCovers["default"];
  const match = Object.keys(categoryCovers).find(k => key.includes(k));
  return categoryCovers[match] || categoryCovers["default"];
};

const statusStyle = {
  "open":              { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",   color: "#4ade80", dot: "#22c55e" },
  "proposal-selected": { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)",  color: "#fbbf24", dot: "#f59e0b" },
  "in-progress":       { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.35)", color: "#a5b4fc", dot: "#6366f1" },
  "submitted":         { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)",  color: "#d8b4fe", dot: "#a855f7" },
  "completed":         { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.3)",  color: "#5eead4", dot: "#14b8a6" },
  "cancelled":         { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",  color: "#fca5a5", dot: "#ef4444" },
  "disputed":          { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)",  color: "#fdba74", dot: "#f97316" },
};

const expIcon = { entry: "🌱", intermediate: "⚡", expert: "🏆" };

export default function MyProjects() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading } = useSelector((s) => s.myProjects);

  useEffect(() => { 
    dispatch(getMyProjectsAction()); 
  }, [dispatch]);

  if (isLoading) return <SpinLoader />;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text { font-family:'Syne',sans-serif; background:linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .proj-card { transition: transform .22s ease, box-shadow .22s ease; }
        .proj-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(99,102,241,0.18); }
        .proj-card:hover .cover-img { transform: scale(1.06); }
        .cover-img { transition: transform .4s ease; }
        .skill-pill { background:rgba(99,102,241,0.13); border:1px solid rgba(99,102,241,0.22); color:#a5b4fc; border-radius:6px; padding:2px 9px; font-size:0.72rem; font-weight:600; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="grad-text text-3xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>My Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects?.length || 0} projects found</p>
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }}
          onClick={() => navigate("/client/create-project")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 20px rgba(99,102,241,0.3)" }}>
          <Plus size={16}/> New Project
        </motion.button>
      </div>

      {/* Empty state */}
      {!projects?.length && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ border:"1px dashed rgba(99,102,241,0.25)", background:"rgba(13,12,28,0.6)" }}>
          <Briefcase size={40} className="mb-4" style={{ color:"rgba(99,102,241,0.4)" }}/>
          <p className="text-slate-500 font-medium">No projects yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first project to get started</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects?.map((project, i) => {
          const s = statusStyle[project.status] || statusStyle["open"];
          const cover = getCover(project.category, project.skillsRequired);
          return (
            <motion.div key={project._id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:.4, delay: i * 0.07 }}
              className="proj-card rounded-2xl overflow-hidden cursor-pointer"
              style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}
              onClick={() => navigate(`/projects/${project._id}`)}>

              {/* Cover */}
              <div className="relative h-36 overflow-hidden">
                <img src={cover} alt="" className="cover-img w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, rgba(10,12,24,0.2) 0%, rgba(10,12,24,0.85) 100%)" }}/>
                {/* Status badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: s.bg, border:`1px solid ${s.border}`, color: s.color, backdropFilter:"blur(8px)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }}/>
                  {project.status.replace("-", " ")}
                </div>
                {/* Exp badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", backdropFilter:"blur(8px)" }}>
                  {expIcon[project.experienceLevel]} {project.experienceLevel}
                </div>
                {/* Title over image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-slate-100 font-bold text-base leading-tight line-clamp-2"
                    style={{ fontFamily:"'Syne',sans-serif", textShadow:"0 1px 8px rgba(0,0,0,0.8)" }}>
                    {project.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                {/* Skills */}
                {project.skillsRequired?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.skillsRequired.slice(0, 3).map((s, i) => (
                      <span key={i} className="skill-pill">{s}</span>
                    ))}
                    {project.skillsRequired.length > 3 && (
                      <span className="skill-pill">+{project.skillsRequired.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center py-2 rounded-xl"
                    style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.12)" }}>
                    <DollarSign size={13} style={{ color:"#818cf8" }} className="mb-0.5"/>
                    <span className="text-slate-200 text-xs font-bold">₹{project.budget?.toLocaleString()}</span>
                    <span className="text-slate-600" style={{ fontSize:"0.65rem" }}>{project.budgetType}</span>
                  </div>
                  <div className="flex flex-col items-center py-2 rounded-xl"
                    style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.12)" }}>
                    <Users size={13} style={{ color:"#818cf8" }} className="mb-0.5"/>
                    <span className="text-slate-200 text-xs font-bold">{project.totalProposals}</span>
                    <span className="text-slate-600" style={{ fontSize:"0.65rem" }}>proposals</span>
                  </div>
                  <div className="flex flex-col items-center py-2 rounded-xl"
                    style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.12)" }}>
                    <Clock size={13} style={{ color:"#818cf8" }} className="mb-0.5"/>
                    <span className="text-slate-200 text-xs font-bold">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—"}
                    </span>
                    <span className="text-slate-600" style={{ fontSize:"0.65rem" }}>deadline</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop:"1px solid rgba(99,102,241,0.1)" }}>
                  <span className="text-slate-600 text-xs">
                    {new Date(project.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                  </span>
                  <div className="flex items-center gap-1 text-indigo-400 text-xs font-semibold">
                    View Details <ChevronRight size={13}/>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}