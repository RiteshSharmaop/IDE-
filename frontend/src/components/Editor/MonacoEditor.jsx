import React, { useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { colors } from "../../lib/utils";
import { RemoteCursorsOverlay } from "./RemoteCursorsOverlay";

export const MonacoEditor = ({
  value,
  onChange,
  language,
  theme,
  onCursorChange,
  onEditorMount,
  remoteCursors = new Map(),
}) => {
  const editorRef = useRef(null);

  const handleEditorMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      // Call parent's onEditorMount callback if provided
      if (onEditorMount) {
        onEditorMount(editor);
      }
    },
    [onEditorMount]
  );

  const handleCursorChange = useCallback(() => {
    if (!editorRef.current || !onCursorChange) return;

    const position = editorRef.current.getPosition();
    if (position) {
      onCursorChange({
        line: position.lineNumber - 1,
        column: position.column - 1,
      });
    }
  }, [onCursorChange]);

  return (
    <div
      className={`h-full rounded-lg overflow-hidden transition-all duration-200 relative
        ${
          theme === "dark"
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
        onMount={handleEditorMount}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        onDidChangeCursorPosition={handleCursorChange}
      />
      {editorRef.current && (
        <RemoteCursorsOverlay
          remoteCursors={remoteCursors}
          editorInstance={editorRef.current}
        />
      )}
    </div>
  );
};
