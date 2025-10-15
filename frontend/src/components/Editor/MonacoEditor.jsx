
import Editor from "@monaco-editor/react";
import { colors } from "../../lib/utils";
export const MonacoEditor = ({ value, onChange, language, theme }) => (
  
  <div
    className={`h-full rounded-lg overflow-hidden transition-all duration-200
      ${theme === "dark"
        ? `border-2 border-[${colors.dark.bg}] focus-within:ring-1 focus-within:ring-[${colors.dark.bg}]`
        : `border-2 border-[${colors.dark.bg}] focus-within:ring-1 focus-within:ring-gray-700`
      }`}
    
  >
    <Editor
      height="100%"
      value={value}
      defaultLanguage={language}
      theme={theme === "dark" ? "vs-dark" : "light"}
      onChange={onChange}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  </div>
);
