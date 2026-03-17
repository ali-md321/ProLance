import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { createProjectAction } from "../../actions/projectAction";
import { FileText, AlignLeft, Cpu, DollarSign, BarChart2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Field = ({ id, label, icon: Icon, children, focused, setFocused }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: "rgba(148,163,184,0.55)", fontFamily: "'DM Sans',sans-serif" }}>
      {label}
    </label>
    <div className="relative">
      <motion.div animate={{ opacity: focused === id ? 1 : 0 }}
        className="absolute -inset-px pointer-events-none"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 13 }}>
        <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 12 }} />
      </motion.div>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 2 }}>
        <Icon size={15} style={{ color: focused === id ? "#818cf8" : "rgba(100,116,139,0.6)" }}
          className="transition-colors" />
      </div>
      {children}
    </div>
  </div>
);

const inputCls = "relative w-full pl-10 pr-4 py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium transition-all";
const inputStyle = { background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, zIndex: 1 };

export default function CreateProject() {
  const dispatch = useDispatch();
  const [focused, setFocused] = useState("");
  const [formData, setFormData] = useState({
    title: "", description: "", skillsRequired: "",
    budget: "", experienceLevel: "entry", deadline: ""
  });
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    const res = await dispatch(createProjectAction(formData));
    if(res?.success) navigate("/dashboard");
  };

  const expLevels = [
    { value: "entry",        label: "Entry Level",    icon: "🌱", desc: "New to the field" },
    { value: "intermediate", label: "Intermediate",   icon: "⚡", desc: "Some experience"  },
    { value: "expert",       label: "Expert",         icon: "🏆", desc: "Highly skilled"   },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text { font-family:'Syne',sans-serif; background:linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        input::placeholder,textarea::placeholder { color:rgba(100,116,139,0.55); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.4) sepia(1) saturate(2) hue-rotate(200deg); opacity:.6; cursor:pointer; }
        select option { background:#1e1b4b; color:#e2e8f0; }
        .exp-active { background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.12))!important; border-color:rgba(99,102,241,0.5)!important; }
        .exp-active .exp-label { color:#a5b4fc!important; }
        textarea { resize:none; }
      `}</style>

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
          className="mb-7">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
            ✦ New Project
          </div>
          <h2 className="grad-text text-3xl font-bold">Create Project</h2>
          <p className="text-slate-500 text-sm mt-1">Fill in the details to post your project</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55, delay:.08 }}
          className="relative rounded-2xl p-6 md:p-8"
          style={{ background:"rgba(13,12,28,0.92)", backdropFilter:"blur(24px)", border:"1px solid rgba(99,102,241,0.18)" }}>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#6366f1,transparent)" }}/>

          <form onSubmit={submitHandler} className="space-y-5">

            {/* Title */}
            <Field id="title" label="Project Title" icon={FileText} focused={focused} setFocused={setFocused}>
              <input name="title" type="text" placeholder="e.g. Build a React E-commerce App"
                value={formData.title} onChange={handleChange} required
                onFocus={() => setFocused("title")} onBlur={() => setFocused("")}
                className={inputCls} style={inputStyle} />
            </Field>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color:"rgba(148,163,184,0.55)" }}>Description</label>
              <div className="relative">
                <motion.div animate={{ opacity: focused === "description" ? 1 : 0 }}
                  className="absolute -inset-px pointer-events-none"
                  style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", borderRadius:13 }}>
                  <div className="w-full h-full" style={{ background:"#0f0e1f", borderRadius:12 }}/>
                </motion.div>
                <div className="absolute left-3.5 top-3.5 pointer-events-none" style={{ zIndex:2 }}>
                  <AlignLeft size={15} style={{ color: focused==="description" ? "#818cf8" : "rgba(100,116,139,0.6)" }} className="transition-colors"/>
                </div>
                <textarea name="description" rows={5} placeholder="Describe your project in detail..."
                  value={formData.description} onChange={handleChange} required
                  onFocus={() => setFocused("description")} onBlur={() => setFocused("")}
                  className={inputCls} style={{ ...inputStyle, paddingTop:12, paddingBottom:12 }} />
              </div>
            </div>

            {/* Skills + Budget row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="skills" label="Skills Required" icon={Cpu} focused={focused} setFocused={setFocused}>
                <input name="skillsRequired" type="text" placeholder="React, Node, MongoDB"
                  value={formData.skillsRequired} onChange={handleChange}
                  onFocus={() => setFocused("skills")} onBlur={() => setFocused("")}
                  className={inputCls} style={inputStyle} />
              </Field>

              <Field id="budget" label="Budget (₹)" icon={DollarSign} focused={focused} setFocused={setFocused}>
                <input name="budget" type="number" placeholder="e.g. 15000"
                  value={formData.budget} onChange={handleChange}
                  onFocus={() => setFocused("budget")} onBlur={() => setFocused("")}
                  className={inputCls} style={inputStyle} />
              </Field>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color:"rgba(148,163,184,0.55)" }}>
                <BarChart2 size={12} className="inline mr-1.5 mb-0.5"/> Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {expLevels.map(({ value, label, icon, desc }) => (
                  <button key={value} type="button"
                    onClick={() => setFormData({ ...formData, experienceLevel: value })}
                    className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl transition-all text-center ${formData.experienceLevel === value ? "exp-active" : ""}`}
                    style={{ background:"rgba(30,27,75,0.45)", border:"1px solid rgba(99,102,241,0.15)" }}>
                    <span className="text-xl">{icon}</span>
                    <span className="exp-label text-xs font-semibold transition-colors"
                      style={{ color: formData.experienceLevel === value ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}>
                      {label}
                    </span>
                    <span className="text-xs" style={{ color:"rgba(100,116,139,0.55)" }}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <Field id="deadline" label="Deadline" icon={Calendar} focused={focused} setFocused={setFocused}>
              <input name="deadline" type="date"
                value={formData.deadline} onChange={handleChange}
                onFocus={() => setFocused("deadline")} onBlur={() => setFocused("")}
                className={inputCls} style={{ ...inputStyle, colorScheme:"dark" }} />
            </Field>

            {/* Submit */}
            <div className="pt-1">
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} type="submit"
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm"
                style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 28px rgba(99,102,241,0.35)" }}>
                Post Project →
              </motion.button>
            </div>
          </form>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#a855f7,transparent)" }}/>
        </motion.div>
      </div>
    </div>
  );
}