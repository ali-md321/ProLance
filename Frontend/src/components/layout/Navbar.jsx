// components/layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { logoutUserAction } from "../../actions/userAction";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUserAction());
    navigate("/");
  };

  return (
    <nav className="fixed w-full z-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .nav-bg { background: rgba(15, 18, 30, 0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .logo-text { font-family: 'Syne', sans-serif; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-link { position: relative; color: rgba(203,213,225,0.85); font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
        .nav-link::after { content:''; position:absolute; left:0; bottom:-3px; width:0; height:1.5px; background: linear-gradient(90deg,#818cf8,#c084fc); transition: width 0.25s ease; }
        .nav-link:hover { color: #e2e8f0; }
        .nav-link:hover::after { width: 100%; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 10px; font-size: 0.875rem; font-weight: 600; color: #fff; padding: 0.45rem 1.1rem; transition: opacity 0.2s, transform 0.2s; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-ghost { color: rgba(203,213,225,0.8); font-size: 0.875rem; font-weight: 500; padding: 0.45rem 0.9rem; border-radius: 10px; transition: background 0.2s, color 0.2s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
        .btn-danger { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; border-radius: 10px; font-size: 0.875rem; font-weight: 600; padding: 0.45rem 1rem; transition: background 0.2s; }
        .btn-danger:hover { background: rgba(239,68,68,0.5); }
        .mobile-menu { background: rgba(15,18,30,0.97); border-top: 1px solid rgba(255,255,255,0.07); }
        .mobile-link { color: rgba(203,213,225,0.8); font-size: 0.9rem; font-weight: 500; padding: 0.65rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); transition: color 0.2s; }
        .mobile-link:hover { color: #a78bfa; }
        .hamburger span { display: block; width: 22px; height: 2px; background: rgba(203,213,225,0.8); border-radius: 2px; transition: all 0.3s; }
        .hamburger span:not(:last-child) { margin-bottom: 5px; }
        .user-badge { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc; border-radius: 8px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; }
        .user-badge:hover { background: rgba(99,102,241,0.5);}
      `}</style>

      <div className="nav-bg">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" className="w-7 h-7" />
            <span className="text-xl font-bold logo-text">ProLance</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavItem to={user?.role === "client" ? "/dashboard" : "/freelancer/dashboard"} label="Go to DashBoard" />

            <div className="w-px h-4 bg-white/10 mx-1" />

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      to={user?.role === "client" ? "/profile/me" : "/freelancer/profile/me"} 
                      className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 group/item user-badge"
                    >
                      <AccountCircleOutlinedIcon />
                      <span >👋 {user?.name || "Anonymous"}</span>
                    </Link>
                  </li>
                </ul>
                <button onClick={handleLogout} className="btn-danger">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="hamburger md:hidden p-1" onClick={() => setIsOpen(!isOpen)}>
            <span style={isOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
            <span style={isOpen ? { opacity: 0 } : {}} />
            <span style={isOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu md:hidden overflow-hidden"
          >
            <div className="px-5 py-2 flex flex-col">
              <Link to="/browse-projects" className="mobile-link">Browse Projects</Link>
              <Link to="/find-freelancers" className="mobile-link">Find Freelancers</Link>
              <Link to="/how-it-works" className="mobile-link">How It Works</Link>

              <div className="pt-3 pb-2 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="btn-ghost text-center">Login</Link>
                    <Link to="/signup" className="btn-primary text-center">Sign Up</Link>
                  </>
                ) : (
                  <>
                    <span className="user-badge text-center">👋 {user?.name}</span>
                    <button onClick={handleLogout} className="btn-danger w-full">Logout</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavItem = ({ to, label }) => (
  <Link to={to} className="nav-link">{label}</Link>
);

export default Navbar;