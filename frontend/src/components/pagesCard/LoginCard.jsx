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
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useSocket } from "../../context/SocketContext";
import { useRoom } from "../../context/RoomContext";

export function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signin } = useAuth();
  const {socket , socketId , setSocketId} = useSocket();
  const { roomId, setRoomId } = useRoom();

   useEffect(() => {
    // connect to socket      
    if (!socket) return;

  
          console.log("SocketID : " , socketId);
      
  
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
 

  const joinRoom = async(roomId)=>{
    // Join the room via socket
    socket.emit("joinRoom", { roomId });
    console.log("Joined Room");
    
    // console.log(`${socketId} joinded room ${roomId}`);

  };
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const createdRoomId = crypto.randomUUID();
    
    try {
      const res = await api.post("/api/auth/signin", { email, password });
      if (res?.data?.success) {
        const token = res.data.data?.token;
        console.log("roomID ", createdRoomId);
        const user = res.data.data?.user;
        if (token) signin(token, user);
        await joinRoom(createdRoomId)
        setRoomId(createdRoomId)
        
        navigate(`/e/${createdRoomId}`);
      } else {
        setError(res?.data?.message || "Login failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoginAndJoinRoom = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post("/api/auth/signin", { email, password });
      if (res?.data?.success) {
        const token = res.data.data?.token;
        const user = res.data.data?.user;
        if (token) signin(token, user);
        
        await joinRoom(roomId);
        setRoomId(roomId)
        
        navigate(`/e/${roomId}`);
      } else {
        setError(res?.data?.message || "Login failed");
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
          Login to your account
        </CardTitle>
        <CardDescription className="text-[#D0D0D0]">
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Link to="/signup">
            <Button
              variant="link"
              className="text-[#D0D0D0] cursor-pointer hover:text-white"
            >
              Sign Up
            </Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-[#D0D0D0]">
                  Password
                </Label>
                <Link
                  to="/not-found"
                  href="#"
                  className="ml-auto cursor-pointer text-sm underline-offset-4 hover:underline text-[#D0D0D0] hover:text-white"
                >
                  Forgot your password?
                </Link>
              </div>
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
          onClick={handleLogin}
          disabled={loading}
          className="w-full cursor-pointer hover:bg-[#3E3F3E] bg-white text-black hover:text-[#D0D0D0]"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
        {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
        <Input
          id="roomId"
          placeholder="room id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0]"
        />
        <Button
          variant="outline"
          className="w-full cursor-pointer border border-[#3E3F3E] bg-[#3e3f3eaf] hover:bg-[#6260608e] text-white hover:text-white"
          onClick={handleLoginAndJoinRoom}
        >
          Login and Join Room
        </Button>
      </CardFooter>
    </Card>
  );
}
