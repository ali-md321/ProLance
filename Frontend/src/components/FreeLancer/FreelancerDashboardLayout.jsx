// freelancer/FreelancerDashboardLayout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Search, FileText, MessagesSquare, Briefcase, CheckCircle, User, LogOut, Menu, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutUserAction } from "../../actions/userAction";

const navLinks = [
  { path: "/freelancer/dashboard",          icon: LayoutDashboard, label: "Dashboard"       },
  { path: "/freelancer/browse-projects",    icon: Search,          label: "Browse Projects" },
  { path: "/freelancer/my-proposals",       icon: FileText,        label: "My Proposals"    },
  { path: "/chat",                          icon: MessagesSquare,  label: "Chats"           },
  { path: "/freelancer/active-projects",    icon: Briefcase,       label: "Active Projects" },
  { path: "/freelancer/completed-projects", icon: CheckCircle,     label: "Completed"       },
  { path: "/freelancer/profile/me",         icon: User,            label: "Profile"         },
];

export default function FreelancerDashboardLayout() {
  const location  = useLocation();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isChat    = location.pathname === "/chat";
  const collapsed = isChat;

  const handleLogout = async () => {
    await dispatch(logoutUserAction());
    navigate("/");
  };

  const sidebarStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
    .nav-active   { background:linear-gradient(135deg,rgba(99,102,241,0.25),rgba(168,85,247,0.15)); border:1px solid rgba(99,102,241,0.35); color:#a5b4fc; }
    .nav-inactive { border:1px solid transparent; color:rgba(148,163,184,0.65); }
    .nav-inactive:hover { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.15); color:#c7d2fe; }
    .active-dot   { width:6px; height:6px; border-radius:50%; background:linear-gradient(135deg,#818cf8,#c084fc); box-shadow:0 0 8px #818cf8; flex-shrink:0; }
    .logout-btn:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.3) !important; color:#f87171 !important; }
    .sidebar-bg   { background:rgba(13,12,28,0.95); border-right:1px solid rgba(99,102,241,0.15); backdrop-filter:blur(24px); }
    @keyframes spin-slow { to { transform:rotate(360deg) } }
    .spin-s { animation:spin-slow 30s linear infinite; transform-origin:center; }
    .nav-tooltip {
      position:absolute; left:calc(100% + 12px); top:50%; transform:translateY(-50%);
      background:rgba(13,12,28,0.97); border:1px solid rgba(99,102,241,0.3);
      color:#c7d2fe; font-size:0.75rem; font-weight:600; white-space:nowrap;
      padding:5px 10px; border-radius:8px; pointer-events:none;
      opacity:0; transition:opacity 0.15s; z-index:200;
      box-shadow:0 4px 16px rgba(0,0,0,0.4);
    }
    .nav-tooltip::before {
      content:''; position:absolute; right:100%; top:50%; transform:translateY(-50%);
      border:5px solid transparent; border-right-color:rgba(99,102,241,0.3);
    }
    .nav-link-wrap:hover .nav-tooltip { opacity:1; }
    .sidebar-transition { transition: width 0.25s cubic-bezier(0.4,0,0.2,1); }
    .main-transition    { transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1); }
  `;

  const SidebarContent = ({ mobile = false }) => {
    const showFull = !collapsed || mobile;
    return (
      <>
        <style>{sidebarStyles}</style>

        {/* Logo */}
        <div className={`pt-7 pb-5 ${showFull ? "px-5" : "px-0 flex flex-col items-center"}`}>
          <div className={`flex items-center ${showFull ? "gap-2.5" : "justify-center"}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 16px rgba(99,102,241,0.4)" }}>
              <span className="text-white font-bold text-sm" style={{ fontFamily:"'Syne',sans-serif" }}>P</span>
            </div>
            {showFull && (
              <span className="text-xl font-bold" style={{ fontFamily:"'Syne',sans-serif", background:"linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                ProLance
              </span>
            )}
          </div>
          {showFull ? (
            <div className="mt-3 px-1">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(148,163,184,0.4)" }}>Freelancer Portal</div>
              <div className="h-px w-full mt-2" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.4),transparent)" }}/>
            </div>
          ) : (
            <div className="mt-3 w-8 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)" }}/>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 space-y-1.5 ${showFull ? "px-3" : "px-2"}`}>
          {navLinks.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return showFull ? (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? "nav-active" : "nav-inactive"}`}
                style={{ fontFamily:"'DM Sans',sans-serif" }}>
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}/>
                <span className="flex-1">{label}</span>
                {active && <div className="active-dot"/>}
              </Link>
            ) : (
              <div key={path} className="relative nav-link-wrap">
                <Link to={path}
                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${active ? "nav-active" : "nav-inactive"}`}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}/>
                </Link>
                <span className="nav-tooltip">{label}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`pb-6 mt-6 ${showFull ? "px-3" : "px-2"}`}>
          <div className="h-px mb-4" style={{ background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)" }}/>
          {showFull ? (
            <button onClick={handleLogout}
              className="logout-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
              style={{ border:"1px solid rgba(239,68,68,0.15)", color:"rgba(239,68,68,0.6)", fontFamily:"'DM Sans',sans-serif" }}>
              <LogOut size={16} strokeWidth={1.8}/> Logout
            </button>
          ) : (
            <div className="relative nav-link-wrap">
              <button onClick={handleLogout}
                className="logout-btn flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all"
                style={{ border:"1px solid rgba(239,68,68,0.15)", color:"rgba(239,68,68,0.6)" }}>
                <LogOut size={17} strokeWidth={1.8}/>
              </button>
              <span className="nav-tooltip">Logout</span>
            </div>
          )}
        </div>

        {/* Decorative rings */}
        <svg className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none" width="180" height="180" viewBox="0 0 180 180">
          <circle className="spin-s" cx="90" cy="90" r="75" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 10"/>
          <circle cx="90" cy="90" r="50" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 8" opacity=".6"/>
        </svg>
      </>
    );
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily:"'DM Sans',sans-serif", background:"#0a0c18" }}>

      {/* Desktop Sidebar */}
      <aside className={`sidebar-bg sidebar-transition hidden md:flex flex-col fixed top-0 left-0 h-full z-40 ${collapsed ? "w-16" : "w-60"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background:"rgba(13,12,28,0.95)", borderBottom:"1px solid rgba(99,102,241,0.15)", backdropFilter:"blur(20px)" }}>
        <span className="text-lg font-bold"
          style={{ fontFamily:"'Syne',sans-serif", background:"linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          ProLance
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg transition-all"
          style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
          {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
        </button>
      </div>

      {/* Mobile Drawer — always full width */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}/>
          <aside className="sidebar-bg absolute top-0 left-0 h-full w-60 flex flex-col z-50" onClick={e => e.stopPropagation()}>
            <SidebarContent mobile={true} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 main-transition pt-16 md:pt-0 min-h-screen relative ${collapsed ? "md:ml-16" : "md:ml-60"}`}
        style={{ background:"#0a0c18" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"5%", right:"5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div className={`relative z-10 ${isChat ? "p-0 h-[calc(100vh-0px)] md:h-screen" : "p-5 md:p-8"}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}