// import { useEffect, useRef } from "react";

// const MonacoEditor = ({ value, onChange, language, theme }) => {
//   const editorRef = useRef(null);
//   const monacoRef = useRef(null);
  
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
//     script.async = true;
//     document.body.appendChild(script);
    
//     script.onload = () => {
//       window.require.config({ 
//         paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
//       });
      
//       window.require(['vs/editor/editor.main'], () => {
//         if (editorRef.current && !monacoRef.current) {
//           monacoRef.current = window.monaco.editor.create(editorRef.current, {
//             value: value,
//             language: language,
//             theme: theme === 'dark' ? 'vs-dark' : 'vs',
//             fontSize: 16,
//             minimap: { enabled: false },
//             automaticLayout: true,
//           });
          
//           monacoRef.current.onDidChangeModelContent(() => {
//             onChange(monacoRef.current.getValue());
//           });
//         }
//       });
//     };
    
//     return () => {
//       if (monacoRef.current) {
//         monacoRef.current.dispose();
//       }
//     };
//   }, []);
  
//   useEffect(() => {
//     if (monacoRef.current && monacoRef.current.getValue() !== value) {
//       monacoRef.current.setValue(value || '');
//     }
//   }, [value]);
  
//   useEffect(() => {
//     if (monacoRef.current) {
//       const model = monacoRef.current.getModel();
//       window.monaco.editor.setModelLanguage(model, language);
//     }
//   }, [language]);

//   useEffect(() => {
//     if (monacoRef.current) {
//       monacoRef.current.updateOptions({
//         theme: theme === 'dark' ? 'vs-dark' : 'vs'
//       });
//     }
//   }, [theme]);
  
//   return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
// };


// export {MonacoEditor}

import Editor from "@monaco-editor/react";

export const MonacoEditor = ({ value, onChange, language, theme }) => (
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
);
