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
import { Link } from "react-router-dom";

export function SignupCard() {
  const handleSignup = async()=>{

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
          className="w-full cursor-pointer hover:bg-[#3E3F3E] bg-white text-black hover:text-[#D0D0D0]"
        >
          Sign Up
        </Button>
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
