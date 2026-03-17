// freelancer/ActiveProjects.jsx  &  CompletedProjects.jsx
// — shared ProjectList component, different status filter —
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getProjectDetailsAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";
import { Briefcase, CheckCircle, DollarSign, Clock, ChevronRight, Layers } from "lucide-react";

const categoryCovers = {
  "web development":  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  "mobile app":       "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
  "graphic design":   "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
  "ui/ux":            "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80",
  "data science":     "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "default":          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
};
const getCover = (cat="", skills=[]) => {
  const key = [cat,...skills].map(s=>s.toLowerCase()).find(s=>Object.keys(categoryCovers).some(k=>s.includes(k)));
  if (!key) return categoryCovers["default"];
  const match = Object.keys(categoryCovers).find(k=>key.includes(k));
  return categoryCovers[match] || categoryCovers["default"];
};

const milestoneProgress = (milestones=[]) => {
  if (!milestones.length) return 0;
  const done = milestones.filter(m => m.status === "approved").length;
  return Math.round((done / milestones.length) * 100);
};

function ProjectList({ type }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading } = useSelector((s) => s.freelancerProjects || {});

  useEffect(() => { dispatch(getProjectDetailsAction(type)); }, [dispatch, type]);

  const isActive    = type === "active";
  const Icon        = isActive ? Briefcase : CheckCircle;
  const accentColor = isActive ? "#818cf8"  : "#14b8a6";
  const title       = isActive ? "Active Projects" : "Completed Projects";
  const empty       = isActive ? "No active projects yet" : "No completed projects yet";

  if (isLoading) return <SpinLoader />;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');.grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.skill-pill{background:rgba(99,102,241,0.13);border:1px solid rgba(99,102,241,0.22);color:#a5b4fc;border-radius:6px;padding:2px 9px;font-size:0.72rem;font-weight:600;}.cover-img{transition:transform .4s ease;}.proj-card:hover .cover-img{transform:scale(1.05);}.proj-card{transition:transform .2s,box-shadow .2s;}.proj-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(99,102,241,0.15);}`}</style>

      <div className="mb-7">
        <h1 className="grad-text text-3xl font-bold mb-1">{title}</h1>
        <p className="text-slate-500 text-sm">{projects?.length || 0} projects</p>
      </div>

      {!projects?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border:"1px dashed rgba(99,102,241,0.25)", background:"rgba(13,12,28,0.6)" }}>
          <Icon size={38} className="mb-3" style={{ color:`${accentColor}55` }}/>
          <p className="text-slate-500 font-medium">{empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project, i) => {
            const progress = milestoneProgress(project.milestones);
            return (
              <motion.div key={project._id}
                initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay: i*0.07 }}
                className="proj-card rounded-2xl overflow-hidden cursor-pointer"
                style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}
                onClick={() => navigate(`/freelancer/projects/${project._id}`)}>
                {/* Cover */}
                <div className="relative h-32 overflow-hidden">
                  <img src={getCover(project.category, project.skillsRequired)} alt="" className="cover-img w-full h-full object-cover"/>
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom,rgba(10,12,24,0.1),rgba(10,12,24,0.85))" }}/>
                  {/* Payment badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background:"rgba(0,0,0,0.55)", border:`1px solid ${accentColor}44`, color:accentColor, backdropFilter:"blur(8px)" }}>
                    {project.paymentStatus?.replace(/-/g," ")}
                  </div>
                  <h3 className="absolute bottom-3 left-3 right-12 text-slate-100 font-bold text-base line-clamp-1"
                    style={{ fontFamily:"'Syne',sans-serif", textShadow:"0 1px 8px rgba(0,0,0,0.8)" }}>
                    {project.title}
                  </h3>
                </div>
                {/* Body */}
                <div className="p-4">
                  {project.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.skillsRequired.slice(0,3).map((s,i) => <span key={i} className="skill-pill">{s}</span>)}
                      {project.skillsRequired.length > 3 && <span className="skill-pill">+{project.skillsRequired.length-3}</span>}
                    </div>
                  )}

                  {/* Milestone progress (active only) */}
                  {isActive && project.milestones?.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Layers size={10}/> Milestones</span>
                        <span className="text-xs font-bold" style={{ color:accentColor }}>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background:"rgba(99,102,241,0.12)" }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:.8, delay:.3 }}
                          className="h-full rounded-full" style={{ background:`linear-gradient(90deg,#6366f1,${accentColor})` }}/>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-indigo-400 font-bold">
                        <DollarSign size={11}/>₹{project.budget?.toLocaleString()}
                      </span>
                      {project.deadline && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock size={11}/>{new Date(project.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-400 text-xs font-semibold">
                      Details <ChevronRight size={12}/>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ActiveProjects()    { return <ProjectList type="active"    />; }
export function CompletedProjects() { return <ProjectList type="completed" />; }