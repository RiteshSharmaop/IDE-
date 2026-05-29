import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useSocket } from "../../context/SocketContext";
import { useRoom } from "../../context/RoomContext";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function SignupCard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signin } = useAuth();

  const { socket, socketId, setSocketId } = useSocket();
  const { roomId, setRoomId } = useRoom();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // connect to socket
    if (!socket) return;

    console.log("SocketID : ", socketId);

    return () => socket.off("receiveMessage");
  }, [socket, socketId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("joinedRoom", ({ roomId }) => {
      console.log(`✅ Joined room ${roomId}`);
    });

    socket.on("someoneJoined", ({ socketId }) => {
      console.log(`👋 Someone joined the room: ${socketId}`);
    });

    return () => {
      socket.off("joinedRoom");
      socket.off("someoneJoined");
    };
  }, [socket]);

  const handleSignup = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/signup", {
        username,
        email,
        password,
      });

      if (res?.data?.success) {
        // Store email for OTP verification
        localStorage.setItem("signupEmail", email);
        
        // Show success message and redirect to OTP verification
        setError(null);
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } });
        }, 500);
      } else {
        setError(res?.data?.message || "Signup failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className={`relative w-full max-w-lg shadow-lg z-10 border ${
      isDark
        ? "bg-[#171717] text-[#D0D0D0] border-[#3E3F3E]"
        : "bg-white text-slate-900 border-slate-200"
    }`}>
      <CardHeader>
        <CardTitle className={isDark ? "text-white text-xl font-semibold" : "text-slate-950 text-xl font-semibold"}>
          Create an account
        </CardTitle>
        <CardDescription className={isDark ? "text-[#D0D0D0]" : "text-slate-600"}>
          Enter your details to sign up and get started
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            {/* Username Field */}
            <div className="grid gap-2">
              <Label htmlFor="username" className={isDark ? "text-[#D0D0D0]" : "text-slate-700"}>
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                required
                className={isDark
                  ? "bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0]"
                  : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-500"
                }
              />
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email" className={isDark ? "text-[#D0D0D0]" : "text-slate-700"}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className={isDark
                  ? "bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0]"
                  : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-500"
                }
              />
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="password" className={isDark ? "text-[#D0D0D0]" : "text-slate-700"}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="new-password"
                  className={isDark
                    ? "bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0] pr-10"
                    : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-500 pr-10"
                  }
                />

                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none ${
                    isDark ? "text-[#D0D0D0] hover:text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                  role="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          onClick={handleSignup}
          disabled={loading}
          className={isDark
            ? "w-full cursor-pointer hover:bg-[#3E3F3E] bg-white text-black hover:text-[#D0D0D0]"
            : "w-full cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
          }
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
        <Button
          variant="outline"
          className={isDark
            ? "w-full cursor-pointer border border-[#3E3F3E] bg-[#3e3f3eaf] hover:bg-[#6260608e] text-white hover:text-white"
            : "w-full cursor-pointer border border-slate-300 bg-white hover:bg-slate-100 text-slate-900"
          }
          onClick={() => {
            navigate("/not-found");
          }}
        >
          Sign Up with Google
        </Button>
        <CardAction className="flex justify-center items-center">
          <Link to="/signin">
            <Button
              variant="link"
              className={isDark ? "text-[#D0D0D0] cursor-pointer hover:text-white" : "text-slate-700 cursor-pointer hover:text-slate-950"}
            >
              Already have an account? Login
            </Button>
          </Link>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
