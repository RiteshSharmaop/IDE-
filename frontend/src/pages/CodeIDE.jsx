import React, { useEffect, useState } from "react";
import {
  Play,
  Plus,
  FileCode,
  Moon,
  Copy,
  Check,
  Sun,
  Terminal,
  X,
  Menu,
  Save,
  Users,
  Share2,
  Clock,
  Folder,
  Search,
  Settings,
  Code2,
  Layers,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Bell,
  CreditCard,
  Zap,
  Cloud,
  Brain,
  Trash2,
} from "lucide-react";

import { MonacoEditor } from "../components/Editor/MonacoEditor";
import { runTheCode } from "../lib/codeExecute";
import { useAuth } from "../lib/auth";
import { useSocket } from "../context/SocketContext";
import { Link, useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import { useRef } from "react";
import AIAssistantSidebar from "../components/AiAssistantSidebar";
import { Empty } from "../components/ui/empty";
import ShareDialog from "../components/ShareDialog";
import CheckboxInTable from "../components/CheckboxInTable";

const CodeIDE = () => {
  const [theme, setTheme] = useState("dark");
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "main.js",
      content:
        '// Write your JavaScript code here\nconsole.log("Hello World");',
      language: "javascript",
      folder: "src",
    },
    {
      id: 2,
      name: "app.py",
      content: '# Write your Python code here\nprint("Hello World")',
      language: "python",
      folder: "src",
    },
    {
      id: 3,
      name: "main.cpp",
      content:
        '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Print Hello World\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
      language: "cpp",
      folder: "dsa",
    },
  ]);
  const [activeFile, setActiveFile] = useState(files[0]);
  const [openFiles, setOpenFiles] = useState([files[0]]);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("src");
  const [terminalTab, setTerminalTab] = useState("terminal");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState(
    "Welcome to Code IDE Terminal\n"
  );
  const [outputContent, setOutputContent] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [terminalInputValue, setTerminalInputValue] = useState("");
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    src: true,
    dsa: true,
  });
  const [folders, setFolders] = useState(["src", "dsa"]); // Track all folders
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  // Mock user data
  // const user = {
  //   username: 'JohnDoe',
  //   email: 'john.doe@example.com',
  //   avatar: '',
  //   plan: 'Free'
  // };
  const { user, signout } = useAuth();

  //  Track if the change is from remote user to prevent echo
  const isRemoteChange = useRef(false);

  // Debounce timer for code changes
  const debounceTimer = useRef(null);

  // Sophisticated Color Palette
  const colors = {
    dark: {
      bg: "#1E1E1E",
      bgSecondary: "#252526",
      bgTertiary: "#2D2D2D",
      sidebar: "#1A1A1A",
      border: "#3E3E42",
      text: "#E0E0E0",
      textMuted: "#9CA3AF",
      textDim: "#6B7280",
      accent: "#B0C4DE",
      accentHover: "#C0D0E8",
      success: "#A9B7B7",
      error: "#D2B48C",
      activeTab: "#37373D",
    },
    light: {
      bg: "#FFFFFF",
      bgSecondary: "#F8F8F8",
      bgTertiary: "#F0F0F0",
      sidebar: "#F5F5F5",
      border: "#E0E0E0",
      text: "#2D2D2D",
      textMuted: "#6B7280",
      textDim: "#9CA3AF",
      accent: "#36454F",
      accentHover: "#4B5A68",
      success: "#8A9A9A",
      error: "#8B7355",
      activeTab: "#E8E8E8",
    },
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        ...notification,
      },
      ...prev,
    ]);
  };

  const c = colors[theme];

  const getLanguageColor = (lang) => {
    const langColors = {
      javascript: theme === "dark" ? "#F7DF1E" : "#D4B900",
      python: theme === "dark" ? "#3776AB" : "#2D5F8D",
      css: theme === "dark" ? "#264DE4" : "#1B3BA3",
      html: theme === "dark" ? "#E34C26" : "#C73B1D",
      plaintext: c.textMuted,
    };
    return langColors[lang] || c.textMuted;
  };

  const { socket, socketId } = useSocket();

  const { roomId, setRoomId } = useRoom();

  useEffect(() => {
    if (!socket.id) {
      navigate("/");
    }
    //console.log("IDE SocketID : ", socketId);
    return () => socket.off("receiveMessage");
  }, [socket, socketId]);

  useEffect(() => {
    if (!socket) return;

    const savedRoomId = localStorage.getItem("roomId");

    // If socket is connected but page refreshed, rejoin the room
    if (savedRoomId && socket.connected) {
      socket.emit("joinRoom", { roomId: savedRoomId, username: user.username });
      setRoomId(savedRoomId);
      //console.log("♻️ Rejoined existing room:", savedRoomId);
    }

    // If socket reconnects (for example, after refresh)
    socket.on("connect", () => {
      const rejoinId = localStorage.getItem("roomId");
      if (rejoinId) {
        socket.emit("joinRoom", { roomId: rejoinId, username: user.username });
        setRoomId(rejoinId);
        //console.log("🔁 Rejoined room after reconnect:", rejoinId);
      }
    });

    socket.on("joinedRoom", ({ roomId }) => {
      //console.log(`✅ Joined room ${roomId}`);
    });

    socket.on("someoneJoined", ({ username }) => {
      console.log(`✅ SomeJoined room ${username}`);
      addNotification({
        type: "USER_JOINED",
        title: "User Joined",
        username,
        status: "Active",
      });
    });

    socket.on("fileSetActive", ({ fileId }) => {
      setActiveFile(files[fileId - 1]);
      // //console.log("doping active : " ,fileId );
    });

    socket.on("fileClosed", handleFileClosed);

    socket.on("fileChanged", handleFileChanged);

    // Listen for file creation from other users
    socket.on("fileCreated", ({ file }) => {
      //console.log("📄 File created by another user:", file);
      setFiles((prev) => {
        if (prev.some((f) => f.id === file.id)) return prev;
        return [...prev, file];
      });
      setActiveFile(file);
      setOpenFiles((prev) => {
        if (prev.some((f) => f.id === file.id)) {
          return prev;
        }
        return [...prev, file];
      });
      addNotification({
        type: "FILE_CREATED",
        title: `File Created: ${file.name}`,
        username: "Someone",
        status: "Active",
      });
    });

    // Listen for folder creation from other users
    socket.on("folderCreated", ({ folderName }) => {
      //console.log("📁 Folder created by another user:", folderName);
      setFolders((prev) => {
        if (prev.includes(folderName)) return prev;
        return [...prev, folderName];
      });
      setExpandedFolders((prev) => ({
        ...prev,
        [folderName]: true,
      }));
      addNotification({
        type: "FOLDER_CREATED",
        title: `Folder Created: ${folderName}`,
        username: "Someone",
        status: "Active",
      });
    });

    // Listen for file deletion
    socket.on("fileDeleted", ({ fileId }) => {
      //console.log("🗑️ File deleted by another user:", fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (activeFile?.id === fileId) {
        setActiveFile(null);
      }
    });

    // Listen for code execution from other users
    socket.on("codeExecuted", ({ fileName, output, error }) => {
      //console.log("▶️ Code executed by another user:", fileName);
      setOutputContent(output);
      if (error) {
        setErrorContent(error);
      }
      setTerminalTab("output");
      setTerminalVisible(true);
    });

    // 🔥🔥🔥 REAL-TIME CODE SYNCHRONIZATION EVENT 🔥🔥🔥
    socket.on(
      "codeChanged",
      ({ fileId, content, username, socketId: remoteSocketId }) => {
        //console.log(`📝 Code changed in file ${fileId} by ${username}`);

        // Set flag to prevent echo (don't emit this change back)
        isRemoteChange.current = true;

        // Update the file content in files array
        setFiles((prevFiles) =>
          prevFiles.map((f) => (f.id === fileId ? { ...f, content } : f))
        );

        // Update open files
        setOpenFiles((prevOpen) =>
          prevOpen.map((f) => (f.id === fileId ? { ...f, content } : f))
        );

        // Update active file if it's the one being edited
        setActiveFile((prevActive) => {
          if (prevActive?.id === fileId) {
            return { ...prevActive, content };
          }
          return prevActive;
        });

        // Reset flag after update completes
        setTimeout(() => {
          isRemoteChange.current = false;
        }, 100);
      }
    );

    socket.on("userLeft", ({ username }) => {
      addNotification({
        type: "USER_LEFT",
        title: "User Left",
        username,
        status: "Inactive",
      });
    });

    return () => {
      socket.off("joinedRoom");
      socket.off("someoneJoined");
      socket.off("fileChanged");
      socket.off("connect");
      socket.off("fileCreated");
      socket.off("folderCreated");
      socket.off("codeExecuted");
      socket.off("fileDeleted");
    };
  }, [socket]);

  const handleFileClosed = ({ fileId }) => {
    //console.log("File closed by another user:", fileId);
    setOpenFiles((prevFiles) => {
      const newFiles = prevFiles.filter((f) => f.id !== fileId);

      // If the active file was closed, switch to the last open file or null
      setActiveFile((prevActive) => {
        if (prevActive?.id === fileId) {
          return newFiles.length > 0 ? newFiles[newFiles.length - 1] : null;
        }
        return prevActive;
      });

      return newFiles;
    });
  };

  const handleFileChanged = ({ fileId, editorId }) => {
    const changedFile = files.find((f) => f.id === fileId);

    if (!changedFile) return;

    setActiveFile(changedFile);

    // Only add to openFiles if not already there
    setOpenFiles((prev) => {
      if (prev.some((f) => f.id === fileId)) {
        return prev; // Already open, don't add again
      }
      return [...prev, changedFile];
    });
  };

  // const handleCreateFile = () => {
  //   if (newFileName.trim()) {
  //     const newFile = {
  //       id: Date.now(),
  //       name: newFileName,
  //       content: '',
  //       language: getLanguageFromExtension(newFileName),
  //       folder: selectedFolder
  //     };

  //     setFiles((prevFiles) => {
  //       // Check if file already exists
  //       const alreadyExists = prevFiles.some(
  //         (f) => f.name === newFileName && f.folder === selectedFolder
  //       );

  //       if (alreadyExists) {
  //         console.warn('File already exists:', newFileName);
  //         return prevFiles;
  //       }

  //       return [...prevFiles, newFile];
  //     });

  //     // Use a separate batch to update dependent state
  //     setOpenFiles((prev) => {
  //       // Double-check it's not already in openFiles
  //       if (prev.some((f) => f.id === newFile.id)) {
  //         return prev;
  //       }
  //       return [...prev, newFile];
  //     });

  //     setActiveFile(newFile);
  //     setExpandedFolders((prev) => ({
  //       ...prev,
  //       [selectedFolder]: true,
  //     }));

  //     setNewFileName('');
  //     setIsCreatingFile(false);
  //   }
  // };

  const handleFileClick = (file) => {
    // Emit socket event for real-time sync
    socket.emit("fileChange", file.id, roomId);

    // Immediately update local state
    setActiveFile(file);

    // Add to open files if not already there
    setOpenFiles((prev) => {
      if (prev.some((f) => f.id === file.id)) {
        return prev;
      }
      return [...prev, file];
    });
  };

  useEffect(() => {
    // Remove any duplicate files from openFiles
    setOpenFiles((prev) => {
      const seen = new Set();
      const unique = prev.filter((file) => {
        if (seen.has(file.id)) {
          console.warn("Duplicate file detected and removed:", file.id);
          return false;
        }
        seen.add(file.id);
        return true;
      });
      return unique.length === prev.length ? prev : unique;
    });
  }, [files]);

  // 🔥🔥🔥 REAL-TIME CODE CHANGE HANDLER 🔥🔥🔥
  const handleEditorChange = (value) => {
    // Don't emit if this change came from a remote user
    if (isRemoteChange.current) {
      //console.log("⏭️ Skipping emit - change from remote user");
      return;
    }

    // Update local state immediately
    const updatedFile = { ...activeFile, content: value };
    setActiveFile(updatedFile);
    setFiles(files.map((f) => (f.id === activeFile.id ? updatedFile : f)));
    setOpenFiles(
      openFiles.map((f) => (f.id === activeFile.id ? updatedFile : f))
    );

    // Debounce socket emission to avoid too many events
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      //console.log("📤 Emitting code change to room");
      // Emit code change to other users in the room
      socket.emit("codeChange", {
        fileId: activeFile.id,
        content: value,
        roomId: roomId,
      });
    }, 300); // 300ms debounce - adjust as needed
  };

  // .................................................................................
  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const newFile = {
        id: Date.now(),
        name: newFileName,
        content: "",
        language: getLanguageFromExtension(newFileName),
        folder: selectedFolder,
      };

      setFiles((prevFiles) => {
        const alreadyExists = prevFiles.some(
          (f) => f.name === newFileName && f.folder === selectedFolder
        );

        if (alreadyExists) {
          console.warn("File already exists:", newFileName);
          return prevFiles;
        }

        return [...prevFiles, newFile];
      });

      setOpenFiles((prev) => {
        if (prev.some((f) => f.id === newFile.id)) {
          return prev;
        }
        return [...prev, newFile];
      });

      setActiveFile(newFile);
      setExpandedFolders((prev) => ({
        ...prev,
        [selectedFolder]: true,
      }));

      // ✅ EMIT FILE CREATION EVENT TO OTHER USERS
      socket.emit("createFile", {
        file: newFile,
        roomId: roomId,
        username: user.username,
      });

      setNewFileName("");
      setIsCreatingFile(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName)) {
      setFolders((prev) => [...prev, newFolderName]);
      setExpandedFolders((prev) => ({ ...prev, [newFolderName]: true }));

      // ✅ EMIT FOLDER CREATION EVENT TO OTHER USERS
      socket.emit("createFolder", {
        folderName: newFolderName,
        roomId: roomId,
        username: user.username,
      });

      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleShareButton = () => {
    console.log("Empty called");

    setShareModalOpen(true);
  };

  const handleRunCode = async () => {
    if (!activeFile) return;

    setOutputContent(`Running ${activeFile.name}...`);
    //console.log("Running:", activeFile);

    try {
      const input = terminalInputValue;
      const res = await runTheCode(
        activeFile.language,
        activeFile.content,
        input
      );

      setOutputContent(`${res.output}`);
      setErrorContent("");
      setTerminalTab("output");
      setTerminalVisible(true);

      // ✅ EMIT CODE EXECUTION EVENT TO OTHER USERS
      socket.emit("executeCode", {
        fileName: activeFile.name,
        fileId: activeFile.id,
        language: activeFile.language,
        output: res.output,
        error: res.error || "",
        roomId: roomId,
        username: user.username,
      });
    } catch (error) {
      console.error("Error running code:", error);
      setErrorContent(`Error: ${error.message}`);
      setTerminalTab("error");
      setTerminalVisible(true);
    }
  };

  // ============================================
  // OPTIONAL: ADD DELETE FILE HANDLER WITH SOCKET
  // ============================================

  const handleDeleteFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));

    if (activeFile?.id === fileId) {
      setActiveFile(null);
    }

    // ✅ EMIT FILE DELETION EVENT TO OTHER USERS
    socket.emit("deleteFile", {
      fileId: fileId,
      roomId: roomId,
      username: user.username,
    });
  };

  // .................................................................................
  const getLanguageFromExtension = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const langMap = {
      js: "javascript",
      py: "python",
      html: "html",
      cpp: "cpp",
      c: "c",
      java: "java",
      cs: "csharp",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return langMap[ext] || "plaintext";
  };

  // const handleCreateFolder = () => {
  //   if (newFolderName.trim() && !folders.includes(newFolderName)) {
  //     // Add the folder to the folders list
  //     setFolders(prev => [...prev, newFolderName]);
  //     // Add the folder to expandedFolders
  //     setExpandedFolders(prev => ({ ...prev, [newFolderName]: true }));
  //     setNewFolderName('');
  //     setIsCreatingFolder(false);
  //   }
  // };

  // Remove the //console.log line from handleCreateFile entirely
  // Instead, use this useEffect to verify files were added:
  useEffect(() => {
    //console.log("✅ Files state updated:", files);
    //console.log("📊 Total files:", files.length);
  }, [files]);

  // Optional: Add a useEffect to handle file creation side effects
  useEffect(() => {
    // This ensures the file is properly synced and displayed
    if (activeFile && !files.find((f) => f.id === activeFile.id)) {
      setActiveFile(null);
    }
  }, [files]);

  const handleCloseFile = (fileId, e) => {
    e?.stopPropagation();
    socket.emit("closeFile", fileId, roomId);
  };

  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/room/${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  const handleFileTabs = (file) => {
    setActiveFile(file);
    socket.emit("setFileActive", file.id, roomId);
  };

  // const handleEditorChange = (value) => {
  //   const updatedFile = { ...activeFile, content: value };
  //   setActiveFile(updatedFile);
  //   setFiles(files.map(f => f.id === activeFile.id ? updatedFile : f));
  //   setOpenFiles(openFiles.map(f => f.id === activeFile.id ? updatedFile : f));
  // };

  // const handleRunCode = async () => {
  //   if (!activeFile) return;
  //   setOutputContent(`Running ${activeFile.name}...`);
  //   //console.log(activeFile);

  //   const input = terminalInputValue;
  //   const res = await runTheCode(activeFile.language, activeFile.content, input)
  //   setOutputContent(`${res.output}`);
  //   setErrorContent('');
  //   setTerminalTab('output');
  //   setTerminalVisible(true);
  // };

  const handleTerminalCommand = (e) => {
    if (e.key === "Enter") {
      const cmd = terminalInput;
      setTerminalOutput((prev) => prev + `$ ${cmd}\n`);
      if (cmd === "clear") {
        setTerminalOutput("");
      } else if (cmd === "ls") {
        setTerminalOutput(
          (prev) => prev + files.map((f) => f.name).join("  ") + "\n"
        );
      } else {
        setTerminalOutput((prev) => prev + `Command executed: ${cmd}\n`);
      }
      setTerminalInput("");
    }
  };

  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  // Group files by folder and ensure all folders are shown
  const groupedFiles = folders.reduce((acc, folder) => {
    acc[folder] = files.filter((file) => file.folder === folder);
    return acc;
  }, {});

  useEffect(() => {
    //console.log(user);
  }, []);

  return (
    <div className="flex h-screen w-full">
      <div
        className="flex h-screen w-[97%]"
        style={{
          backgroundColor: c.bg,
          color: c.text,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Sidebar */}
        <aside
          className="flex flex-col border-r transition-all duration-300"
          style={{
            width: sidebarCollapsed ? "60px" : "280px",
            backgroundColor: c.sidebar,
            borderColor: c.border,
          }}
        >
          {/* Sidebar Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: c.border }}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Code2 size={24} style={{ color: c.accent }} />
                <span className="font-bold text-lg">HexaHub</span>
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
                onClick={() => {
                  setIsCreatingFile(true);
                  setSelectedFolder("src"); // Default folder
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-90"
                style={{
                  backgroundColor: c.accent,
                  color: theme === "dark" ? c.bg : "#FFFFFF",
                }}
              >
                <Plus size={16} />
                <span className="text-sm font-medium">New File</span>
              </button>
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: c.bgTertiary, color: c.text }}
              >
                <Folder size={16} />
                <span className="text-sm font-medium">New Folder</span>
              </button>
            </div>
          )}

          {/* File Explorer */}
          <div className="flex-1 overflow-y-auto p-2">
            {!sidebarCollapsed ? (
              <div className="space-y-1">
                <div
                  className="px-2 py-1 text-xs font-semibold uppercase"
                  style={{ color: c.textDim }}
                >
                  Explorer
                </div>
                {folders.map((folder) => (
                  <div key={folder}>
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:opacity-80 transition-opacity"
                      style={{ color: c.text }}
                    >
                      {expandedFolders[folder] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <Folder size={16} style={{ color: c.accent }} />
                      <span className="text-sm font-medium">{folder}</span>
                      {groupedFiles[folder] &&
                        groupedFiles[folder].length > 0 && (
                          <span
                            className="ml-auto text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: c.bgTertiary,
                              color: c.textMuted,
                            }}
                          >
                            {groupedFiles[folder].length}
                          </span>
                        )}
                    </button>
                    {expandedFolders[folder] &&
                      groupedFiles[folder] &&
                      groupedFiles[folder].length > 0 && (
                        <div className="ml-6 space-y-0.5">
                          {groupedFiles[folder].map((file) => (
                            <button
                              key={file.id}
                              onClick={() => handleFileClick(file)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all text-left"
                              style={{
                                backgroundColor:
                                  activeFile?.id === file.id
                                    ? c.activeTab
                                    : "transparent",
                                color:
                                  activeFile?.id === file.id
                                    ? c.accent
                                    : c.text,
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getLanguageColor(
                                    file.language
                                  ),
                                }}
                              />
                              <span className="text-sm truncate">
                                {file.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    {expandedFolders[folder] &&
                      (!groupedFiles[folder] ||
                        groupedFiles[folder].length === 0) && (
                        <div
                          className="ml-6 px-2 py-2 text-xs italic"
                          style={{ color: c.textDim }}
                        >
                          Empty folder
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 mt-4">
                {files.slice(0, 5).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="p-2 rounded transition-all"
                    style={{
                      backgroundColor:
                        activeFile?.id === file.id
                          ? c.activeTab
                          : "transparent",
                    }}
                    title={file.name}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(file.language),
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          {!sidebarCollapsed && (
            <div className="border-t" style={{ borderColor: c.border }}>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center gap-3 p-3 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: userMenuOpen
                      ? c.bgTertiary
                      : "transparent",
                  }}
                >
                  <div
                    className="flex items-center justify-center h-8 w-8 rounded-full font-semibold text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #B0C4DE 0%, #8A9AAA 100%)",
                      color: theme === "dark" ? c.bg : "#FFFFFF",
                    }}
                  >
                    {user.username[0]}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none flex-1 text-left">
                    <span
                      className="font-medium text-sm"
                      style={{ color: c.text }}
                    >
                      {user.username}
                    </span>
                    <span className="text-xs" style={{ color: c.textDim }}>
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 transition-transform"
                    style={{
                      color: c.textMuted,
                      transform: userMenuOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div
                      className="absolute bottom-full left-0 right-0 mb-2 mx-2 rounded-lg border shadow-2xl z-40 overflow-hidden"
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                    >
                      {/* User Info Header */}
                      <div
                        className="p-4 border-b"
                        style={{ borderColor: c.border }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center h-12 w-12 rounded-full font-bold"
                            style={{
                              background:
                                "linear-gradient(135deg, #B0C4DE 0%, #8A9AAA 100%)",
                              color: theme === "dark" ? c.bg : "#FFFFFF",
                            }}
                          >
                            {user.username[0]}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span
                              className="font-semibold"
                              style={{ color: c.text }}
                            >
                              {user.username}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: c.textDim }}
                            >
                              {user.email}
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{ color: c.accent }}
                            >
                              {user.plan} Plan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Upgrade Option */}
                      <button
                        className="w-full flex items-center gap-3 p-3 transition-all"
                        style={{
                          backgroundColor: "transparent",
                          color: c.text,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = c.bgTertiary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{
                            background:
                              "linear-gradient(135deg, #B0C4DE 0%, #8A9AAA 100%)",
                          }}
                        >
                          <Zap
                            size={16}
                            style={{
                              color: theme === "dark" ? c.bg : "#FFFFFF",
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-medium text-sm">
                            Upgrade Plan
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: c.textDim }}
                          >
                            Unlock all features
                          </span>
                        </div>
                      </button>

                      <div
                        className="border-t"
                        style={{ borderColor: c.border }}
                      />

                      {/* Menu Items */}
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                        style={{
                          backgroundColor: "transparent",
                          color: c.text,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = c.bgTertiary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <CreditCard size={16} />
                        <span className="text-sm">Billing</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowNotifications(!showNotifications);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                        style={{
                          backgroundColor: "transparent",
                          color: c.text,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = c.bgTertiary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Bell size={16} />
                        <span className="text-sm">Notifications</span>
                      </button>

                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                        style={{
                          backgroundColor: "transparent",
                          color: c.text,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = c.bgTertiary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Settings size={16} />
                        <span className="text-sm">Settings</span>
                      </button>

                      <div
                        className="border-t"
                        style={{ borderColor: c.border }}
                      />

                      {/* Logout */}
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                        style={{
                          backgroundColor: "transparent",
                          color: c.error,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            theme === "dark"
                              ? "rgba(210, 180, 140, 0.1)"
                              : "rgba(139, 115, 85, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={signout}
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Log out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
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
                    style={{
                      backgroundColor: getLanguageColor(activeFile.language),
                    }}
                  />
                  <span className="font-medium">{activeFile.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: c.bgTertiary,
                      color: c.textMuted,
                    }}
                  >
                    {activeFile.language}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: c.bgTertiary }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link
                to="https://brainmash-1.onrender.com"
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-70 disabled:opacity-40 "
                // style={{ backgroundColor: c.accent, color: theme === 'dark' ? c.bg : '#FFFFFF' }}
                style={{ backgroundColor: c.bgTertiary }}
              >
                <Brain size={16} />
                <span className="text-sm font-medium">BrainMesh</span>
              </Link>

              <button
                onClick={handleRunCode}
                disabled={!activeFile}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-70 disabled:opacity-40"
                style={{
                  backgroundColor: c.accent,
                  color: theme === "dark" ? c.bg : "#FFFFFF",
                }}
              >
                <Play size={16} />
                <span className="text-sm font-medium">Run</span>
              </button>

              <button
                // onClick={() => setShareModalOpen(true)}
                onClick={handleShareButton}
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
              {openFiles.map((file) => (
                
                <button
                  key={file.id}
                  onClick={() => handleFileTabs(file)}
                  className="flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all relative group"
                  style={{
                    backgroundColor:
                      activeFile?.id === file.id ? c.bg : "transparent",
                    color: activeFile?.id === file.id ? c.accent : c.textMuted,
                    borderBottom:
                      activeFile?.id === file.id
                        ? `2px solid ${c.accent}`
                        : "none",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getLanguageColor(file.language) }}
                  />

                  <span className="text-sm">{file.name}</span>

                  {/* ✅ NOT A BUTTON */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation(); // ⛔ prevent tab click
                      handleCloseFile(file.id);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity
               hover:bg-red-500 hover:bg-opacity-20 rounded p-0.5 cursor-pointer"
                  >
                    <X size={14} />
                  </span>
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
                  <FileCode
                    size={64}
                    className="mx-auto mb-4 opacity-30"
                    style={{ color: c.textMuted }}
                  />
                  <p
                    className="text-xl font-semibold mb-2"
                    style={{ color: c.text }}
                  >
                    No File Open
                  </p>
                  <p className="text-sm mb-6" style={{ color: c.textMuted }}>
                    Select a file or create a new one
                  </p>
                  <button
                    onClick={() => {
                      setIsCreatingFile(true);
                      setSelectedFolder("src");
                    }}
                    className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg transition-all hover:opacity-90"
                    style={{
                      backgroundColor: c.accent,
                      color: theme === "dark" ? c.bg : "#FFFFFF",
                    }}
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
                height: "280px",
                backgroundColor: c.bgSecondary,
                borderColor: c.border,
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-2 border-b"
                style={{ borderColor: c.border }}
              >
                <div className="flex items-center gap-1">
                  {["terminal", "output", "error", "input"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTerminalTab(tab)}
                      className="px-4 py-2 cursor-pointer rounded-t-lg text-sm font-medium capitalize transition-all"
                      style={{
                        backgroundColor:
                          terminalTab === tab ? c.bg : "transparent",
                        color: terminalTab === tab ? c.accent : c.textMuted,
                        borderBottom:
                          terminalTab === tab
                            ? `2px solid ${c.accent}`
                            : "none",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setTerminalVisible(false)}
                  className="p-1 rounded  cursor-pointer  hover:bg-red-700"
                  style={{ color: c.textMuted }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto p-4 font-mono text-sm"
                style={{ backgroundColor: c.bg }}
              >
                {terminalTab === "terminal" && (
                  <div>
                    <pre
                      className="whitespace-pre-wrap mb-2"
                      style={{ color: c.text }}
                    >
                      {terminalOutput}
                    </pre>
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
                {terminalTab === "output" && (
                  <pre
                    className="whitespace-pre-wrap"
                    style={{ color: c.success }}
                  >
                    {outputContent || "No output yet"}
                  </pre>
                )}
                {terminalTab === "error" && (
                  <pre
                    className="whitespace-pre-wrap"
                    style={{ color: c.error }}
                  >
                    {errorContent || "No errors"}
                  </pre>
                )}
                {terminalTab === "input" && (
                  <textarea
                    value={terminalInputValue}
                    onChange={(e) => setTerminalInputValue(e.target.value)}
                    className="w-full h-full p-3 rounded-lg border focus:outline-none resize-none"
                    style={{
                      backgroundColor: c.bgSecondary,
                      borderColor: c.border,
                      color: c.text,
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
              className="fixed bottom-4 cursor-pointer right-16 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all hover:opacity-90"
              style={{
                backgroundColor: c.accent,
                color: theme === "dark" ? c.bg : "#FFFFFF",
              }}
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
              style={{
                backgroundColor: c.bg,
                width: "400px",
                borderColor: c.border,
                border: `1px solid ${c.border}`,
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: c.text }}
              >
                Create New File
              </h3>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: c.textMuted }}
                >
                  Select Folder
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                  style={{
                    backgroundColor: c.bgSecondary,
                    borderColor: c.border,
                    color: c.text,
                  }}
                >
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: c.textMuted }}
                >
                  File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateFile()}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                  style={{
                    backgroundColor: c.bgSecondary,
                    borderColor: c.border,
                    color: c.text,
                  }}
                  placeholder="filename.js"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsCreatingFile(false);
                    setNewFileName("");
                  }}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: c.bgTertiary, color: c.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{
                    backgroundColor: c.accent,
                    color: theme === "dark" ? c.bg : "#FFFFFF",
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create Folder Modal */}
        {isCreatingFolder && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsCreatingFolder(false)}
            />
            <div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl z-50"
              style={{
                backgroundColor: c.bg,
                width: "400px",
                borderColor: c.border,
                border: `1px solid ${c.border}`,
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: c.text }}
              >
                Create New Folder
              </h3>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: c.textMuted }}
                >
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                  style={{
                    backgroundColor: c.bgSecondary,
                    borderColor: c.border,
                    color: c.text,
                  }}
                  placeholder="folder-name"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: c.bgTertiary, color: c.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{
                    backgroundColor: c.accent,
                    color: theme === "dark" ? c.bg : "#FFFFFF",
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </>
        )}

        {/* Share Modal */}
        {/* {shareModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-[#fff4] bg-opacity-50 z-41"
              onClick={() => setShareModalOpen(false)}
            />
            <div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl z-50"
              style={{ backgroundColor: c.bg, width: '550px', borderColor: c.border, border: `1px solid ${c.border}` }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: c.text }}>Share Room</h3>
              <p className="text-sm mb-4" style={{ color: c.textMuted }}>Share this link with others to collaborate</p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: c.textMuted }}>
                  Room Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${import.meta.env.VITE_BACKEND_URL}/e/${roomId}`}
                    className="flex-1 px-4 py-2 rounded-lg border font-mono text-sm focus:outline-none"
                    style={{
                      backgroundColor: c.bgSecondary,
                      borderColor: c.border,
                      color: c.text
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90 font-medium cursor-alias"
                    style={{
                      backgroundColor: copySuccess ? c.success : c.accent,
                      color: theme === 'dark' ? c.bg : '#FFFFFF'
                    }}
                  >
                    {copySuccess ? (
                      <>
                        <Check size={16} />
                        <span className="text-sm">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: c.bgTertiary, color: c.text }}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )} */}

        {shareModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShareModalOpen(false)}
            />

            <div
              className="fixed top-1/2 left-1/2 z-50
            -translate-x-1/2 -translate-y-1/2
            p-6 rounded-xl shadow-2xl"
              style={{
                backgroundColor: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                width: "550px",
              }}
            >
              <ShareDialog
                theme={theme}
                colors={c}
                onClose={() => setShareModalOpen(false)}
              />
            </div>
          </>
        )}
      </div>
      {/* // In your CodeIDE component, add this before the closing div: */}
      <AIAssistantSidebar theme={theme} activeFile={activeFile} />

      {!sidebarCollapsed && showNotifications && (
        <div
          className="bg-[#0A0A0A] w-[76.5%] h-[100%] mx-3 mb-3 rounded-lg border absolute  text-stone-100"
          style={{ borderColor: c.border, left: sidebarCollapsed ? 0 : 267 }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: c.border }}
          >
            <span className="text-lg font-semibold">Notifications</span>
            <div className="flex gap-3 ">
              <button className="cursor-pointer ">
                <Trash2 size={16} className="text-red-400 " />
              </button>
              <button
                onClick={() => {
                  setShowNotifications(false);
                }}
              >
                <X size={19} />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {/* <CheckboxInTable  /> */}
            {/* <CheckboxInTable username={username} /> */}
            {showNotifications && (
              <CheckboxInTable
                tableData={notifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeIDE;
