import React, { useState, useRef, useEffect } from 'react';
import { Play, User, Menu, X, Plus, FileCode, Settings, Moon, Sun, PanelLeft, PanelLeftClose, ChevronRight } from 'lucide-react';

// Monaco Editor Component
const MonacoEditor = ({ value, onChange, language, theme }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  useEffect(() => {
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

// File Icon Component
const FileIcon = ({ language }) => {
  const iconProps = { size: 20 };
  
  const iconMap = {
    javascript: { color: '#F7DF1E', icon: '●' },
    python: { color: '#3776AB', icon: '●' },
    html: { color: '#E34F26', icon: '●' },
    css: { color: '#1572B6', icon: '●' },
    cpp: { color: '#00599C', icon: '●' },
    c: { color: '#A8B9CC', icon: '●' },
    java: { color: '#007396', icon: '●' },
    csharp: { color: '#239120', icon: '●' },
    json: { color: '#FFFFFF', icon: '{}' },
    markdown: { color: '#FFFFFF', icon: 'M' }
  };
  
  const config = iconMap[language] || { color: '#FFFFFF', icon: '●' };
  
  return (
    <div style={{ color: config.color, fontSize: '16px', fontWeight: 'bold' }}>
      {config.icon}
    </div>
  );
};

const CodeIDE = () => {
  const [theme, setTheme] = useState('dark');
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
  const [terminalInputValue, setTerminalInputValue] = useState('');
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    theme: 'dark',
    filesCreated: files.length
  });

  const colors = {
    light: {
      mainBg: '#FFFFFF',
      sidebarBg: '#F7F7F8',
      textInactive: '#6E6E80',
      activeHighlight: '#E5E7EB',
      textMain: '#202123',
      accent: '#10A37F',
      accentHover: '#0d8a6c',
      border: '#e5e7eb',
      secondary: '#9CA3AF'
    },
    dark: {
      mainBg: '#171717',
      sidebarBg: '#171717',
      textInactive: '#D1D5DB',
      activeHighlight: '#444654',
      textMain: '#ECECF1',
      accent: '#10A37F',
      accentHover: '#0d8a6c',
      border: '#444654',
      hover: '#2A2B32',
      secondary: '#9CA3AF'
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
    setTerminalOpen(true);
  };

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput;
      setTerminalOutput(prev => prev + `$ ${cmd}\n`);
      
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
    <div className="flex h-screen" style={{ backgroundColor: currentColors.mainBg, color: currentColors.textMain }}>
      {/* Collapsed Sidebar - Icon Bar */}
      {!sidebarOpen && (
        <div className="w-12 border-r flex flex-col items-center py-2 gap-2" style={{ backgroundColor: currentColors.sidebarBg, borderColor: currentColors.border }}>
          {files.map(file => (
            <button
              key={file.id}
              onClick={() => handleFileClick(file)}
              className="w-10 h-10 flex items-center justify-center rounded transition-colors"
              style={{
                backgroundColor: activeFile.id === file.id ? currentColors.activeHighlight : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (activeFile.id !== file.id) {
                  e.currentTarget.style.backgroundColor = currentColors.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (activeFile.id !== file.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={file.name}
            >
              <FileIcon language={file.language} />
            </button>
          ))}
        </div>
      )}

      {/* Full Sidebar */}
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
                    e.currentTarget.style.backgroundColor = currentColors.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFile.id !== file.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <FileIcon language={file.language} />
                <span className="text-sm truncate">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Toggle Button - Between Sidebar and Navbar */}
      <div className="flex flex-col" style={{ width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 3rem)' }}>
        {/* Toggle Button Area */}
        <div className="relative" style={{ height: '48px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute  top-1/2 transform -translate-y-1/2 p-1.5 rounded transition-colors z-10"
            style={{ 
              backgroundColor: currentColors.sidebarBg,
              color: currentColors.textInactive,
              border: `1px solid ${currentColors.border}`,
              left:-10
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = currentColors.activeHighlight;
              e.target.style.color = currentColors.accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = currentColors.sidebarBg;
              e.target.style.color = currentColors.textInactive;
            }}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          {/* Navbar */}
          <div className="h-full flex items-center justify-between px-4 border-b shadow-sm" style={{ backgroundColor: currentColors.sidebarBg, borderColor: currentColors.border, paddingLeft: '3rem' }}>
            <h1 className="text-xl font-semibold" style={{ color: currentColors.textMain }}>Code IDE</h1>
            
            <div className="flex items-center gap-3">
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
                className="p-2 rounded transition-colors"
                style={{ color: currentColors.textMain }}
                onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.activeHighlight}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <User size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                        e.currentTarget.style.backgroundColor = currentColors.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeFile.id !== file.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <FileIcon language={file.language} />
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

          {/* Terminal */}
          {terminalOpen && (
            <div className="h-64 border-t flex flex-col" style={{ backgroundColor: currentColors.sidebarBg, borderColor: currentColors.border }}>
              <div className="flex items-center justify-between border-b" style={{ backgroundColor: currentColors.mainBg, borderColor: currentColors.border }}>
                <div className="flex items-center">
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
                  <button
                    onClick={() => setTerminalTab('input')}
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      color: terminalTab === 'input' ? currentColors.accent : currentColors.textInactive,
                      borderBottom: terminalTab === 'input' ? `2px solid ${currentColors.accent}` : 'none'
                    }}
                  >
                    Input
                  </button>
                </div>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="p-2 mr-2 rounded transition-colors"
                  style={{ color: currentColors.textInactive }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.activeHighlight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <X size={18} />
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
                {terminalTab === 'input' && (
                  <div>
                    <div className="mb-2" style={{ color: currentColors.textInactive }}>Program Input:</div>
                    <textarea
                      value={terminalInputValue}
                      onChange={(e) => setTerminalInputValue(e.target.value)}
                      className="w-full h-40 p-2 rounded font-mono text-sm focus:outline-none"
                      style={{ 
                        backgroundColor: currentColors.sidebarBg,
                        border: `1px solid ${currentColors.border}`,
                        color: currentColors.textMain
                      }}
                      placeholder="Enter program input here..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Side Panel */}
      {showProfile && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowProfile(false)}
          />
          <div 
            className="fixed right-0 top-0 h-full w-80 border-l shadow-2xl z-50 flex flex-col"
            style={{ backgroundColor: currentColors.mainBg, borderColor: currentColors.border }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: currentColors.border }}>
              <h2 className="text-lg font-semibold" style={{ color: currentColors.textMain }}>Profile & Settings</h2>
              <button 
                onClick={() => setShowProfile(false)} 
                className="p-1 rounded transition-colors"
                style={{ color: currentColors.textInactive }}
                onMouseEnter={(e) => {
                  e.target.style.color = currentColors.accent;
                  e.target.style.backgroundColor = currentColors.activeHighlight;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentColors.textInactive;
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: currentColors.sidebarBg }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: currentColors.accent }}>
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-medium" style={{ color: currentColors.textMain }}>{user.name}</div>
                  <div className="text-sm" style={{ color: currentColors.secondary }}>{user.email}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase font-semibold" style={{ color: currentColors.secondary }}>Account Info</div>
                
                <div className="p-3 rounded" style={{ backgroundColor: currentColors.sidebarBg }}>
                  <div className="text-xs mb-1" style={{ color: currentColors.secondary }}>Name</div>
                  <div className="text-sm" style={{ color: currentColors.textMain }}>{user.name}</div>
                </div>
                
                <div className="p-3 rounded" style={{ backgroundColor: currentColors.sidebarBg }}>
                  <div className="text-xs mb-1" style={{ color: currentColors.secondary }}>Email</div>
                  <div className="text-sm" style={{ color: currentColors.textMain }}>{user.email}</div>
                </div>
                
                <div className="p-3 rounded" style={{ backgroundColor: currentColors.sidebarBg }}>
                  <div className="text-xs mb-1" style={{ color: currentColors.secondary }}>Files Created</div>
                  <div className="text-sm font-medium" style={{ color: currentColors.accent }}>{user.filesCreated}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-xs uppercase font-semibold" style={{ color: currentColors.secondary }}>Appearance</div>
                
                <div className="p-3 rounded" style={{ backgroundColor: currentColors.sidebarBg }}>
                  <div className="text-xs mb-2" style={{ color: currentColors.secondary }}>Theme</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleThemeChange('light')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors text-sm"
                      style={{ 
                        backgroundColor: theme === 'light' ? currentColors.accent : currentColors.mainBg, 
                        color: theme === 'light' ? 'white' : currentColors.textMain,
                        border: `1px solid ${currentColors.border}`
                      }}
                    >
                      <Sun size={14} />
                      Light
                    </button>
                    <button 
                      onClick={() => handleThemeChange('dark')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors text-sm"
                      style={{ 
                        backgroundColor: theme === 'dark' ? currentColors.accent : currentColors.mainBg, 
                        color: theme === 'dark' ? 'white' : currentColors.textMain,
                        border: `1px solid ${currentColors.border}`
                      }}
                    >
                      <Moon size={14} />
                      Dark
                    </button>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded transition-colors font-medium text-white"
                style={{ backgroundColor: currentColors.accent }}
                onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.accentHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
              >
                <Settings size={18} />
                Advanced Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CodeIDE;