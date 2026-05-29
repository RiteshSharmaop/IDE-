import React, { useState, useEffect, useContext } from "react";
import {
  Eye,
  EyeOff,
  MessageCircle,
  Mail,
  Lock,
  ArrowRight,
  Github,
  Chrome,
} from "lucide-react";
import { LOGO_URL, NAME } from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

// Particle Background Component
const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    setParticles(particleArray);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useContext(UserDataContext);
  const [loginData, setLoginData] = useState({
    email: "test@test.com",
    password: "testtest",
  });



  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const { email, password } = loginData;

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/user/login`,
        { email, password },
        { withCredentials: true } // This is needed for cookies

        // ensures cookies are sent/received
      );
      console.log("RES : " , res);

      if (res.data.success || res.status === 201 || res.status === 200) {
        // Extract user and token from the response
        const { token, user } = res.data.data;

        // Update context
        setToken(token);
        setUser({
          email: user.email,
          fullName: user.fullName,
        });

        // Store token in localStorage
        localStorage.setItem("token", token);

        console.log("Login successful:", { token, user });

        // Navigate to chat
        navigate("/chat");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        if (err.response.status === 404) {
          alert("User not found. Please check your email ❌");
        } else if (err.response.status === 400) {
          alert("Invalid email or password ❌");
        } else if (err.response.status === 401) {
          alert("Invalid credentials ❌");
        } else {
          // Get error message from the API response if available
          const errorMessage = err.response.data?.message || "Login failed";
          alert(`${errorMessage} ❌`);
        }
      } else if (err.request) {
        // Network error
        alert("Network error. Please check your internet connection ❌");
      } else {
        alert("Something went wrong. Please try again ❌");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && loginData.email && loginData.password) {
      await handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-gray-900 text-white">
      <ParticleBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <iframe
                src={LOGO_URL}
                width="51"
                height="51"
                frameBorder="0"
                className="giphy-embed rounded-2xl shadow-lg"
                allowFullScreen
                title="gif-chimpanzee"
              ></iframe>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {NAME}
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome back
          </h2>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  className="rounded border-gray-600 bg-gray-700 mr-2"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading || !loginData.email || !loginData.password}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-white py-2 px-4 rounded-xl transition-all"
              >
                <Chrome className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-white py-2 px-4 rounded-xl transition-all"
              >
                <Github className="w-5 h-5" />
                GitHub
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <button
              onClick={() => {
                navigate("/register");
              }}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
