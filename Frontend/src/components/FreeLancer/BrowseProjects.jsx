// freelancer/BrowseProjects.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectsByFilterAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";
import { Search, Filter, DollarSign, Clock, Users, ChevronRight, X } from "lucide-react";

const categoryCovers = {
  "web development":  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  "mobile app":       "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
  "graphic design":   "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
  "ui/ux":            "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80",
  "data science":     "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "machine learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  "video editing":    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
  "writing":          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80",
  "blockchain":       "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
  "default":          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
};

const getCover = (category = "", skills = []) => {
  const key = [category, ...skills].map(s => s.toLowerCase())
    .find(s => Object.keys(categoryCovers).some(k => s.includes(k)));
  if (!key) return categoryCovers["default"];
  const match = Object.keys(categoryCovers).find(k => key.includes(k));
  return categoryCovers[match] || categoryCovers["default"];
};

const expIcon = { entry:"🌱", intermediate:"⚡", expert:"🏆" };
const expColor = { entry:"#4ade80", intermediate:"#fbbf24", expert:"#f87171" };

export default function BrowseProjects() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading } = useSelector((s) => s.allProjects);

  const [search, setSearch]         = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]        = useState({ budget:"", deadline:"", experienceLevel:"", skill:"" });
  const [sortBy, setSortBy]          = useState("newest");

  useEffect(() => { dispatch(getProjectsByFilterAction()); }, [dispatch]);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters({ budget:"", deadline:"", experienceLevel:"", skill:"" });
  const hasFilters = Object.values(filters).some(Boolean);

  const filtered = (projects || [])
    .filter(p => p.status === "open")
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.skillsRequired?.some(s => s.toLowerCase().includes(search.toLowerCase())))
    .filter(p => !filters.experienceLevel || p.experienceLevel === filters.experienceLevel)
    .filter(p => !filters.skill || p.skillsRequired?.some(s => s.toLowerCase().includes(filters.skill.toLowerCase())))
    .filter(p => !filters.budget || p.budget <= Number(filters.budget))
    .filter(p => !filters.deadline || (p.deadline && new Date(p.deadline) <= new Date(filters.deadline)))
    .sort((a, b) => {
      if (sortBy === "newest")       return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "budget-high")  return b.budget - a.budget;
      if (sortBy === "budget-low")   return a.budget - b.budget;
      if (sortBy === "deadline")     return new Date(a.deadline || 9e15) - new Date(b.deadline || 9e15);
      if (sortBy === "proposals")    return a.totalProposals - b.totalProposals;
      return 0;
    });

  if (isLoading) return <SpinLoader />;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .proj-card{transition:transform .22s ease,box-shadow .22s ease;}
        .proj-card:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(99,102,241,0.18);}
        .proj-card:hover .cover-img{transform:scale(1.06);}
        .cover-img{transition:transform .4s ease;}
        .skill-pill{background:rgba(99,102,241,0.13);border:1px solid rgba(99,102,241,0.22);color:#a5b4fc;border-radius:6px;padding:2px 9px;font-size:0.72rem;font-weight:600;}
        .sort-btn{border:1px solid rgba(99,102,241,0.2);color:rgba(148,163,184,0.6);border-radius:8px;padding:4px 12px;font-size:0.78rem;font-weight:600;transition:all .2s;}
        .sort-btn:hover,.sort-active{background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.4);color:#a5b4fc;}
        input::placeholder{color:rgba(100,116,139,0.55);}
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="grad-text text-3xl font-bold mb-1">Browse Projects</h1>
        <p className="text-slate-500 text-sm">{filtered.length} open projects available</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"rgba(100,116,139,0.6)" }}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or skills..."
            className="w-full pl-10 pr-4 py-3 outline-none text-slate-200 text-sm"
            style={{ background:"rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12 }}/>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: showFilters ? "rgba(99,102,241,0.2)" : "rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.25)", color:"#a5b4fc" }}>
          <Filter size={14}/> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-400"/>}
        </button>
      </div>

      {/* Sort pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[["newest","Newest"],["budget-high","Budget ↑"],["budget-low","Budget ↓"],["deadline","Deadline"],["proposals","Least Proposals"]].map(([val,label]) => (
          <button key={val} onClick={() => setSortBy(val)}
            className={`sort-btn ${sortBy === val ? "sort-active" : ""}`}>{label}</button>
        ))}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:.25 }} className="overflow-hidden mb-5">
            <div className="rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.5)" }}>Max Budget (₹)</label>
                <input type="number" value={filters.budget} onChange={e => setF("budget", e.target.value)}
                  placeholder="e.g. 50000" className="w-full px-3 py-2.5 outline-none text-slate-200 text-sm"
                  style={{ background:"rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10 }}/>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.5)" }}>Deadline Before</label>
                <input type="date" value={filters.deadline} onChange={e => setF("deadline", e.target.value)}
                  className="w-full px-3 py-2.5 outline-none text-slate-200 text-sm"
                  style={{ background:"rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10, colorScheme:"dark" }}/>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.5)" }}>Experience</label>
                <div className="flex flex-col gap-1.5">
                  {["","entry","intermediate","expert"].map(v => (
                    <button key={v} onClick={() => setF("experienceLevel", v)}
                      className="text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: filters.experienceLevel === v ? "rgba(99,102,241,0.2)" : "transparent", color: filters.experienceLevel === v ? "#a5b4fc" : "rgba(148,163,184,0.55)", border: filters.experienceLevel === v ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent" }}>
                      {v ? `${expIcon[v]} ${v}` : "All Levels"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(148,163,184,0.5)" }}>Skill</label>
                <input value={filters.skill} onChange={e => setF("skill", e.target.value)}
                  placeholder="e.g. React" className="w-full px-3 py-2.5 outline-none text-slate-200 text-sm mb-2"
                  style={{ background:"rgba(30,27,75,0.55)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10 }}/>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg w-full justify-center"
                    style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171" }}>
                    <X size={11}/> Clear All
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project cards */}
      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border:"1px dashed rgba(99,102,241,0.25)", background:"rgba(13,12,28,0.6)" }}>
          <Search size={36} className="mb-3" style={{ color:"rgba(99,102,241,0.35)" }}/>
          <p className="text-slate-500 font-medium">No projects match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project, i) => (
            <motion.div key={project._id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay: i * 0.06 }}
              className="proj-card rounded-2xl overflow-hidden cursor-pointer"
              style={{ background:"rgba(13,12,28,0.9)", border:"1px solid rgba(99,102,241,0.18)" }}
              onClick={() => navigate(`/freelancer/projects/${project._id}`)}>
              {/* Cover */}
              <div className="relative h-36 overflow-hidden">
                <img src={getCover(project.category, project.skillsRequired)} alt=""
                  className="cover-img w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom,rgba(10,12,24,0.15) 0%,rgba(10,12,24,0.88) 100%)" }}/>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background:"rgba(0,0,0,0.55)", border:`1px solid ${expColor[project.experienceLevel]}44`, color: expColor[project.experienceLevel], backdropFilter:"blur(8px)" }}>
                  {expIcon[project.experienceLevel]} {project.experienceLevel}
                </div>
                <div className="absolute bottom-3 left-3 right-10">
                  <h3 className="text-slate-100 font-bold text-base leading-tight line-clamp-2"
                    style={{ fontFamily:"'Syne',sans-serif", textShadow:"0 1px 8px rgba(0,0,0,0.8)" }}>
                    {project.title}
                  </h3>
                </div>
              </div>
              {/* Body */}
              <div className="p-4">
                {project.skillsRequired?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.skillsRequired.slice(0,3).map((s,i) => <span key={i} className="skill-pill">{s}</span>)}
                    {project.skillsRequired.length > 3 && <span className="skill-pill">+{project.skillsRequired.length-3}</span>}
                  </div>
                )}
                <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">{project.description}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { icon: DollarSign, val:`₹${project.budget?.toLocaleString()}`, sub: project.budgetType },
                    { icon: Users,      val: project.totalProposals,                 sub: "proposals"       },
                    { icon: Clock,      val: project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—", sub:"deadline" },
                  ].map(({ icon:Icon, val, sub }, idx) => (
                    <div key={idx} className="flex flex-col items-center py-2 rounded-xl"
                      style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.12)" }}>
                      <Icon size={12} style={{ color:"#818cf8" }} className="mb-0.5"/>
                      <span className="text-slate-200 text-xs font-bold">{val}</span>
                      <span className="text-slate-600" style={{ fontSize:"0.62rem" }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop:"1px solid rgba(99,102,241,0.1)" }}>
                  <span className="text-slate-600 text-xs">{new Date(project.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span>
                  <div className="flex items-center gap-1 text-indigo-400 text-xs font-semibold">View <ChevronRight size={12}/></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}