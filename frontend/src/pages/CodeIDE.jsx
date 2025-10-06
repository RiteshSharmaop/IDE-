import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, FileCode, Moon, Sun, Terminal, X, Menu, Save, Users, Share2, Clock } from 'lucide-react';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { MonacoEditor } from '../components/Editor/MonacoEditor';
import { FileIcon } from '../components/FileIcon';





const CodeIDE = () => {
  const [theme, setTheme] = useState('dark');
  const [files, setFiles] = useState([
    { id: 1, name: 'main.js', content: '// Write your JavaScript code here\nconsole.log("Hello World");', language: 'javascript' },
    { id: 2, name: 'app.py', content: '# Write your Python code here\nprint("Hello World")', language: 'python' },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    filesCreated: files.length
  });

  const [connectedUsers] = useState([
    { name: 'Alice Smith', avatar: '', color: '#10A37F' },
    { name: 'Bob Johnson', avatar: '', color: '#FF6B6B' },
    { name: 'Carol White', avatar: '', color: '#4ECDC4' },
  ]);

  const bgColor = theme === 'dark' ? '#171717' : '#FFFFFF';
  const secondaryBg = theme === 'dark' ? '#212121' : '#F5F5F5';
  const borderColor = theme === 'dark' ? '#3E3F3E' : '#E0E0E0';
  const textColor = theme === 'dark' ? '#D0D0D0' : '#1A1A1A';
  const mutedText = theme === 'dark' ? '#3E3F3E' : '#9CA3AF';

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
    
    if (activeFile?.id === fileId) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setActiveFile(null);
      }
    }
  };

  const handleEditorChange = (value) => {
    const updatedFile = { ...activeFile, content: value };
    setActiveFile(updatedFile);
    setFiles(files.map(f => f.id === activeFile.id ? updatedFile : f));
    setOpenFiles(openFiles.map(f => f.id === activeFile.id ? updatedFile : f));
  };

  const handleRunCode = () => {
    if (!activeFile) return;
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full" style={{ backgroundColor: bgColor }}>
        <AppSidebar
          files={files}
          activeFile={activeFile}
          onFileClick={handleFileClick}
          isCreatingFile={isCreatingFile}
          setIsCreatingFile={setIsCreatingFile}
          newFileName={newFileName}
          setNewFileName={setNewFileName}
          handleCreateFile={handleCreateFile}
          user={user}
          theme={theme}
          onThemeChange={setTheme}
          connectedUsers={connectedUsers}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b px-4" style={{ borderColor, backgroundColor: bgColor }}>
            <div className="flex items-center gap-3">
              <SidebarTrigger style={{ color: textColor }} className="hover:bg-opacity-10" />
              <h1 className="text-lg font-semibold" style={{ color: textColor }}>Code Editor</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: menuOpen ? '#F59E0B' : secondaryBg, 
                    color: menuOpen ? '#FFFFFF' : textColor,
                  }}
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </button>
                
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setMenuOpen(false)}
                    />
                    <div 
                      className="absolute right-0 mt-2 w-64 rounded-lg border shadow-lg z-20 overflow-hidden"
                      style={{ backgroundColor: bgColor, borderColor }}
                    >
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          alert('File saved!');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-amber-500 hover:text-white"
                        style={{ color: textColor }}
                      >
                        <Save className="h-4 w-4" />
                        <span className="font-medium">Save File</span>
                      </button>
                      
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-amber-500 hover:text-white"
                        style={{ color: textColor }}
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Collaborate</span>
                      </button>
                      
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-amber-500 hover:text-white"
                        style={{ color: textColor }}
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="font-medium">Publish</span>
                      </button>
                      
                      <div className="border-t" style={{ borderColor }} />
                      
                      <div
                        className="flex items-center justify-between w-full px-4 py-3"
                        style={{ color: textColor }}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-sm">Auto Save</span>
                        </div>
                        <button
                          onClick={() => setAutoSave(!autoSave)}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                          style={{ backgroundColor: autoSave ? '#F59E0B' : mutedText }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              autoSave ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                disabled={!activeFile}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: secondaryBg, 
                  color: textColor,
                }}
              >
                <Terminal className="h-4 w-4" />
                {terminalOpen ? 'Hide' : 'Show'} Terminal
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: secondaryBg, 
                  color: textColor,
                }}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              
              <button
                onClick={handleRunCode}
                disabled={!activeFile}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                Run Code
              </button>
            </div>
          </header>

          {openFiles.length > 0 && (
            <div className="flex items-center border-b overflow-x-auto" style={{ borderColor, backgroundColor: bgColor }}>
              {openFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => setActiveFile(file)}
                  className="flex items-center gap-2 border-r px-4 py-2.5 cursor-pointer transition-colors group"
                  style={{
                    borderColor,
                    backgroundColor: activeFile?.id === file.id ? secondaryBg : bgColor,
                    color: activeFile?.id === file.id ? '#F59E0B' : textColor,
                    borderBottom: activeFile?.id === file.id ? '2px solid #F59E0B' : 'none'
                  }}
                >
                  <FileIcon language={file.language} size="small" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <button
                    onClick={(e) => handleCloseFile(file.id, e)}
                    className="ml-2 transition-all hover:scale-125"
                    style={{ color: mutedText }}
                  >
                    <X className="h-4 w-4 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden" style={{ backgroundColor: bgColor }}>
            {activeFile ? (
              <MonacoEditor
                key={activeFile.id}
                value={activeFile.content}
                onChange={handleEditorChange}
                language={activeFile.language}
                theme={theme}
              />
            ) : (
              <div className="flex h-full items-center justify-center" style={{ color: mutedText }}>
                <div className="text-center">
                  <FileCode size={64} className="mx-auto mb-6 opacity-30" style={{ color: textColor }} />
                  <p className="text-xl font-semibold mb-3" style={{ color: textColor }}>No File Open</p>
                  <p className="text-sm mb-6" style={{ color: mutedText }}>Create a new file or open an existing one to start coding</p>
                  <button
                    onClick={() => setIsCreatingFile(true)}
                    className="flex items-center gap-2 mx-auto rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/50"
                  >
                    <Plus className="h-5 w-5" />
                    Create New File
                  </button>
                </div>
              </div>
            )}
          </div>

          {terminalOpen && activeFile && (
            <div className="h-64 border-t flex flex-col" style={{ borderColor, backgroundColor: bgColor }}>
              <div className="flex items-center justify-between border-b" style={{ borderColor, backgroundColor: bgColor }}>
                <div className="flex items-center">
                  {['terminal', 'output', 'error', 'input'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTerminalTab(tab)}
                      className="px-4 py-2.5 text-sm font-medium capitalize transition-colors"
                      style={{
                        borderBottom: terminalTab === tab ? '2px solid #F59E0B' : 'none',
                        color: terminalTab === tab ? '#F59E0B' : mutedText,
                        backgroundColor: terminalTab === tab ? secondaryBg : 'transparent'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="p-2 mr-2 rounded transition-all hover:scale-125"
                  style={{ color: mutedText }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm" style={{ backgroundColor: bgColor }}>
                {terminalTab === 'terminal' && (
                  <div>
                    <pre className="whitespace-pre-wrap" style={{ color: textColor }}>{terminalOutput}</pre>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-amber-500 font-bold">$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyPress={handleTerminalCommand}
                        className="flex-1 bg-transparent border-none outline-none"
                        style={{ color: textColor }}
                        placeholder="Type command..."
                      />
                    </div>
                  </div>
                )}
                {terminalTab === 'output' && (
                  <pre className="whitespace-pre-wrap text-amber-500">{outputContent || 'No output yet'}</pre>
                )}
                {terminalTab === 'error' && (
                  <pre className="whitespace-pre-wrap text-red-400">{errorContent || 'No errors'}</pre>
                )}
                {terminalTab === 'input' && (
                  <div>
                    <div className="mb-2 font-medium" style={{ color: mutedText }}>Program Input:</div>
                    <textarea
                      value={terminalInputValue}
                      onChange={(e) => setTerminalInputValue(e.target.value)}
                      className="w-full h-40 p-3 rounded-lg font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500"
                      style={{ 
                        backgroundColor: secondaryBg,
                        borderColor,
                        color: textColor
                      }}
                      placeholder="Enter program input here..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CodeIDE;