import AnimatedBackground from "../animation/AnimatedBackground";
import { LoginCard } from "../components/pagesCard/LoginCard";

const Login = ()=> {
  return (
    <div className="bg-[#0A0A0A] min-h-screen flex">
      {/* Left side - animated text */}
      <div className="w-[60%] flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
      </div>

      {/* Right side - login card */}
      <div className="w-[40%]  flex items-center justify-center">
        <LoginCard />
      </div>
    </div>
  );
}

export default Login;
