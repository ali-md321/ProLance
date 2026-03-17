// pages/client/EditProject.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getProjectDetailsAction, editProjectAction } from "../../actions/projectAction";
import SpinLoader from "../layout/SpinLoader";
import { Save, ArrowLeft, FileText, AlignLeft, Folder, Cpu, DollarSign, BarChart2, Calendar, Tag, Eye } from "lucide-react";

const InputField = ({ label, id, name, type = "text", placeholder, value, onChange, focused, setFocused, icon: Icon }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>
    <div className="relative">
      <motion.div animate={{ opacity: focused === id ? 1 : 0 }}
        className="absolute -inset-px pointer-events-none"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 13 }}>
        <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 12 }} />
      </motion.div>
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 2 }}>
          <Icon size={14} style={{ color: focused === id ? "#818cf8" : "rgba(100,116,139,0.55)" }} className="transition-colors" />
        </div>
      )}
      <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
        className="relative w-full py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium"
        style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, zIndex: 1, paddingLeft: Icon ? "2.5rem" : "1rem", paddingRight: "1rem" }} />
    </div>
  </div>
);

const TextAreaField = ({ label, id, name, placeholder, value, onChange, focused, setFocused, rows = 5 }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>
    <div className="relative">
      <motion.div animate={{ opacity: focused === id ? 1 : 0 }}
        className="absolute -inset-px pointer-events-none"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 13 }}>
        <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 12 }} />
      </motion.div>
      <textarea id={id} name={name} placeholder={placeholder} value={value} onChange={onChange} rows={rows}
        onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
        className="relative w-full px-4 py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium resize-none"
        style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, zIndex: 1 }} />
    </div>
  </div>
);

const SelectField = ({ label, id, name, value, onChange, focused, setFocused, icon: Icon, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>
    <div className="relative">
      <motion.div animate={{ opacity: focused === id ? 1 : 0 }}
        className="absolute -inset-px pointer-events-none"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 13 }}>
        <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 12 }} />
      </motion.div>
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 2 }}>
          <Icon size={14} style={{ color: focused === id ? "#818cf8" : "rgba(100,116,139,0.55)" }} className="transition-colors" />
        </div>
      )}
      <select id={id} name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
        className="relative w-full py-3 pr-4 outline-none text-slate-200 text-sm font-medium appearance-none cursor-pointer"
        style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, zIndex: 1, paddingLeft: Icon ? "2.5rem" : "1rem" }}>
        {children}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 2 }}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  </div>
);

const SectionHeading = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: "rgba(99,102,241,0.15)" }}>
      <Icon size={14} style={{ color: "#818cf8" }} />
    </div>
    <h3 className="font-bold text-slate-300 text-xs uppercase tracking-widest"
      style={{ fontFamily: "'Syne',sans-serif" }}>{label}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.3),transparent)" }} />
  </div>
);

const expLevels = [
  { value: "entry",        label: "Entry",        icon: "🌱", desc: "Beginner"      },
  { value: "intermediate", label: "Intermediate", icon: "⚡", desc: "Mid-level"     },
  { value: "expert",       label: "Expert",       icon: "🏆", desc: "Senior-level"  },
];

export default function EditProject() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { project, isLoading } = useSelector((s) => s.projectDetails);
  const [focused, setFocused] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", category: "", skillsRequired: "",
    budget: "", budgetType: "fixed", experienceLevel: "entry",
    deadline: "", tags: "", visibility: "public",
  });

  useEffect(() => { dispatch(getProjectDetailsAction(id)); }, [dispatch, id]);

  useEffect(() => {
    if (project) {
      setForm({
        title:           project.title || "",
        description:     project.description || "",
        category:        project.category || "",
        skillsRequired:  project.skillsRequired?.join(", ") || "",
        budget:          project.budget || "",
        budgetType:      project.budgetType || "fixed",
        experienceLevel: project.experienceLevel || "entry",
        deadline:        project.deadline?.substring(0, 10) || "",
        tags:            project.tags?.join(", ") || "",
        visibility:      project.visibility || "public",
      });
    }
  }, [project]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    const updatedData = {
      ...form,
      skillsRequired: form.skillsRequired.split(",").map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    await dispatch(editProjectAction(id, updatedData));
    navigate(`/projects/${id}`);
  };

  if (isLoading || !project) return <SpinLoader />;

  return (
    <div className="max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        input::placeholder,textarea::placeholder{color:rgba(100,116,139,0.55);}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) saturate(2) hue-rotate(200deg);opacity:.6;cursor:pointer;}
        select option{background:#1e1b4b;color:#e2e8f0;}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #1e1b4b inset!important;-webkit-text-fill-color:#e2e8f0!important;}
      `}</style>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}
        className="flex items-center gap-4 mb-7">
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: .93 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(30,27,75,0.6)", border: "1px solid rgba(99,102,241,0.22)", color: "#a5b4fc" }}>
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <div className="inline-flex items-center gap-2 mb-1 px-2.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#a5b4fc" }}>
            ✦ Editing Project
          </div>
          <h1 className="grad-text text-2xl md:text-3xl font-bold leading-tight">{project.title}</h1>
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .08 }}
        className="relative rounded-2xl p-6 md:p-8"
        style={{ background: "rgba(13,12,28,0.92)", backdropFilter: "blur(24px)", border: "1px solid rgba(99,102,241,0.18)" }}>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px"
          style={{ background: "linear-gradient(90deg,transparent,#6366f1,transparent)" }} />

        <form onSubmit={submitHandler} className="space-y-7">

          {/* ── BASICS ── */}
          <div>
            <SectionHeading icon={FileText} label="Project Info" />
            <div className="space-y-4">
              <InputField id="title" name="title" label="Project Title" icon={FileText}
                placeholder="e.g. Build a React Dashboard"
                value={form.title} onChange={handleChange}
                focused={focused} setFocused={setFocused} />
              <TextAreaField id="description" name="description" label="Description"
                placeholder="Describe your project in detail..." rows={5}
                value={form.description} onChange={handleChange}
                focused={focused} setFocused={setFocused} />
              <InputField id="category" name="category" label="Category" icon={Folder}
                placeholder="e.g. Web Development"
                value={form.category} onChange={handleChange}
                focused={focused} setFocused={setFocused} />
            </div>
          </div>

          {/* ── SKILLS & BUDGET ── */}
          <div>
            <SectionHeading icon={Cpu} label="Skills & Budget" />
            <div className="space-y-4">
              <InputField id="skillsRequired" name="skillsRequired" label="Skills Required (comma separated)"
                icon={Cpu} placeholder="React, Node.js, MongoDB"
                value={form.skillsRequired} onChange={handleChange}
                focused={focused} setFocused={setFocused} />
              <div className="grid grid-cols-2 gap-4">
                <InputField id="budget" name="budget" label="Budget (₹)" icon={DollarSign} type="number"
                  placeholder="e.g. 15000"
                  value={form.budget} onChange={handleChange}
                  focused={focused} setFocused={setFocused} />
                <SelectField id="budgetType" name="budgetType" label="Budget Type" icon={DollarSign}
                  value={form.budgetType} onChange={handleChange}
                  focused={focused} setFocused={setFocused}>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </SelectField>
              </div>
            </div>
          </div>

          {/* ── EXPERIENCE ── */}
          <div>
            <SectionHeading icon={BarChart2} label="Experience Level" />
            <div className="grid grid-cols-3 gap-3">
              {expLevels.map(({ value, label, icon, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm({ ...form, experienceLevel: value })}
                  className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl transition-all text-center"
                  style={{
                    background: form.experienceLevel === value
                      ? "linear-gradient(135deg,rgba(99,102,241,0.22),rgba(168,85,247,0.14))"
                      : "rgba(30,27,75,0.45)",
                    border: form.experienceLevel === value
                      ? "1px solid rgba(99,102,241,0.5)"
                      : "1px solid rgba(99,102,241,0.15)",
                  }}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-semibold"
                    style={{ color: form.experienceLevel === value ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}>
                    {label}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(100,116,139,0.55)" }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── SETTINGS ── */}
          <div>
            <SectionHeading icon={Eye} label="Settings" />
            <div className="space-y-4">
              <InputField id="deadline" name="deadline" label="Deadline" icon={Calendar} type="date"
                value={form.deadline} onChange={handleChange}
                focused={focused} setFocused={setFocused} />
              <InputField id="tags" name="tags" label="Tags (comma separated)" icon={Tag}
                placeholder="react, mern, api"
                value={form.tags} onChange={handleChange}
                focused={focused} setFocused={setFocused} />

              {/* Visibility toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "rgba(148,163,184,0.55)" }}>Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "public",  icon: "🌐", label: "Public",  desc: "Anyone can see" },
                    { val: "private", icon: "🔒", label: "Private", desc: "Only you can see" },
                  ].map(({ val, icon, label, desc }) => (
                    <button key={val} type="button"
                      onClick={() => setForm({ ...form, visibility: val })}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                      style={{
                        background: form.visibility === val
                          ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.12))"
                          : "rgba(30,27,75,0.45)",
                        border: form.visibility === val
                          ? "1px solid rgba(99,102,241,0.45)"
                          : "1px solid rgba(99,102,241,0.15)",
                      }}>
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-xs font-semibold"
                          style={{ color: form.visibility === val ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}>
                          {label}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(100,116,139,0.5)" }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 28px rgba(99,102,241,0.35)" }}>
              <Save size={15} /> Save Changes
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} type="button"
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm"
              style={{ background: "rgba(30,27,75,0.5)", border: "1px solid rgba(99,102,241,0.2)", color: "rgba(148,163,184,0.7)" }}>
              <ArrowLeft size={15} /> Cancel
            </motion.button>
          </div>

        </form>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
          style={{ background: "linear-gradient(90deg,transparent,#a855f7,transparent)" }} />
      </motion.div>
    </div>
  );
}