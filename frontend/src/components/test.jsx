import React, { useState, useRef, useEffect } from 'react';
import { Play, User, Menu, X, Plus, FileCode, Folder, Settings, Moon, Sun, Monitor } from 'lucide-react';

// Monaco Editor Component
const MonacoEditor = ({ value, onChange, language, theme }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  useEffect(() => {
    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      window.require.config({ 
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
      });
      
      window.require(['vs/editor/editor.main'], () => {
        if (editorRef.current && !monacoRef.current) {
          monacoRef.current = window.monaco.editor.create(editorRef.current, {
            value: value,
            language: language,
            theme: theme === 'dark' ? 'vs-dark' : 'vs',
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          });
          
          monacoRef.current.onDidChangeModelContent(() => {
            onChange(monacoRef.current.getValue());
          });
        }
      });
    };
    
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);
  
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value || '');
    }
  }, [value]);
  
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel();
      window.monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({
        theme: theme === 'dark' ? 'vs-dark' : 'vs'
      });
    }
  }, [theme]);
  
  return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

const CodeIDE = () => {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [files, setFiles] = useState([
    { id: 1, name: 'main.js', content: '// Write your JavaScript code here\nconsole.log("Hello World");', language: 'javascript' },
    { id: 2, name: 'app.py', content: '# Write your Python code here\nprint("Hello World")', language: 'python' }
  ]);
  const [activeFile, setActiveFile] = useState(files[0]);
  const [openFiles, setOpenFiles] = useState([files[0]]);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [terminalTab, setTerminalTab] = useState('terminal');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('Welcome to Code IDE Terminal\n');
  const [outputContent, setOutputContent] = useState('');
  const [errorContent, setErrorContent] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  
  // Mock user data
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    theme: 'light',
    filesCreated: files.length
  });

  // Color schemes
  const colors = {
    light: {
      mainBg: '#FFFFFF',
      sidebarBg: '#F7F7F8',
      textInactive: '#6E6E80',
      activeHighlight: '#E5E7EB',
      textMain: '#202123',
      accent: '#10A37F',
      accentHover: '#d97706',
      border: '#e5e7eb'
    },
    dark: {
      mainBg: '#343541',
      sidebarBg: '#202123',
      textInactive: '#ECECF1',
      activeHighlight: '#444654',
      textMain: '#ECECF1',
      accent: '#10A37F',
      accentHover: '#d97706',
      border: '#2A2B32',
      hover: '#2A2B32'
    }
  };

  const currentColors = colors[theme];

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript',
      'py': 'python',
      'html': 'html',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'cs': 'csharp',
      'css': 'css',
      'json': 'json',
      'md': 'markdown'
    };
    return langMap[ext] || 'plaintext';
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const newFile = {
        id: Date.now(),
        name: newFileName,
        content: '',
        language: getLanguageFromExtension(newFileName)
      };
      setFiles([...files, newFile]);
      setUser({ ...user, filesCreated: user.filesCreated + 1 });
      setNewFileName('');
      setIsCreatingFile(false);
      setActiveFile(newFile);
      setOpenFiles([...openFiles, newFile]);
    }
  };

  const handleFileClick = (file) => {
    setActiveFile(file);
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
  };

  const handleCloseFile = (fileId, e) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    if (activeFile.id === fileId && newOpenFiles.length > 0) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  const handleEditorChange = (value) => {
    const updatedFile = { ...activeFile, content: value };
    setActiveFile(updatedFile);
    setFiles(files.map(f => f.id === activeFile.id ? updatedFile : f));
    setOpenFiles(openFiles.map(f => f.id === activeFile.id ? updatedFile : f));
  };

  const handleRunCode = () => {
    setOutputContent(`Running ${activeFile.name}...\n${activeFile.content}\n\n[Execution completed]`);
    setErrorContent('');
    setTerminalTab('output');
  };

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput;
      setTerminalOutput(prev => prev + `$ ${cmd}\n`);
      
      // Mock command execution
      if (cmd === 'clear') {
        setTerminalOutput('');
      } else if (cmd === 'ls') {
        setTerminalOutput(prev => prev + files.map(f => f.name).join('  ') + '\n');
      } else {
        setTerminalOutput(prev => prev + `Command executed: ${cmd}\n`);
      }
      
      setTerminalInput('');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setUser({ ...user, theme: newTheme });
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: currentColors.mainBg, color: currentColors.textMain }}>
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b shadow-sm" style={{ backgroundColor: currentColors.mainBg, borderColor: currentColors.border }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded transition-colors"
            style={{ color: currentColors.textMain }}
            onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.activeHighlight}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-semibold" style={{ color: currentColors.textMain }}>Code IDE</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded transition-colors"
            style={{ color: currentColors.textMain }}
            onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.activeHighlight}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={handleRunCode}
            className="flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium text-white"
            style={{ backgroundColor: currentColors.accent }}
            onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.accentHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
          >
            <Play size={18} />
            Run
          </button>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
            style={{ backgroundColor: currentColors.sidebarBg, color: currentColors.textMain }}
            onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.activeHighlight}
            onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.sidebarBg}
          >
            <User size={18} />
            Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r flex flex-col" style={{ backgroundColor: currentColors.sidebarBg, borderColor: currentColors.border }}>
            <div className="p-3 border-b" style={{ borderColor: currentColors.border }}>
              <button
                onClick={() => setIsCreatingFile(true)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded transition-colors font-medium text-white"
                style={{ backgroundColor: currentColors.accent }}
                onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.accentHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
              >
                <Plus size={18} />
                New File
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <div className="text-xs uppercase font-semibold mb-2 px-2" style={{ color: currentColors.textInactive }}>Files</div>
              
              {isCreatingFile && (
                <div className="mb-2 px-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                    onBlur={() => newFileName ? handleCreateFile() : setIsCreatingFile(false)}
                    placeholder="filename.ext"
                    className="w-full px-2 py-1 rounded text-sm focus:outline-none"
                    style={{ 
                      backgroundColor: currentColors.mainBg,
                      border: `2px solid ${currentColors.accent}`,
                      color: currentColors.textMain
                    }}
                    autoFocus
                  />
                </div>
              )}
              
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors mb-1"
                  style={{
                    backgroundColor: activeFile.id === file.id ? currentColors.activeHighlight : 'transparent',
                    color: activeFile.id === file.id ? currentColors.accent : currentColors.textInactive
                  }}
                  onMouseEnter={(e) => {
                    if (activeFile.id !== file.id) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? currentColors.hover : currentColors.activeHighlight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFile.id !== file.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <FileCode size={16} />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: currentColors.mainBg }}>
          {/* Open Files Tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center border-b overflow-x-auto" style={{ backgroundColor: currentColors.sidebarBg, borderColor: currentColors.border }}>
              {openFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => setActiveFile(file)}
                  className="flex items-center gap-2 px-4 py-2 border-r cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeFile.id === file.id ? currentColors.mainBg : 'transparent',
                    color: activeFile.id === file.id ? currentColors.accent : currentColors.textInactive,
                    borderColor: currentColors.border
                  }}
                  onMouseEnter={(e) => {
                    if (activeFile.id !== file.id) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? currentColors.hover : currentColors.activeHighlight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFile.id !== file.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <FileCode size={14} />
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={(e) => handleCloseFile(file.id, e)}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1" style={{ backgroundColor: currentColors.mainBg }}>
            {activeFile ? (
              <MonacoEditor
                value={activeFile.content}
                onChange={handleEditorChange}
                language={activeFile.language}
                theme={theme}
              />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: currentColors.textInactive }}>
                <div className="text-center">
                  <FileCode size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No file open</p>
                  <p className="text-sm mt-2">Create or select a file to start coding</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="h-64 border-t flex flex-col" style={{ backgroundColor: currentColors.sidebarBg, borderColor: currentColors.border }}>
        <div className="flex items-center border-b" style={{ backgroundColor: currentColors.mainBg, borderColor: currentColors.border }}>
          <button
            onClick={() => setTerminalTab('terminal')}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: terminalTab === 'terminal' ? currentColors.accent : currentColors.textInactive,
              borderBottom: terminalTab === 'terminal' ? `2px solid ${currentColors.accent}` : 'none'
            }}
          >
            Terminal
          </button>
          <button
            onClick={() => setTerminalTab('output')}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: terminalTab === 'output' ? currentColors.accent : currentColors.textInactive,
              borderBottom: terminalTab === 'output' ? `2px solid ${currentColors.accent}` : 'none'
            }}
          >
            Output
          </button>
          <button
            onClick={() => setTerminalTab('error')}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: terminalTab === 'error' ? currentColors.accent : currentColors.textInactive,
              borderBottom: terminalTab === 'error' ? `2px solid ${currentColors.accent}` : 'none'
            }}
          >
            Errors
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 font-mono text-sm" style={{ backgroundColor: currentColors.mainBg }}>
          {terminalTab === 'terminal' && (
            <div>
              <pre className="whitespace-pre-wrap" style={{ color: currentColors.textMain }}>{terminalOutput}</pre>
              <div className="flex items-center gap-2 mt-2">
                <span style={{ color: currentColors.accent }}>$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={handleTerminalCommand}
                  className="flex-1 bg-transparent border-none outline-none"
                  style={{ color: currentColors.textMain }}
                  placeholder="Type command..."
                />
              </div>
            </div>
          )}
          {terminalTab === 'output' && (
            <pre className="whitespace-pre-wrap" style={{ color: currentColors.accent }}>{outputContent || 'No output yet'}</pre>
          )}
          {terminalTab === 'error' && (
            <pre className="whitespace-pre-wrap text-red-500">{errorContent || 'No errors'}</pre>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="border rounded-lg w-96 p-6 shadow-xl" style={{ backgroundColor: currentColors.mainBg, borderColor: currentColors.border }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: currentColors.textMain }}>Profile</h2>
              <button 
                onClick={() => setShowProfile(false)} 
                className="transition-colors"
                style={{ color: currentColors.textInactive }}
                onMouseEnter={(e) => e.target.style.color = currentColors.accent}
                onMouseLeave={(e) => e.target.style.color = currentColors.textInactive}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm" style={{ color: currentColors.textInactive }}>Name</label>
                <div className="mt-1 px-3 py-2 rounded" style={{ backgroundColor: currentColors.sidebarBg, color: currentColors.textMain }}>{user.name}</div>
              </div>
              
              <div>
                <label className="text-sm" style={{ color: currentColors.textInactive }}>Email</label>
                <div className="mt-1 px-3 py-2 rounded" style={{ backgroundColor: currentColors.sidebarBg, color: currentColors.textMain }}>{user.email}</div>
              </div>
              
              <div>
                <label className="text-sm" style={{ color: currentColors.textInactive }}>Files Created</label>
                <div className="mt-1 px-3 py-2 rounded" style={{ backgroundColor: currentColors.sidebarBg, color: currentColors.textMain }}>{user.filesCreated}</div>
              </div>
              
              <div>
                <label className="text-sm block mb-2" style={{ color: currentColors.textInactive }}>Theme</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleThemeChange('light')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors"
                    style={{ 
                      backgroundColor: theme === 'light' ? currentColors.accent : currentColors.sidebarBg, 
                      color: theme === 'light' ? 'white' : currentColors.textMain 
                    }}
                    onMouseEnter={(e) => {
                      if (theme !== 'light') e.target.style.backgroundColor = currentColors.activeHighlight;
                    }}
                    onMouseLeave={(e) => {
                      if (theme !== 'light') e.target.style.backgroundColor = currentColors.sidebarBg;
                    }}
                  >
                    <Sun size={16} />
                    Light
                  </button>
                  <button 
                    onClick={() => handleThemeChange('dark')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors"
                    style={{ 
                      backgroundColor: theme === 'dark' ? currentColors.accent : currentColors.sidebarBg, 
                      color: theme === 'dark' ? 'white' : currentColors.textMain 
                    }}
                    onMouseEnter={(e) => {
                      if (theme !== 'dark') e.target.style.backgroundColor = currentColors.activeHighlight;
                    }}
                    onMouseLeave={(e) => {
                      if (theme !== 'dark') e.target.style.backgroundColor = currentColors.sidebarBg;
                    }}
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                </div>
              </div>
              
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors font-medium mt-6 text-white"
                style={{ backgroundColor: currentColors.accent }}
                onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.accentHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
              >
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeIDE;