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

export function LoginCard() {
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
          <Button  variant="link" className="text-[#D0D0D0] cursor-pointer hover:text-white">
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
                <a
                  href="#"
                  className="ml-auto cursor-pointer text-sm underline-offset-4 hover:underline text-[#D0D0D0] hover:text-white"
                >
                  Forgot your password?
                </a>
              </div>
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
          Login
        </Button>
        <Button
          variant="outline"
          className="w-full cursor-pointer border border-[#3E3F3E] bg-[#3e3f3eaf] hover:bg-[#6260608e] text-white hover:text-white"
        >
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
