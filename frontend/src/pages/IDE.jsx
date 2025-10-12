import React, { useState } from 'react';
import { Play, Plus, FileCode, Moon, Sun, Terminal, X, Menu, Save, Users, Share2, Clock, Folder, Search, Settings, Code2, Layers, ChevronRight, ChevronDown } from 'lucide-react';
import { MonacoEditor } from '../components/Editor/MonacoEditor';
import { colors } from '../lib/utils';
import { runTheCode } from '../lib/codeExecute.js';
const IDE = () => {
  const [theme, setTheme] = useState('dark');
  const [files, setFiles] = useState([
    { id: 1, name: 'main.js', content: '// Write your JavaScript code here\nconsole.log("Hello World");', language: 'javascript', folder: 'src' },
    { id: 2, name: 'app.py', content: '# Write your Python code here\nprint("Hello World")', language: 'python', folder: 'src' },
    { id: 3, name: 'styles.css', content: '/* Add your styles */\nbody { margin: 0; }', language: 'css', folder: 'assets' },
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
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({ src: true, assets: true });



  const c = colors[theme];

  const getLanguageColor = (lang) => {
    const langColors = {
      javascript: theme === 'dark' ? '#F7DF1E' : '#D4B900',
      python: theme === 'dark' ? '#3776AB' : '#2D5F8D',
      css: theme === 'dark' ? '#264DE4' : '#1B3BA3',
      html: theme === 'dark' ? '#E34C26' : '#C73B1D',
      plaintext: c.textMuted
    };
    return langColors[lang] || c.textMuted;
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript', 'py': 'python', 'html': 'html',
      'cpp': 'cpp', 'c': 'c', 'java': 'java',
      'cs': 'csharp', 'css': 'css', 'json': 'json', 'md': 'markdown'
    };
    return langMap[ext] || 'plaintext';
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const newFile = {
        id: Date.now(),
        name: newFileName,
        content: '',
        language: getLanguageFromExtension(newFileName),
        folder: 'src'
      };
      setFiles([...files, newFile]);
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
    e?.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    if (activeFile?.id === fileId) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const handleRunCode = async() => {
    if (!activeFile) return;
    
    setOutputContent(`Running ${activeFile.name}...`);
    const input = terminalInputValue;
    const res = await runTheCode(activeFile.language, activeFile.content , input)
    setOutputContent(`${res.output}`);
    setErrorContent('');
    setTerminalTab('output');
    setTerminalVisible(true);
  };

  const handleEditorChange = (value) => {
    const updatedFile = { ...activeFile, content: value };
    setActiveFile(updatedFile);
    setFiles(files.map(f => f.id === activeFile.id ? updatedFile : f));
    setOpenFiles(openFiles.map(f => f.id === activeFile.id ? updatedFile : f));
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

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const groupedFiles = files.reduce((acc, file) => {
    const folder = file.folder || 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(file);
    return acc;
  }, {});

  return (
    <div className="flex h-screen w-full" style={{ backgroundColor: c.bg, color: c.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Sidebar */}
      <aside 
        className="flex flex-col border-r transition-all duration-300"
        style={{ 
          width: sidebarCollapsed ? '60px' : '280px',
          backgroundColor: c.sidebar,
          borderColor: c.border
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: c.border }}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Code2 size={24} style={{ color: c.accent }} />
              <span className="font-bold text-lg">IDE</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:opacity-70 transition-opacity"
            style={{ backgroundColor: c.bgTertiary }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        {!sidebarCollapsed && (
          <div className="p-3 space-y-2">
            <button
              onClick={() => setIsCreatingFile(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFFFFF' }}
            >
              <Plus size={16} />
              <span className="text-sm font-medium">New File</span>
            </button>
          </div>
        )}

        {/* File Explorer */}
        <div className="flex-1 overflow-y-auto p-2">
          {!sidebarCollapsed ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-xs font-semibold uppercase" style={{ color: c.textDim }}>
                Explorer
              </div>
              {Object.entries(groupedFiles).map(([folder, folderFiles]) => (
                <div key={folder}>
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:opacity-80 transition-opacity"
                    style={{ color: c.text }}
                  >
                    {expandedFolders[folder] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Folder size={16} style={{ color: c.accent }} />
                    <span className="text-sm font-medium">{folder}</span>
                  </button>
                  {expandedFolders[folder] && (
                    <div className="ml-6 space-y-0.5">
                      {folderFiles.map(file => (
                        <button
                          key={file.id}
                          onClick={() => handleFileClick(file)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all text-left"
                          style={{
                            backgroundColor: activeFile?.id === file.id ? c.activeTab : 'transparent',
                            color: activeFile?.id === file.id ? c.accent : c.text
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: getLanguageColor(file.language) }}
                          />
                          <span className="text-sm truncate">{file.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 mt-4">
              {files.slice(0, 5).map(file => (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="p-2 rounded transition-all"
                  style={{
                    backgroundColor: activeFile?.id === file.id ? c.activeTab : 'transparent',
                  }}
                  title={file.name}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getLanguageColor(file.language) }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t space-y-2" style={{ borderColor: c.border }}>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: c.bgTertiary, color: c.text }}
            >
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <header 
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ backgroundColor: c.bgSecondary, borderColor: c.border }}
        >
          <div className="flex items-center gap-4">
            {activeFile && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getLanguageColor(activeFile.language) }}
                />
                <span className="font-medium">{activeFile.name}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: c.bgTertiary, color: c.textMuted }}>
                  {activeFile.language}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: c.bgTertiary }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleRunCode}
              disabled={!activeFile}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFFFFF' }}
            >
              <Play size={16} />
              <span className="text-sm font-medium">Run</span>
            </button>

            <button
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{ backgroundColor: c.bgTertiary }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </header>

        {/* File Tabs */}
        {openFiles.length > 0 && (
          <div 
            className="flex items-center gap-1 px-4 py-2 overflow-x-auto border-b"
            style={{ backgroundColor: c.bgSecondary, borderColor: c.border }}
          >
            {openFiles.map(file => (
              <button
                key={file.id}
                onClick={() => setActiveFile(file)}
                className="flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all relative group"
                style={{
                  backgroundColor: activeFile?.id === file.id ? c.bg : 'transparent',
                  color: activeFile?.id === file.id ? c.accent : c.textMuted,
                  borderBottom: activeFile?.id === file.id ? `2px solid ${c.accent}` : 'none'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getLanguageColor(file.language) }}
                />
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={(e) => handleCloseFile(file.id, e)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:bg-opacity-20 rounded p-0.5"
                >
                  <X size={14} />
                </button>
              </button>
            ))}
          </div>
        )}

        {/* Editor Area */}
        <div 
          className="flex-1 overflow-hidden"
          style={{ backgroundColor: c.bg }}
        >
          {activeFile ? (
            <div className="h-full p-6">
              
                
              <MonacoEditor
              key={activeFile.id}
              value={activeFile.content}
              onChange={handleEditorChange}
              language={activeFile.language}
              theme={theme}
            />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FileCode size={64} className="mx-auto mb-4 opacity-30" style={{ color: c.textMuted }} />
                <p className="text-xl font-semibold mb-2" style={{ color: c.text }}>No File Open</p>
                <p className="text-sm mb-6" style={{ color: c.textMuted }}>Select a file or create a new one</p>
                <button
                  onClick={() => setIsCreatingFile(true)}
                  className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFFFFF' }}
                >
                  <Plus size={18} />
                  <span className="font-medium">New File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Terminal Panel */}
        {terminalVisible && (
          <div 
            className="border-t flex flex-col"
            style={{ 
              height: '280px',
              backgroundColor: c.bgSecondary,
              borderColor: c.border
            }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: c.border }}>
              <div className="flex items-center gap-1">
                {['terminal', 'output', 'error', 'input'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTerminalTab(tab)}
                    className="px-4 py-2 rounded-t-lg text-sm font-medium capitalize transition-all"
                    style={{
                      backgroundColor: terminalTab === tab ? c.bg : 'transparent',
                      color: terminalTab === tab ? c.accent : c.textMuted,
                      borderBottom: terminalTab === tab ? `2px solid ${c.accent}` : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setTerminalVisible(false)}
                className="p-1 rounded hover:opacity-70"
                style={{ color: c.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm" style={{ backgroundColor: c.bg }}>
              {terminalTab === 'terminal' && (
                <div>
                  <pre className="whitespace-pre-wrap mb-2" style={{ color: c.text }}>{terminalOutput}</pre>
                  <div className="flex items-center gap-2">
                    <span style={{ color: c.accent }}>$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyPress={handleTerminalCommand}
                      className="flex-1 bg-transparent border-none outline-none"
                      style={{ color: c.text }}
                      placeholder="Type command..."
                    />
                  </div>
                </div>
              )}
              {terminalTab === 'output' && (
                <pre className="whitespace-pre-wrap" style={{ color: c.success }}>{outputContent || 'No output yet'}</pre>
              )}
              {terminalTab === 'error' && (
                <pre className="whitespace-pre-wrap" style={{ color: c.error }}>{errorContent || 'No errors'}</pre>
              )}
              {terminalTab === 'input' && (
                <textarea
                  value={terminalInputValue}
                  onChange={(e) => setTerminalInputValue(e.target.value)}
                  className="w-full h-full p-3 rounded-lg border focus:outline-none resize-none"
                  style={{ 
                    backgroundColor: c.bgSecondary,
                    borderColor: c.border,
                    color: c.text
                  }}
                  placeholder="Enter program input..."
                />
              )}
            </div>
          </div>
        )}

        {!terminalVisible && (
          <button
            onClick={() => setTerminalVisible(true)}
            className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all hover:opacity-90"
            style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFFFFF' }}
          >
            <Terminal size={18} />
            <span className="text-sm font-medium">Show Terminal</span>
          </button>
        )}
      </div>

      {/* Create File Modal */}
      {isCreatingFile && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCreatingFile(false)}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl z-50"
            style={{ backgroundColor: c.bg, width: '400px', borderColor: c.border, border: `1px solid ${c.border}` }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: c.text }}>Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none mb-4"
              style={{ backgroundColor: c.bgSecondary, borderColor: c.border, color: c.text }}
              placeholder="filename.js"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsCreatingFile(false)}
                className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: c.bgTertiary, color: c.text }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFFFFF' }}
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IDE;