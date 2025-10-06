import React, { useState, useRef, useEffect } from 'react';
import { Play, User, Plus, FileCode, Settings, Moon, Sun, ChevronDown, Bell, CreditCard, LogOut, Palette, Zap, Terminal, X } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
            fontSize: 16,
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

const FileIcon = ({ language, size = 'normal' }) => {
  const iconMap = {
    javascript: { color: '#F7DF1E', text: 'JS' },
    python: { color: '#3776AB', text: 'PY' },
    cpp: { color: '#00599C', text: 'C++' },
    c: { color: '#A8B9CC', text: 'C' },
    java: { color: '#007396', text: 'JAVA' },
    csharp: { color: '#239120', text: 'C#' },
    json: { color: '#D0D0D0', text: 'JSON' },
    markdown: { color: '#D0D0D0', text: 'MD' }
  };
  
  const config = iconMap[language] || { color: '#D0D0D0', text: 'FILE' };
  const sizeClass = size === 'small' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]';
  
  return (
    <div 
      className={`${sizeClass} rounded flex items-center justify-center font-bold`}
      style={{ backgroundColor: config.color + '20', color: config.color, border: `1px solid ${config.color}` }}
    >
      {config.text}
    </div>
  );
};

const AppSidebar = ({ 
  files, 
  activeFile, 
  onFileClick, 
  isCreatingFile, 
  setIsCreatingFile,
  newFileName,
  setNewFileName,
  handleCreateFile,
  user,
  theme,
  onThemeChange,
  connectedUsers
}) => {
  return (
    <Sidebar className="border-r border-[#3E3F3E]">
      <SidebarHeader className="border-b border-[#3E3F3E] bg-[#171717]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="w-full hover:bg-[#212121]">
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                  <FileCode className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-[#D0D0D0]">Code IDE</span>
                  <span className="text-xs text-[#3E3F3E]">Professional Edition</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-[#171717]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#3E3F3E] text-xs font-semibold uppercase">Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsCreatingFile(true)}
                  className="hover:bg-[#212121] text-[#D0D0D0]"
                >
                  <Plus className="h-4 w-4" />
                  <span>New File</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isCreatingFile && (
                <SidebarMenuItem>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                    onBlur={() => newFileName ? handleCreateFile() : setIsCreatingFile(false)}
                    placeholder="filename.ext"
                    className="w-full rounded-md border border-[#3E3F3E] bg-[#212121] px-2 py-1.5 text-sm text-[#D0D0D0] placeholder:text-[#3E3F3E] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </SidebarMenuItem>
              )}

              {files.map(file => (
                <SidebarMenuItem key={file.id}>
                  <SidebarMenuButton 
                    onClick={() => onFileClick(file)}
                    isActive={activeFile?.id === file.id}
                    className="hover:bg-[#212121] text-[#D0D0D0] data-[active=true]:bg-[#212121] data-[active=true]:text-amber-500"
                  >
                    <FileIcon language={file.language} size="small" />
                    <span>{file.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#3E3F3E] bg-[#171717]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#3E3F3E] text-xs font-semibold uppercase">Connected Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 px-2 py-2">
              {connectedUsers.map((connectedUser, index) => (
                <Avatar key={index} className="h-8 w-8 border-2" style={{ borderColor: connectedUser.color }}>
                  <AvatarImage src={connectedUser.avatar} alt={connectedUser.name} />
                  <AvatarFallback style={{ backgroundColor: connectedUser.color }} className="text-xs font-semibold text-white">
                    {connectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:bg-[#212121] data-[state=open]:bg-[#212121] group">
                  <Avatar className="h-8 w-8 border-2 border-[#3E3F3E]">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none flex-1 text-left">
                    <span className="font-medium text-sm text-[#D0D0D0] group-hover:text-[#FFFFFF] transition-colors">{user.name}</span>
                    <span className="text-xs text-[#3E3F3E]">{user.email}</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-[#3E3F3E]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="end"
                className="w-72 bg-[#171717] border-[#3E3F3E] text-[#D0D0D0]"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-12 w-12 border-2 border-[#3E3F3E]">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#D0D0D0]">{user.name}</span>
                      <span className="text-xs text-[#3E3F3E]">{user.email}</span>
                      <span className="text-xs text-amber-500 font-medium">Free Plan</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-[#3E3F3E]" />
                
                <DropdownMenuItem className="gap-3 py-3 focus:bg-[#212121] focus:text-amber-500 cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Upgrade to Pro</span>
                    <span className="text-xs text-[#3E3F3E]">Unlock all features</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[#3E3F3E]" />
                
                <DropdownMenuItem className="gap-3 focus:bg-[#212121] focus:text-[#D0D0D0] cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-3 focus:bg-[#212121] focus:text-[#D0D0D0] cursor-pointer">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-3 focus:bg-[#212121] focus:text-[#D0D0D0] cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[#3E3F3E]" />
                
                <DropdownMenuItem className="gap-3 focus:bg-red-950 focus:text-red-400 cursor-pointer text-red-400">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

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
              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/50"
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
                    backgroundColor: activeFile.id === file.id ? secondaryBg : bgColor,
                    color: activeFile.id === file.id ? '#F59E0B' : textColor,
                    borderBottom: activeFile.id === file.id ? '2px solid #F59E0B' : 'none'
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
                value={activeFile.content}
                onChange={handleEditorChange}
                language={activeFile.language}
                theme={theme}
              />
            ) : (
              <div className="flex h-full items-center justify-center" style={{ color: mutedText }}>
                <div className="text-center">
                  <FileCode size={48} className="mx-auto mb-4 opacity-50" />
                  <p style={{ color: textColor }}>No file open</p>
                  <p className="text-sm mt-2">Create or select a file to start coding</p>
                </div>
              </div>
            )}
          </div>

          {terminalOpen && (
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