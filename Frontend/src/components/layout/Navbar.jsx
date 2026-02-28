// components/layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const {user, isAuthenticated} = useSelector((s) => s.user);
  //const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    //dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed w-full z-50 backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* 🔷 Logo Section */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="w-9 h-9 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold"
          >
            P
          </motion.div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            ProLance
          </h1>
        </Link>

        {/* 🔷 Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">

          <NavItem to="/browse-projects" label="Browse Projects" />
          <NavItem to="/find-freelancers" label="Find Freelancers" />
          <NavItem to="/how-it-works" label="How It Works" />

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hover:text-indigo-500 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-indigo-500 font-semibold">
                Hi, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* 🔷 Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <div className="w-6 h-0.5 bg-black mb-1"></div>
            <div className="w-6 h-0.5 bg-black mb-1"></div>
            <div className="w-6 h-0.5 bg-black"></div>
          </button>
        </div>
      </div>

      {/* 🔷 Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-lg px-6 py-4 flex flex-col gap-4"
          >
            <Link to="/browse-projects">Browse Projects</Link>
            <Link to="/find-freelancers">Find Freelancers</Link>
            <Link to="/how-it-works">How It Works</Link>

            {!user?.isAuthenticated ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            ) : (
              <>
                <span>Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavItem = ({ to, label }) => (
  <Link
    to={to}
    className="relative group hover:text-indigo-500 transition"
  >
    {label}
    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
  </Link>
);

export default Navbar;