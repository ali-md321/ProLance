// pages/auth/Login.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { clearErrors, LoginUserAction } from "../../actions/userAction";

const Field = ({ id, type, placeholder, value, onChange, focused, setFocused }) => (
  <div className="relative">
    <motion.div
      animate={{ opacity: focused === id ? 1 : 0 }}
      className="absolute -inset-px pointer-events-none"
      style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)", padding: 1, borderRadius: 14 }}>
      <div className="w-full h-full" style={{ background: "#0f0e1f", borderRadius: 13 }} />
    </motion.div>
    <input
      id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required
      onFocus={() => setFocused(id)} onBlur={() => setFocused("")}
      className="relative w-full px-4 py-3.5 outline-none text-slate-200 placeholder-slate-500 text-sm font-medium transition-all"
      style={{ background: "rgba(30,27,75,0.6)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 13, zIndex: 1 }}
    />
  </div>
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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

    const { success } = await dispatch(LoginUserAction(form));
    if (success) {
      setForm({ email: '', password: '' });
      toast.success("Logged in!..");
      navigate(user?.role == "client" ? "/" : "/freelancer");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans',sans-serif", background: "#0a0c18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .grad-text { font-family:'Syne',sans-serif; background:linear-gradient(135deg,#c084fc,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        input::placeholder { color:rgba(148,163,184,0.45); }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px #1e1b4b inset!important; -webkit-text-fill-color:#e2e8f0!important; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes spin-rev  { to { transform: rotate(-360deg); } }
        .spin-s { animation: spin-slow 28s linear infinite; transform-origin: center; }
        .spin-r { animation: spin-rev  20s linear infinite; transform-origin: center; }
      `}</style>

      {/* bg orbs */}
      <div style={{ position:"absolute", top:"12%", right:"8%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.13) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"12%", left:"6%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.11) 0%,transparent 70%)", pointerEvents:"none" }}/>
      {/* grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

      {/* Decorative rotating rings — top-right corner */}
      <svg className="absolute top-0 right-0 opacity-20 pointer-events-none" width="300" height="300" viewBox="0 0 300 300">
        <circle className="spin-s" cx="150" cy="150" r="120" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="8 12"/>
        <circle className="spin-r" cx="150" cy="150" r="90"  fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="5 9"/>
        <circle cx="150" cy="150" r="60" fill="none" stroke="#6366f1" strokeWidth="0.5" opacity=".5"/>
      </svg>
      {/* bottom-left rings */}
      <svg className="absolute bottom-0 left-0 opacity-15 pointer-events-none" width="220" height="220" viewBox="0 0 220 220">
        <circle className="spin-r" cx="110" cy="110" r="90" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="6 10"/>
        <circle className="spin-s" cx="110" cy="110" r="65" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="4 8"/>
      </svg>

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:.65 }}
        className="relative w-full max-w-md z-10">

        {/* glow border */}
        <div className="absolute -inset-px pointer-events-none"
          style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.45),rgba(99,102,241,0.2),rgba(168,85,247,0.1))", borderRadius:20 }}/>

        <div className="relative rounded-2xl p-8"
          style={{ background:"rgba(13,12,28,0.92)", backdropFilter:"blur(28px)", border:"1px solid rgba(168,85,247,0.15)" }}>

          {/* top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#a855f7,transparent)" }}/>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-purple-400"
              style={{ background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.22)" }}>
              ✦ ProLance
            </div>
            <h2 className="grad-text text-3xl font-bold">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-2">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Field id="email" type="email" placeholder="Email Address"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                focused={focused} setFocused={setFocused} />
              {errors.email && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.email}</p>}
            </div>

            <div>
              <Field id="password" type="password" placeholder="Password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                focused={focused} setFocused={setFocused} />
              {errors.password && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.password}</p>}
            </div>

            {/* forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-purple-400 transition">
                Forgot password?
              </Link>
            </div>

            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} type="submit"
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm"
              style={{ background:"linear-gradient(135deg,#a855f7,#6366f1)", boxShadow:"0 0 30px rgba(168,85,247,0.35)" }}>
              Sign In →
            </motion.button>

          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background:"rgba(99,102,241,0.15)" }}/>
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px" style={{ background:"rgba(99,102,241,0.15)" }}/>
          </div>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 font-semibold hover:text-purple-300 transition">
              Sign Up
            </Link>
          </p>

          {/* bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#6366f1,transparent)" }}/>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;