import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggleButton = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all shadow-sm ${
        isDark
          ? "border-white/20 bg-[#171717]/90 text-[#F5F5F5] hover:bg-[#2A2A2A]"
          : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
      } ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
};

export default ThemeToggleButton;
