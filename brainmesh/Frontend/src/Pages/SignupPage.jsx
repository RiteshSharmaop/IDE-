import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff, MessageCircle, User, Mail, Lock, ArrowRight, Github, Chrome, CloudCog } from 'lucide-react';
import { LOGO_URL, NAME } from '../constants';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';





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
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.speedX + 100) % 100,
        y: (particle.y + particle.speedY + 100) % 100,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
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

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useContext(UserDataContext);
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignup = async () => {
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (!acceptTerms) {
      alert('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/user/register`,
        {
          fullName: signupData.fullName,
          email: signupData.email,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword,
        },
        { withCredentials: true }
      );

      // success
 
      
      
      const data = res.data.data;
      setToken(data.token);   // stores in state + localStorage
      setUser({ email: data.email, fullName: data.fullName });
      localStorage.setItem("token", data.token);
      navigate("/chat");
      
      

      
    } catch (err) {
      if (err.response) {
        if (err.response.statusCode === 409) {
          // specific: user exists
          alert("User with this email already exists ❌");
        } else if (err.response.status === 400) {
          // specific: user exists
          alert("write correct details❌");
        }else {
          // other backend errors
          alert(err.response.data.message || "Something went wrong ❌");
        }
      } else {
        // network or unknown error
        alert("Network error. Try again later ❌");
      }
    } finally {
      setIsLoading(false);
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && signupData.fullName && signupData.email && signupData.password && signupData.confirmPassword && acceptTerms) {
      handleSignup();
    }
  };

  const isFormValid = signupData.fullName && signupData.email && signupData.password && signupData.confirmPassword && acceptTerms;

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
          <h2 className="text-2xl font-semibold text-white mb-2">Create account</h2>
          <p className="text-gray-400">Join us and start chatting with multiple LLMs</p>
        </div>

        {/* Signup Form */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
          <div className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
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
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {signupData.confirmPassword && (
              <div className={`text-sm ${signupData.password === signupData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                {signupData.password === signupData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 mt-1 mr-3"
              />
              <div className="text-sm text-gray-300">
                I agree to the{' '}
                <button type="button" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
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
                <span className="px-2 bg-gray-900/50 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Social Signup */}
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

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <button onClick={()=>{
              navigate("/login")
            }} className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;