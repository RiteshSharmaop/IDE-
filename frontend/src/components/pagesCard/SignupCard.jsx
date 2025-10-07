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
import { useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function SignupCard() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signin } = useAuth();

  const handleSignup = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/auth/signup", {
        username,
        email,
        password,
      });
      if (res?.data?.success) {
        const token = res.data.data?.token;
        const user = res.data.data?.user;
        if (token) signin(token, user);
        navigate("/home");
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
    <Card className="relative w-full max-w-sm bg-[#171717] text-[#D0D0D0] border border-[#3E3F3E] shadow-lg z-10">
      <CardHeader>
        <CardTitle className="text-white text-xl font-semibold">
          Create an account
        </CardTitle>
        <CardDescription className="text-[#D0D0D0]">
          Enter your details to sign up and get started
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            {/* Username Field */}
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-[#D0D0D0]">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                required
                className="bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0]"
              />
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#D0D0D0]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className="bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0]"
              />
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-[#D0D0D0]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0]"
              />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          onClick={handleSignup}
          disabled={loading}
          className="w-full cursor-pointer hover:bg-[#3E3F3E] bg-white text-black hover:text-[#D0D0D0]"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
        <Button
          variant="outline"
          className="w-full cursor-pointer border border-[#3E3F3E] bg-[#3e3f3eaf] hover:bg-[#6260608e] text-white hover:text-white"
        >
          Sign Up with Google
        </Button>
        <CardAction className="flex justify-center items-center">
          <Link to="/signin">
            <Button
              variant="link"
              className="text-[#D0D0D0] cursor-pointer hover:text-white"
            >
              Already have an account? Login
            </Button>
          </Link>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
