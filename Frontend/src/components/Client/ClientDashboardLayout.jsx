import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, PlusCircle, Folder, CheckCircle, User, LogOut, Menu, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutUserAction } from "../../actions/userAction";

const navLinks = [
  { path: "/dashboard",      icon: Home,        label: "Dashboard"   },
  { path: "/create-project", icon: PlusCircle,  label: "Post Project"},
  { path: "/projects",       icon: Folder,      label: "My Projects" },
  { path: "/proposals/all",  icon: Folder,      label: "All Proposals" },
  { path: "/completed",      icon: CheckCircle, label: "Completed"   },
  { path: `/profile/me`,               icon: User,        label: "Profile"     },
];

export default function ClientDashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
      await dispatch(logoutUserAction());
      navigate("/");
    };

  const SidebarContent = () => (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .nav-active { background:linear-gradient(135deg,rgba(99,102,241,0.25),rgba(168,85,247,0.15)); border:1px solid rgba(99,102,241,0.35); color:#a5b4fc; }
        .nav-inactive { border:1px solid transparent; color:rgba(148,163,184,0.65); }
        .nav-inactive:hover { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.15); color:#c7d2fe; }
        .active-dot { width:6px; height:6px; border-radius:50%; background:linear-gradient(135deg,#818cf8,#c084fc); box-shadow:0 0 8px #818cf8; }
        .logout-btn:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.3); color:#f87171; }
        .sidebar-bg { background:rgba(13,12,28,0.95); border-right:1px solid rgba(99,102,241,0.15); backdrop-filter:blur(24px); }
        .main-bg { background:#0a0c18; }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .spin-s { animation:spin-slow 30s linear infinite; transform-origin:center; }
      `}</style>

      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 16px rgba(99,102,241,0.4)" }}>
            <span className="text-white font-bold text-sm" style={{ fontFamily:"'Syne',sans-serif" }}>P</span>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily:"'Syne',sans-serif", background:"linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            ProLance
          </span>
        </div>
        <div className="mt-4 px-1">
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color:"rgba(148,163,184,0.4)" }}>Client Portal</div>
          <div className="h-px w-full mt-3" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.4),transparent)" }}/>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1.5">
        {navLinks.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? "nav-active" : "nav-inactive"}`}
              style={{ fontFamily:"'DM Sans',sans-serif" }}>
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}/>
              <span className="flex-1">{label}</span>
              {active && <div className="active-dot"/>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 mt-6">
        <div className="h-px mb-4" style={{ background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)" }}/>
        <button onClick={handleLogout}
          className="logout-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
          style={{ border:"1px solid rgba(239,68,68,0.15)", color:"rgba(239,68,68,0.6)", fontFamily:"'DM Sans',sans-serif" }}>
          <LogOut size={16} strokeWidth={1.8}/>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ fontFamily:"'DM Sans',sans-serif", background:"#0a0c18" }}>

      {/* Desktop Sidebar */}
      <aside className="sidebar-bg hidden md:flex flex-col w-60 fixed top-0 left-0 h-full z-40">
        {/* decorative ring */}
        <svg className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none" width="180" height="180" viewBox="0 0 180 180">
          <circle className="spin-s" cx="90" cy="90" r="75" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 10"/>
          <circle cx="90" cy="90" r="50" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 8" opacity=".6"/>
        </svg>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background:"rgba(13,12,28,0.95)", borderBottom:"1px solid rgba(99,102,241,0.15)", backdropFilter:"blur(20px)" }}>
        <span className="text-lg font-bold" style={{ fontFamily:"'Syne',sans-serif", background:"linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          ProLance
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg transition-all"
          style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
          {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}/>
          <aside className="sidebar-bg absolute top-0 left-0 h-full w-64 flex flex-col z-50" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 min-h-screen relative"
        style={{ background:"#0a0c18" }}>
        {/* grid texture */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>
        {/* orb */}
        <div style={{ position:"absolute", top:"5%", right:"5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div className="relative z-10 p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}