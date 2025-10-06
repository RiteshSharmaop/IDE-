import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const CardNav = () => {
  return (
    <nav className="bg-black/10 fixed top-10 left-1/2 transform -translate-x-1/2 w-1/2 flex items-center justify-between px-9 py-4 backdrop-blur-sm z-20 rounded-full border border-white/20">
      {/* Logo + Title */}
      <div className="flex items-center space-x-3">
        <img 
          src={logo} 
          alt="Logo" 
          className="w-12 h-12 object-contain transform scale-170"
        />
        <h1 className="text-white text-xl font-bold">HexaHub</h1>
      </div>

      {/* Links */}
      <div className="flex space-x-6 text-white font-medium">
        <Link to="https://github.com/RiteshSharmaop/IDE-" className="hover:text-gray-300 transition">Github</Link>
        <Link to="/about" className="hover:text-gray-300 transition">Architecture</Link>
      </div>
    </nav>
  );
};

export default CardNav;
