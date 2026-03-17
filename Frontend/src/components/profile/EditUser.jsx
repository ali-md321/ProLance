// pages/EditUser.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { editUserAction } from "../../actions/userAction";

const Field = ({ label, id, type = "text", placeholder, value, onChange, focused, setFocused }) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>}
    <div className="relative">
      <motion.div animate={{ opacity: focused === id ? 1 : 0 }} className="absolute -inset-px pointer-events-none"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 13 }}>
        <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 12 }} />
      </motion.div>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
        className="relative w-full px-4 py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium"
        style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, zIndex: 1 }} />
    </div>
  </div>
);

const TextArea = ({ label, id, placeholder, value, onChange, focused, setFocused }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.55)" }}>{label}</label>
    <div className="relative">
      <motion.div animate={{ opacity: focused === id ? 1 : 0 }} className="absolute -inset-px pointer-events-none"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 13 }}>
        <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 12 }} />
      </motion.div>
      <textarea id={id} placeholder={placeholder} value={value} onChange={onChange} rows={3}
        onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
        className="relative w-full px-4 py-3 outline-none text-slate-200 placeholder-slate-600 text-sm font-medium resize-none"
        style={{ background: "rgba(30,27,75,0.55)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, zIndex: 1 }} />
    </div>
  </div>
);

const SectionHeading = ({ icon, label }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xl">{icon}</span>
    <h3 className="font-bold text-slate-200 text-sm uppercase tracking-widest" style={{ fontFamily: "'Syne',sans-serif" }}>{label}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.3),transparent)" }} />
  </div>
);

const EditUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.user);
  const [focused, setFocused] = useState("");

  const [form, setForm] = useState({
    name: "", bio: "", avatar: "",
    companyName: "", website: "",
    skills: "", experience: "", hourlyRate: "",
  });

  const [portfolioLinks, setPortfolioLinks] = useState([{ platform: "", url: "" }]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        companyName: user.companyName || "",
        website: user.website || "",
        skills: user.skills?.join(", ") || "",
        experience: user.experience || "",
        hourlyRate: user.hourlyRate || "",
      });
      if (user.portfolioLinks?.length) setPortfolioLinks(user.portfolioLinks);
    }
  }, [user]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const updateLink = (index, field, value) => {
    const updated = portfolioLinks.map((l, i) => i === index ? { ...l, [field]: value } : l);
    setPortfolioLinks(updated);
  };

  const addLink = () => setPortfolioLinks([...portfolioLinks, { platform: "", url: "" }]);

  const removeLink = (index) => setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      bio: form.bio,
      avatar: form.avatar,
      ...(user?.role === "client"
        ? { companyName: form.companyName, website: form.website }
        : {
            skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            experience: form.experience,
            hourlyRate: form.hourlyRate,
            portfolioLinks: portfolioLinks.filter((l) => l.platform && l.url),
          }),
    };
    dispatch(editUserAction(payload));
    navigate(`/profile/${user._id}`);
  };

  const isFreelancer = user?.role === "freelancer";

  return (
    <div className="min-h-screen px-4 py-12 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans',sans-serif", background: "#0a0c18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text { font-family:'Syne',sans-serif; background:linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        textarea::placeholder,input::placeholder { color:rgba(100,116,139,0.6); }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px #1e1b4b inset!important; -webkit-text-fill-color:#e2e8f0!important; }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        @keyframes spin-rev  { to{transform:rotate(-360deg)} }
        .spin-s { animation:spin-slow 32s linear infinite; transform-origin:center; }
        .spin-r { animation:spin-rev  22s linear infinite; transform-origin:center; }
      `}</style>

      <div style={{ position:"absolute", top:"5%", left:"3%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"5%", right:"3%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>
      <svg className="absolute top-0 right-0 opacity-10 pointer-events-none" width="260" height="260" viewBox="0 0 260 260">
        <circle className="spin-s" cx="130" cy="130" r="110" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="7 11"/>
        <circle className="spin-r" cx="130" cy="130" r="80"  fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="5 8"/>
      </svg>
      <svg className="absolute bottom-0 left-0 opacity-10 pointer-events-none" width="200" height="200" viewBox="0 0 200 200">
        <circle className="spin-r" cx="100" cy="100" r="85" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="6 10"/>
        <circle className="spin-s" cx="100" cy="100" r="58" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 7"/>
      </svg>

      <div className="max-w-2xl mx-auto relative z-10">

        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
          className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
            ✦ {isFreelancer ? "Freelancer" : "Client"} Profile
          </div>
          <h1 className="grad-text text-3xl md:text-4xl font-bold">Edit Profile</h1>
          <p className="text-slate-500 text-sm mt-2">Update your information below</p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.1 }}
          className="relative rounded-2xl p-6 md:p-8"
          style={{ background:"rgba(13,12,28,0.92)", backdropFilter:"blur(24px)", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px" style={{ background:"linear-gradient(90deg,transparent,#6366f1,transparent)" }}/>

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* BASICS */}
            <div>
              <SectionHeading icon="👤" label="Basic Info" />
              <div className="space-y-4">
                <Field id="name" label="Full Name" placeholder="Your full name"
                  value={form.name} onChange={set("name")} focused={focused} setFocused={setFocused} />
                <TextArea id="bio" label="Bio" placeholder="Tell the world about yourself..."
                  value={form.bio} onChange={set("bio")} focused={focused} setFocused={setFocused} />
                <Field id="avatar" label="Avatar URL" placeholder="https://your-avatar-url.com"
                  value={form.avatar} onChange={set("avatar")} focused={focused} setFocused={setFocused} />
              </div>
            </div>

            {/* CLIENT */}
            {!isFreelancer && (
              <div>
                <SectionHeading icon="🏢" label="Client Details" />
                <div className="space-y-4">
                  <Field id="companyName" label="Company Name" placeholder="Your company name"
                    value={form.companyName} onChange={set("companyName")} focused={focused} setFocused={setFocused} />
                  <Field id="website" label="Website" placeholder="https://yourwebsite.com"
                    value={form.website} onChange={set("website")} focused={focused} setFocused={setFocused} />
                </div>
              </div>
            )}

            {/* FREELANCER */}
            {isFreelancer && (
              <>
                <div>
                  <SectionHeading icon="🚀" label="Freelancer Details" />
                  <div className="space-y-4">
                    <TextArea id="skills" label="Skills (comma separated)" placeholder="React, Node.js, Figma..."
                      value={form.skills} onChange={set("skills")} focused={focused} setFocused={setFocused} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field id="experience" label="Experience (years)" type="number" placeholder="e.g. 3"
                        value={form.experience} onChange={set("experience")} focused={focused} setFocused={setFocused} />
                      <Field id="hourlyRate" label="Hourly Rate (₹)" type="number" placeholder="e.g. 800"
                        value={form.hourlyRate} onChange={set("hourlyRate")} focused={focused} setFocused={setFocused} />
                    </div>
                  </div>
                </div>

                {/* PORTFOLIO LINKS */}
                <div>
                  <SectionHeading icon="🔗" label="Portfolio Links" />
                  <div className="space-y-3">
                    <AnimatePresence>
                      {portfolioLinks.map((link, index) => (
                        <motion.div key={index}
                          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
                          transition={{ duration:.25 }}
                          className="flex gap-3 items-start p-4 rounded-xl"
                          style={{ background:"rgba(30,27,75,0.4)", border:"1px solid rgba(99,102,241,0.15)" }}>

                          {/* Index badge */}
                          <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
                            style={{ background:"rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
                            {index + 1}
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field
                              id={`platform-${index}`}
                              placeholder="Platform (e.g. GitHub)"
                              value={link.platform}
                              onChange={(e) => updateLink(index, "platform", e.target.value)}
                              focused={focused} setFocused={setFocused}
                            />
                            <Field
                              id={`url-${index}`}
                              placeholder="https://github.com/username"
                              value={link.url}
                              onChange={(e) => updateLink(index, "url", e.target.value)}
                              focused={focused} setFocused={setFocused}
                            />
                          </div>

                          {/* Remove btn */}
                          <motion.button type="button" whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }}
                            onClick={() => removeLink(index)}
                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all"
                            style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171" }}>
                            ✕
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add link button */}
                    <motion.button type="button" whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}
                      onClick={addLink}
                      className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background:"rgba(99,102,241,0.08)", border:"1px dashed rgba(99,102,241,0.35)", color:"#818cf8" }}>
                      <span className="text-lg leading-none">+</span> Add Portfolio Link
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} type="submit"
                className="flex-1 py-3.5 rounded-xl text-white font-semibold text-sm"
                style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 28px rgba(99,102,241,0.35)" }}>
                Save Changes →
              </motion.button>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
                style={{ background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.2)", color:"rgba(148,163,184,0.7)" }}>
                Cancel
              </motion.button>
            </div>
          </form>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px" style={{ background:"linear-gradient(90deg,transparent,#a855f7,transparent)" }}/>
        </motion.div>
      </div>
    </div>
  );
};

export default EditUser;