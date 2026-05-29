import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const CardNav = ({ theme = "dark" }) => {
  const isDark = theme === "dark";

  return (
    <nav className={`fixed top-10 left-1/2 transform -translate-x-1/2 w-1/2 flex items-center justify-between px-9 py-4 backdrop-blur-sm z-20 rounded-full border ${
      isDark ? "bg-black/10 border-white/20" : "bg-white/70 border-slate-300"
    }`}>
      {/* Logo + Title */}
      <div className="flex items-center space-x-3">
        <img 
          src={logo} 
          alt="Logo" 
          className="w-12 h-12 object-contain transform scale-170"
        />
        <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>HexaHub</h1>
      </div>

      {/* Links */}
      <div className={`flex space-x-6 font-medium ${isDark ? "text-white" : "text-slate-700"}`}>
        <Link to="https://github.com/RiteshSharmaop/IDE-" className={`${isDark ? "hover:text-gray-300" : "hover:text-slate-950"} transition`}>Github</Link>
        <Link to="/about" className={`${isDark ? "hover:text-gray-300" : "hover:text-slate-950"} transition`}>Architecture</Link>
      </div>
    </nav>
  );
};

export default CardNav;
