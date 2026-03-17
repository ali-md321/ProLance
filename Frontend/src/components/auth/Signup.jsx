// pages/auth/Signup.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, registerUserAction } from "../../actions/userAction";


const Field = ({ id, type, placeholder, value, onChange, focused, setFocused }) => (
  <div className="relative">
    <motion.div animate={{ opacity: focused === id ? 1 : 0 }} className="absolute -inset-px rounded-xl pointer-events-none"
      style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", padding: 1, borderRadius: 14 }}>
      <div className="w-full h-full rounded-xl" style={{ background: "#0f0e1f" }} />
    </motion.div>
    <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required
      onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
      className="relative w-full px-4 py-3.5 rounded-xl outline-none text-slate-200 placeholder-slate-500 text-sm font-medium transition-all"
      style={{ background: "rgba(30,27,75,0.6)", border: "1px solid rgba(99,102,241,0.2)", zIndex: 1 }}
    />
  </div>
);

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState("");
  const { user, error } = useSelector(state => state.user);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, []);
  

  const validate = () => {
    let newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const { success } = await dispatch(registerUserAction(form));
    if (success) {
      setForm({name: '',email: '',password: '',role: 'Client'});
      toast.success(`Welcome, ${form.name}!`);
      navigate(user?.role == "client" ? "/" : "/freelancer");
    }    
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans',sans-serif", background: "#0a0c18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text{font-family:'Syne',sans-serif;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .role-active-client{background:linear-gradient(135deg,#6366f1,#4f46e5)!important;border-color:#6366f1!important;color:#fff!important;}
        .role-active-freelancer{background:linear-gradient(135deg,#a855f7,#7c3aed)!important;border-color:#a855f7!important;color:#fff!important;}
        input::placeholder{color:rgba(148,163,184,0.5)}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #1e1b4b inset!important;-webkit-text-fill-color:#e2e8f0!important;}
      `}</style>

      <div style={{ position:"absolute", top:"15%", left:"10%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"10%", right:"8%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.11) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

      <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:.65 }}
        className="relative w-full max-w-md z-10">

        <div className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.4),rgba(168,85,247,0.2),rgba(99,102,241,0.1))", borderRadius:20 }}/>

        <div className="relative rounded-2xl p-8"
          style={{ background:"rgba(13,12,28,0.9)", backdropFilter:"blur(24px)", border:"1px solid rgba(99,102,241,0.15)" }}>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-indigo-400"
              style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
              ✦ Join ProLance
            </div>
            <h2 className="grad-text text-3xl font-bold">Create Account</h2>
            <p className="text-slate-500 text-sm mt-2">Start your freelancing journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Field id="name" type="text" placeholder="Full Name"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              focused={focused} setFocused={setFocused} />

            <div>
              <Field id="email" type="email" placeholder="Email Address"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                focused={focused} setFocused={setFocused} />
              {errors.email && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.email}</p>}
            </div>

            <div>
              <Field id="password" type="password" placeholder="Password (min 8 chars)"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                focused={focused} setFocused={setFocused} />
              {errors.password && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.password}</p>}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Register As</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val:"client", label:"💼 Client", cls:"role-active-client" },
                  { val:"freelancer", label:"🚀 Freelancer", cls:"role-active-freelancer" },
                ].map(({ val, label, cls }) => (
                  <button key={val} type="button" onClick={() => setForm({ ...form, role: val })}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${form.role === val ? cls : ""}`}
                    style={form.role !== val ? { background:"rgba(30,27,75,0.5)", border:"1px solid rgba(99,102,241,0.2)", color:"rgba(148,163,184,0.7)" } : {}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} type="submit"
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm mt-2"
              style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 30px rgba(99,102,241,0.4)" }}>
              Create My Account →
            </motion.button>
          </form>

          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">Login</Link>
          </p>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px rounded-full"
            style={{ background:"linear-gradient(90deg,transparent,#6366f1,transparent)" }}/>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;