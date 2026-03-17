// pages/HomePage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

/* ── Animated SVG illustration for Hero (right side) ── */
const HeroAnimation = () => (
  <svg viewBox="0 0 480 400" className="w-full max-w-lg mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes pulse-ring { 0%{r:60;opacity:.4} 100%{r:110;opacity:0} }
      @keyframes dash { to{stroke-dashoffset:0} }
      @keyframes pop { 0%{opacity:0;transform:scale(.6)} 100%{opacity:1;transform:scale(1)} }
      .float { animation: float 4s ease-in-out infinite; }
      .float2 { animation: float 5.5s ease-in-out infinite .8s; }
      .float3 { animation: float 3.8s ease-in-out infinite 1.4s; }
      .ring { animation: pulse-ring 2.4s ease-out infinite; }
      .ring2 { animation: pulse-ring 2.4s ease-out infinite .8s; }
      .draw { stroke-dasharray:300; stroke-dashoffset:300; animation: dash 2s ease forwards .4s; }
      .pop1 { animation: pop .5s ease forwards .6s; opacity:0; }
      .pop2 { animation: pop .5s ease forwards 1s; opacity:0; }
      .pop3 { animation: pop .5s ease forwards 1.4s; opacity:0; }
    `}</style>
    {/* Background glow */}
    <circle cx="240" cy="200" r="160" fill="url(#glow)" opacity=".35"/>
    <circle cx="240" cy="200" r="60" className="ring" fill="none" stroke="#818cf8" strokeWidth="1.5"/>
    <circle cx="240" cy="200" r="60" className="ring2" fill="none" stroke="#c084fc" strokeWidth="1"/>
    {/* Central laptop */}
    <g className="float" transform="translate(140,120)">
      <rect x="20" y="20" width="200" height="130" rx="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2"/>
      <rect x="30" y="30" width="180" height="110" rx="8" fill="#0f0e1f"/>
      {/* Screen content lines */}
      <rect x="44" y="50" width="80" height="8" rx="3" fill="#6366f1" opacity=".8"/>
      <rect x="44" y="66" width="120" height="5" rx="2" fill="#4f46e5" opacity=".5"/>
      <rect x="44" y="78" width="100" height="5" rx="2" fill="#4f46e5" opacity=".4"/>
      <rect x="44" y="96" width="60" height="22" rx="6" fill="url(#btnGrad)"/>
      <rect x="0" y="150" width="240" height="12" rx="6" fill="#312e81" opacity=".6"/>
      <rect x="80" y="162" width="80" height="6" rx="3" fill="#4f46e5" opacity=".4"/>
    </g>
    {/* Floating cards */}
    <g className="float2 pop1">
      <rect x="30" y="80" width="110" height="60" rx="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
      <circle cx="55" cy="104" r="12" fill="#6366f1" opacity=".7"/>
      <rect x="74" y="96" width="55" height="6" rx="3" fill="#a5b4fc" opacity=".8"/>
      <rect x="74" y="108" width="40" height="5" rx="2" fill="#6366f1" opacity=".5"/>
      <rect x="44" y="124" width="82" height="8" rx="4" fill="url(#btnGrad)" opacity=".9"/>
    </g>
    <g className="float3 pop2">
      <rect x="330" y="90" width="120" height="65" rx="12" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5"/>
      <rect x="344" y="106" width="50" height="5" rx="2" fill="#c084fc" opacity=".7"/>
      <rect x="344" y="118" width="88" height="5" rx="2" fill="#818cf8" opacity=".5"/>
      <rect x="344" y="130" width="92" height="14" rx="5" fill="url(#purpleGrad)" opacity=".8"/>
    </g>
    <g className="float pop3">
      <rect x="310" y="280" width="130" height="56" rx="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
      <circle cx="330" cy="300" r="8" fill="#22c55e" opacity=".8"/>
      <rect x="346" y="294" width="78" height="5" rx="2" fill="#a5b4fc" opacity=".7"/>
      <rect x="346" y="306" width="55" height="5" rx="2" fill="#6366f1" opacity=".5"/>
      <text x="322" y="328" fontSize="9" fill="#22c55e" fontFamily="monospace">✓ Project Delivered</text>
    </g>
    {/* Connection lines */}
    <path className="draw" d="M140 200 Q90 200 90 145" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3"/>
    <path className="draw" d="M340 200 Q390 200 390 120" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 3"/>
    <path className="draw" d="M340 260 Q375 260 375 300" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 3"/>
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#0f0e1f" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#a855f7"/>
      </linearGradient>
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#a855f7"/>
        <stop offset="100%" stopColor="#7c3aed"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── Animated SVG for Specialty (left side) ── */
const SpecialtyAnimation = () => (
  <svg viewBox="0 0 400 380" className="w-full max-w-md mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes spin-slow { to{transform:rotate(360deg)} }
      @keyframes spin-rev { to{transform:rotate(-360deg)} }
      @keyframes orbit { 0%{transform:rotate(0deg) translateX(90px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(90px) rotate(-360deg)} }
      @keyframes orbit2 { 0%{transform:rotate(120deg) translateX(90px) rotate(-120deg)} 100%{transform:rotate(480deg) translateX(90px) rotate(-480deg)} }
      @keyframes orbit3 { 0%{transform:rotate(240deg) translateX(90px) rotate(-240deg)} 100%{transform:rotate(600deg) translateX(90px) rotate(-600deg)} }
      @keyframes glow-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      .ring-outer { transform-origin:200px 190px; animation:spin-slow 20s linear infinite; }
      .ring-inner { transform-origin:200px 190px; animation:spin-rev 14s linear infinite; }
      .orb1 { transform-origin:200px 190px; animation:orbit 8s linear infinite; }
      .orb2 { transform-origin:200px 190px; animation:orbit2 8s linear infinite; }
      .orb3 { transform-origin:200px 190px; animation:orbit3 8s linear infinite; }
      .gp { animation:glow-pulse 3s ease-in-out infinite; }
    `}</style>
    {/* Outer dashed ring */}
    <circle className="ring-outer" cx="200" cy="190" r="130" stroke="#6366f1" strokeWidth="1" strokeDasharray="6 8" opacity=".4"/>
    {/* Inner dashed ring */}
    <circle className="ring-inner" cx="200" cy="190" r="90" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 6" opacity=".35"/>
    {/* Center hub */}
    <circle cx="200" cy="190" r="55" fill="url(#hubGrad)" opacity=".15"/>
    <circle cx="200" cy="190" r="42" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2"/>
    <circle cx="200" cy="190" r="42" fill="url(#hubGrad)" opacity=".3" className="gp"/>
    {/* Center icon - checkmark / shield */}
    <path d="M184 190 l10 10 l20-22" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="200" cy="190" r="28" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 4" opacity=".6"/>
    {/* Orbiting icons */}
    <g className="orb1">
      <circle cx="200" cy="190" r="18" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="194" y="195" fontSize="13" fill="#818cf8">💼</text>
    </g>
    <g className="orb2">
      <circle cx="200" cy="190" r="18" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1.5"/>
      <text x="194" y="195" fontSize="13" fill="#c084fc">🔒</text>
    </g>
    <g className="orb3">
      <circle cx="200" cy="190" r="18" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
      <text x="194" y="195" fontSize="13" fill="#a5b4fc">💬</text>
    </g>
    {/* Stats cards */}
    <g transform="translate(18,20)">
      <rect width="95" height="44" rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="12" y="18" fontSize="8" fill="#a5b4fc" fontFamily="sans-serif">Projects Done</text>
      <text x="12" y="34" fontSize="16" fontWeight="bold" fill="#818cf8" fontFamily="sans-serif">2,400+</text>
    </g>
    <g transform="translate(285,300)">
      <rect width="95" height="44" rx="10" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5"/>
      <text x="12" y="18" fontSize="8" fill="#d8b4fe" fontFamily="sans-serif">Freelancers</text>
      <text x="12" y="34" fontSize="16" fontWeight="bold" fill="#c084fc" fontFamily="sans-serif">1,800+</text>
    </g>
    <defs>
      <radialGradient id="hubGrad" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

const HomePage = () => {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a0c18", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .section-title { font-family:'Syne',sans-serif; }
        .grad-text { background:linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .card-dark { background:rgba(30,27,75,0.5); border:1px solid rgba(99,102,241,0.2); backdrop-filter:blur(12px); }
        .card-dark:hover { border-color:rgba(99,102,241,0.5); box-shadow:0 0 30px rgba(99,102,241,0.15); }
        .btn-primary { background:linear-gradient(135deg,#6366f1,#a855f7); box-shadow:0 0 25px rgba(99,102,241,0.35); }
        .btn-primary:hover { opacity:.9; transform:translateY(-2px); }
        .btn-outline { border:1.5px solid rgba(99,102,241,0.5); color:#a5b4fc; }
        .btn-outline:hover { background:rgba(99,102,241,0.1); border-color:#818cf8; }
        .divider { width:48px; height:3px; background:linear-gradient(90deg,#6366f1,#a855f7); border-radius:9px; }
        .check-item { background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.15); border-radius:12px; }
        .check-item:hover { background:rgba(99,102,241,0.14); }
        .footer-bg { background:#060810; border-top:1px solid rgba(99,102,241,0.15); }
        .social-icon { width:36px; height:36px; border-radius:8px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.25); display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .social-icon:hover { background:rgba(99,102,241,0.3); }
        .team-card { background:rgba(15,14,31,0.8); border:1px solid rgba(99,102,241,0.2); }
        .team-card:hover { border-color:#818cf8; box-shadow:0 8px 40px rgba(99,102,241,0.2); }
        .cat-card { background:rgba(15,14,31,0.7); border:1px solid rgba(99,102,241,0.2); }
        .cat-card:hover { border-color:rgba(168,85,247,0.5); box-shadow:0 0 24px rgba(168,85,247,0.12); }
        .noise { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"); }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden noise">
        {/* bg orbs */}
        <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 70%)', pointerEvents:'none' }}/>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center relative z-10">
          <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:.8 }}>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-4 px-3 py-1 rounded-full" style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)' }}>
              #1 Freelance Marketplace
            </span>
            <h1 className="section-title text-5xl font-bold mb-6 leading-tight">
              Why Choose <span className="grad-text">ProLance?</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed" style={{ maxWidth:480 }}>
              ProLance is a modern freelancing marketplace where clients connect with skilled freelancers to complete projects efficiently. Work freely, collaborate securely, and grow professionally.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/browse-projects" className="btn-primary px-7 py-3 rounded-xl text-white font-semibold transition-all" style={{ fontSize:'0.9rem' }}>
                Explore Projects
              </Link>
              <Link to="/signup" className="btn-outline px-7 py-3 rounded-xl font-semibold transition-all" style={{ fontSize:'0.9rem' }}>
                Get Started
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:.8 }}>
            <HeroAnimation />
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 px-6" style={{ background:'#0d0f1e' }}>
        <div className="text-center mb-14">
          <h2 className="section-title text-3xl font-bold mb-3">Freelancing Projects</h2>
          <div className="divider mx-auto"/>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            { title:"Web Development", link:"/projects/web", icon:"💻" },
            { title:"Graphic Design", link:"/projects/design", icon:"🎨" },
            { title:"Article Writing", link:"/projects/writing", icon:"✍️" },
            { title:"Video Editing", link:"/projects/video", icon:"🎬" },
            { title:"Android Development", link:"/projects/android", icon:"🎨" },
            { title:"Artificial Intelligence", link:"/projects/ai", icon:"✍️" },
            { title:"Quantum Computing", link:"/projects/quantum", icon:"🎬" },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y:-6 }} transition={{ type:'spring', stiffness:300 }}
              className="cat-card rounded-2xl p-7 text-center cursor-pointer transition-all">
              <Link to={item.link}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-slate-100">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Explore top quality {item.title} projects from clients worldwide.
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SPECIALTY ── */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background:'#0a0c18' }}>
        <div style={{ position:'absolute', top:'20%', right:'8%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div className="text-center mb-14 relative z-10">
          <h2 className="section-title text-3xl font-bold mb-3">ProLance Specialty</h2>
          <div className="divider mx-auto"/>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:.7 }} viewport={{ once:true }}>
            <SpecialtyAnimation />
          </motion.div>
          <div className="space-y-4">
            {[
              { text:"Post your project easily with clear requirements.", icon:"📋" },
              { text:"Choose from verified freelancers with ratings.", icon:"⭐" },
              { text:"Secure milestone-based payments system.", icon:"🔒" },
              { text:"Real-time collaboration and chat support.", icon:"💬" },
            ].map((point, i) => (
              <motion.div key={i} initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }}
                transition={{ duration:.5, delay: i * 0.12 }} viewport={{ once:true }}
                className="check-item flex items-start gap-4 p-4 transition-all">
                <span className="text-2xl mt-0.5">{point.icon}</span>
                <div>
                  <p className="text-slate-300 font-medium">{point.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 px-6" style={{ background:'#0d0f1e' }}>
        <div className="text-center mb-14">
          <h2 className="section-title text-3xl font-bold mb-3">Our Team</h2>
          <div className="divider mx-auto"/>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {src:"/photo.jpg", name:"Md Ali", role:"Backend Developer" },
            {src:"/photo.jpg", name:"Siva Shankar", role:"UI/UX Designer" },
            {src:"/photo.jpg", name:"Paul Mathewes", role:"Frontend Developer" },
          ].map((member, i) => (
            <motion.div key={i} whileHover={{ y:-8 }} transition={{ type:'spring', stiffness:280 }}
              className="team-card rounded-2xl p-8 text-center transition-all">
              <div className="relative inline-block mb-5">
                <img src={member.src} alt=""
                  className="w-24 h-24 rounded-full mx-auto border-2 border-indigo-500/60"/>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2" style={{ borderColor:'#0d0f1e' }}/>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-slate-100">{member.name}</h3>
              <p className="text-indigo-400 text-sm mb-5">{member.role}</p>
              <div className="flex justify-center gap-3">
                {[FaFacebookF, FaTwitter, FaLinkedinIn].map((Icon, j) => (
                  <div key={j} className="social-icon cursor-pointer">
                    <Icon size={13} color="#818cf8"/>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-bg py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="section-title text-2xl font-bold grad-text mb-3">ProLance</h3>
            <p className="text-slate-500 text-sm leading-relaxed">RK Valley<br/>+91 9876543210</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-300 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[{ to:"/", label:"About Us" },{ to:"/browse-projects", label:"Projects" },{ to:"/", label:"Contact" }].map(l => (
                <li key={l.to}><Link to={l.to} className="text-slate-500 hover:text-indigo-400 transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-300 text-sm uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaLinkedinIn].map((Icon, i) => (
                <div key={i} className="social-icon cursor-pointer"><Icon size={13} color="#818cf8"/></div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-10 text-xs text-slate-600 border-t border-white/5 pt-6">
          © {new Date().getFullYear()} ProLance. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;