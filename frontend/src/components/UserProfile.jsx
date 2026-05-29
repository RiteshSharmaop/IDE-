import { useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useAuth } from "../lib/auth";

// ─── Mock data (replace with your real API data) ──────────────────────────────
const mockUser = {
  id: "usr_001",
  username: "uhes uhfuha",
  email: "uhfuahhfuahuhfuhauh@test.com",
  createdAt: "2024-03-01T10:00:00Z",
  lastLogin: "2026-02-20T08:30:00Z",
  filesCreated: 0,
  plan: "Free",
  avatar: "",
  phone: "",
  billingAddress: "",
};


const mockOrders    = [];
const mockAddresses = [];



// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
};



const profileCompletion = (user) => {
  const fields = [user.username, user.email, user.phone, user.billingAddress, user.avatar];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

// ─── Theme Helper ─────────────────────────────────────────────────────────────
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

const getThemeClasses = (theme) => {
  const isDark = theme !== "white";
  const c = isDark ? colors.dark : colors.light;
  return {
    bg: c.bg,
    text: c.text,
    textSecondary: c.textMuted,
    textTertiary: c.textDim,
    border: c.border,
    headerBg: isDark ? c.bgSecondary : c.bgSecondary,
    sidebarText: c.text,
    sidebarTextInactive: c.textMuted,
    inputBg: c.bgTertiary,
    inputBorder: c.border,
    buttonBg: c.accent,
    buttonHover: c.accentHover,
    buttonText: c.text,
  };
};


// ─── Layout ───────────────────────────────────────────────────────────────────
function Layout({ activePage, setActivePage, children, roomId, theme }) {
  const navigate = useNavigate();
  const navLinks = [
    { key: "overview", label: "Overview" },
    { key: "profile", label: "Profile" },
    { key: "addresses", label: "Addresses" },
    { key: "orders", label: "Saved Code" },
  ];
  const themeClasses = getThemeClasses(theme);
  const handleEditorClick = () => {
    if (roomId) {
      navigate(`/e/${roomId}`);
    } else {
      navigate("/");
    }
  };
  const {signout} = useAuth();
  return (
    <div style={{ backgroundColor: themeClasses.bg, color: themeClasses.text }} className="min-h-screen font-sans">

      {/* NAVBAR */}
      <header style={{ backgroundColor: themeClasses.headerBg, borderColor: themeClasses.border }} className={`sticky top-0 z-20 border-b`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div onClick={handleEditorClick} className="hover:opacity-70 cursor-pointer flex items-center ">
            <ArrowLeft className="h-5" />
            <button style={{ color: themeClasses.text }} className="text-sm transition-colors">Back</button>
          </div>
          <span style={{ color: themeClasses.text }} className="text-sm font-semibold tracking-[0.22em] uppercase">HexaHub</span>
          <div className="flex items-center gap-6">
            {/* <button className="text-sm text-gray-800 hover:text-gray-500 transition-colors">Account</button>
            <button className="text-sm text-gray-800 hover:text-gray-500 transition-colors">Cart (0)</button> */}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="max-w-screen-xl mx-auto px-6 py-14 flex gap-16">

        {/* SIDEBAR */}
        <aside className="w-56 shrink-0 pl-16">
          <p style={{ color: themeClasses.text }} className="text-sm font-bold mb-3">Account</p>
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const key = link.key;
              const isActive = activePage === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePage(key)}
                  style={{ color: isActive ? themeClasses.text : themeClasses.sidebarTextInactive }}
                  className="text-left text-sm py-1.5 transition-colors"
                >
                  {isActive && <span className="font-semibold">{link.label}</span>}
                  {!isActive && link.label}
                </button>
              );
            })}
            {/* <button onClick={signout} style={{ color: themeClasses.sidebarTextInactive }} className="cursor-pointer text-left text-sm py-1.5 mt-3 hover:text-red-500 transition-colors">
              Log out
            </button> */}
            <button
            onClick={signout}
            className={`text-left text-sm py-1.5 mt-3 transition-colors w-15 cursor-pointer
            ${themeClasses.sidebarTextInactive} hover:text-red-500`}
          >
            Log out
          </button>

          </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1">{children}</main>
      </div>

      {/* FOOTER */}
      <div className="max-w-screen-xl mx-auto px-6 pb-14">
        <div style={{ borderColor: themeClasses.border }} className="border-t pt-10 flex items-start justify-between">
          <div>
            <h3 style={{ color: themeClasses.text }} className="text-lg font-bold mb-1">Got questions?</h3>
            <p style={{ color: themeClasses.textSecondary }} className="text-sm">
              You can find frequently asked questions and answers on our customer service page.
            </p>
          </div>
          <Link to="/not-found" className="text-sm text-blue-600 hover:underline whitespace-nowrap mt-1">
            Customer Service ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewPage({ user, orders, addresses, setActivePage, theme }) {
  const completion = profileCompletion(user);
  const firstName  = user.username?.split(" ")[0] || "User";
  const themeClasses = getThemeClasses(theme);

  return ( 
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-3">
        <h1 style={{ color: themeClasses.text }} className="text-3xl font-bold">Hello {firstName}</h1>
        <p style={{ color: themeClasses.textSecondary }} className="text-sm mt-2">
          Signed in as: <span style={{ color: themeClasses.text }} className="font-semibold">{user.email}</span>
        </p>
      </div>

      <hr style={{ borderColor: themeClasses.border }} className="mb-8" />

      {/* Stats */}
      <div className="flex gap-14 mb-8">
        <button onClick={() => setActivePage("profile")} className="text-left hover:opacity-70 transition-opacity">
          <p style={{ color: themeClasses.text }} className="text-sm font-semibold mb-1">Profile</p>
          <p style={{ color: themeClasses.text }} className="text-4xl font-bold">
            {completion}%{" "}
            <span style={{ color: themeClasses.textTertiary }} className="text-sm font-normal uppercase tracking-widest">completed</span>
          </p>
        </button>

        <button onClick={() => setActivePage("addresses")} className="text-left hover:opacity-70 transition-opacity">
          <p style={{ color: themeClasses.text }} className="text-sm font-semibold mb-1">Addresses</p>
          <p style={{ color: themeClasses.text }} className="text-4xl font-bold">
            {addresses.length}{" "}
            <span style={{ color: themeClasses.textTertiary }} className="text-sm font-normal uppercase tracking-widest">saved</span>
          </p>
        </button>

        <div className="text-left">
          <p style={{ color: themeClasses.text }} className="text-sm font-semibold mb-1">Files Created</p>
          <p style={{ color: themeClasses.text }} className="text-4xl font-bold">
            {user.filesCreated ?? 0}{" "}
            <span style={{ color: themeClasses.textTertiary }} className="text-sm font-normal uppercase tracking-widest">total</span>
          </p>
        </div>
      </div>

      {/* Plan + meta */}
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: themeClasses.textSecondary }} className="text-sm">Plan:</span>
        <span style={{ backgroundColor: theme === "white" ? "#F3F4F6" : colors.dark.bgTertiary, color: themeClasses.text }} className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {user.plan || "Free"}
        </span>
      </div>

      <div className="flex flex-col gap-1 mb-10">
        <p style={{ color: themeClasses.textSecondary }} className="text-sm">
          Member since: <span style={{ color: themeClasses.text }} className="font-medium">{formatDate(user.createdAt)}</span>
        </p>
        <p style={{ color: themeClasses.textSecondary }} className="text-sm">
          Last login: <span style={{ color: themeClasses.text }} className="font-medium">{formatDate(user.lastLogin)}</span>
        </p>
      </div>

      {/* Recent orders */}
      <h2 style={{ color: themeClasses.text }} className="text-sm font-semibold mb-3">Recent Saved Code</h2>
      {orders.length === 0 ? (
        <p style={{ color: themeClasses.textSecondary }} className="text-sm">No recent saved code</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} style={{ borderColor: themeClasses.border, backgroundColor: themeClasses.inputBg }} className="border rounded px-4 py-3 text-sm flex justify-between">
              <span style={{ color: themeClasses.text }} className="font-medium">{o.id}</span>
              <span style={{ color: themeClasses.textSecondary }}>{o.date}</span>
              <span style={{ color: themeClasses.text }}>{o.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Field Row ────────────────────────────────────────────────────────
function FieldRow({ fieldKey, label, type, placeholder, value, isEditing, onEdit, onSave, onCancel, theme }) {
  const [draft, setDraft] = useState(value);
  const themeClasses = getThemeClasses(theme);

  const openEdit = () => { setDraft(value); onEdit(fieldKey); };

  const display = type === "password" ? (value ? "••••••••••" : null) : value || null;
  const emptyLabel = fieldKey === "billingAddress" ? "No billing address" : "—";

  return (
    <div style={{ borderColor: themeClasses.border }} className="py-5 border-b">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p style={{ color: themeClasses.textTertiary }} className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1">{label}</p>
          {!isEditing && (
            <p style={{ color: display ? themeClasses.text : themeClasses.textSecondary }} className="text-sm">
              {display ?? emptyLabel}
            </p>
          )}
          {isEditing && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <input
                autoFocus
                type={type}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                style={{ 
                  borderColor: themeClasses.border,
                  backgroundColor: themeClasses.inputBg,
                  color: themeClasses.text
                }}
                className="rounded-sm px-3 py-1.5 text-sm outline-none flex-1 min-w-[200px] transition-colors"
              />
              <button
                onClick={() => onSave(fieldKey, draft)}
                style={{ backgroundColor: themeClasses.buttonBg, color: themeClasses.text }}
                className="text-xs font-medium px-5 py-1.5 rounded-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                style={{ borderColor: themeClasses.border, color: themeClasses.textSecondary }}
                className="border text-xs font-medium px-3 py-1.5 rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={openEdit}
            style={{ 
              borderColor: themeClasses.border,
              color: themeClasses.text,
              backgroundColor: 'transparent'
            }}
            className="border text-xs font-medium px-5 py-1.5 rounded-sm transition-all shrink-0 hover:opacity-80"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
const PROFILE_FIELDS = [
  { key: "username",       label: "USERNAME",        type: "text",     placeholder: "Your username" },
  { key: "email",          label: "EMAIL",           type: "email",    placeholder: "Email address" },
  { key: "phone",          label: "PHONE",           type: "tel",      placeholder: "Phone number" },
  { key: "billingAddress", label: "BILLING ADDRESS", type: "text",     placeholder: "Street address" },
  { key: "password",       label: "PASSWORD",        type: "password", placeholder: "New password" },
];

function ProfilePage({ user, setUser, roomId, theme }) {
  const [editingKey, setEditingKey] = useState(null);
  const themeClasses = getThemeClasses(theme);

  // keys match directly to user state shape
  const handleSave = (key, val) => {
    setUser((u) => ({ ...u, [key]: val }));
    setEditingKey(null);
  };

  useEffect(() => {
    console.log(" room ID in ProfilePAge: ", roomId);
  }, [roomId]);

  return (
    <div className="max-w-2xl">
      <h1 style={{ color: themeClasses.text }} className="text-3xl font-bold mb-2">Profile</h1>
      <p style={{ color: themeClasses.textSecondary, borderColor: themeClasses.border }} className="text-sm leading-relaxed pb-8 mb-2 border-b">
        View and update your profile information, including your username, email, and phone number.
        You can also update your billing address or change your password.
      </p>

      {/* Read-only info */}
      <div style={{ borderColor: themeClasses.border }} className="py-5 border-b">
        <p style={{ color: themeClasses.textTertiary }} className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1">PLAN</p>
        <span style={{ backgroundColor: theme === "white" ? "#F3F4F6" : colors.dark.bgTertiary, color: themeClasses.text }} className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {user.plan || "Free"}
        </span>
      </div>

      <div style={{ borderColor: themeClasses.border }} className="py-5 border-b flex gap-12">
        <div>
          <p style={{ color: themeClasses.textTertiary }} className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1">MEMBER SINCE</p>
          <p style={{ color: themeClasses.text }} className="text-sm font-medium">{formatDate(user.createdAt)}</p>
        </div>
        <div>
          <p style={{ color: themeClasses.textTertiary }} className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1">LAST LOGIN</p>
          <p style={{ color: themeClasses.text }} className="text-sm font-medium">{formatDate(user.lastLogin)}</p>
        </div>
        <div>
          <p style={{ color: themeClasses.textTertiary }} className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1">FILES CREATED</p>
          <p style={{ color: themeClasses.text }} className="text-sm font-medium">{user.filesCreated ?? 0}</p>
        </div>
      </div>

      {/* Editable fields — keys match user state directly */}
      {PROFILE_FIELDS.map((f) => (
        <FieldRow
          key={f.key}
          fieldKey={f.key}
          label={f.label}
          type={f.type}
          placeholder={f.placeholder}
          value={user[f.key] ?? ""}
          isEditing={editingKey === f.key}
          onEdit={setEditingKey}
          onSave={handleSave}
          onCancel={() => setEditingKey(null)}
          theme={theme}
        />
      ))}
    </div>
  );
}

// ─── Addresses Page ───────────────────────────────────────────────────────────
function AddressesPage({ addresses, theme }) {
  const themeClasses = getThemeClasses(theme);
  return (
    <div className="max-w-2xl">
      <h1 style={{ color: themeClasses.text }} className="text-3xl font-bold mb-2">Addresses</h1>
      <p style={{ color: themeClasses.textSecondary, borderColor: themeClasses.border }} className="text-sm leading-relaxed pb-8 mb-2 border-b">
        View and update your shipping addresses.
      </p>
      {addresses.length === 0 ? (
        <div style={{ borderColor: themeClasses.border, color: themeClasses.textSecondary, backgroundColor: themeClasses.inputBg }} className="py-12 text-center text-sm border border-dashed rounded">
          No saved addresses yet.
          <br />
          <button style={{ color: themeClasses.text }} className="mt-3 underline text-sm">+ Add address</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((a, i) => (
            <div key={i} style={{ borderColor: themeClasses.border, color: themeClasses.text }} className="border rounded px-4 py-3 text-sm">{a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage({ orders, setOrders, theme }) {
  const themeClasses = getThemeClasses(theme);
  console.log("📦 OrdersPage received orders:", orders, "orders.length:", orders?.length);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };
  return (
    <div className="max-w-2xl">
      <h1 style={{ color: themeClasses.text }} className="text-3xl font-bold mb-2">Saved Code</h1>
      <p style={{ color: themeClasses.textSecondary, borderColor: themeClasses.border }} className="text-sm leading-relaxed pb-8 mb-2 border-b">
        View your saved code snippets and projects.
      </p>
      {!orders || orders.length === 0 ? (
        <p style={{ color: themeClasses.textSecondary }} className="text-sm py-6">No saved code yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {orders.map((o, idx) => {
            console.log(`📌 Rendering order ${idx}:`, o);
            return (
              <div key={o.id || idx} style={{ borderColor: themeClasses.border, backgroundColor: themeClasses.inputBg }} className="border rounded px-4 py-3 text-sm flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span style={{ color: themeClasses.text }} className="font-medium truncate block">{o.name || o.id}</span>
                    <span style={{ color: themeClasses.textSecondary, fontSize: 12 }}>{new Date(o.createdAt || o.date || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(o.content || o.preview || "", o.id || idx)}
                      title="Copy code"
                      style={{ color: themeClasses.text }}
                      className="p-1 rounded hover:opacity-80"
                    >
                      {copiedId === (o.id || idx) ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-left" style={{ color: themeClasses.text }}>
                  <code className="block max-h-20 overflow-hidden text-xs whitespace-pre-wrap">{o.preview || (o.content || '').slice(0, 200)}</code>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
// Usage 1 — standalone (uses mock data):
//   <AccountPage />
//
// Usage 2 — connected to your real state:
//   <AccountPage user={user} setUser={setUser} files={files} />
//
export default function AccountPage({ user: propUser, setUser: propSetUser, files = [], userFiles = [], roomId:propRoomID}) {
  const incomingFiles = files.length ? files : (userFiles || []);
  console.log("📂 AccountPage initialized with incomingFiles:", incomingFiles);
  const [localUser, setLocalUser] = useState({ ...mockUser, filesCreated: incomingFiles.length || 0 });
  const { theme } = useTheme();
  const { socket } = useSocket();

  const user    = propUser    ?? localUser;
  const setUser = propSetUser ?? setLocalUser;
  const roomId   = propRoomID ?? useRoom()?.roomId;

  const [activePage, setActivePage] = useState("overview");

  // Saved files state (displayed on Saved Code page)
  const [savedFiles, setSavedFiles] = useState((incomingFiles || []).map(f => ({
    id: f.id,
    name: f.name,
    content: f.content,
    language: f.language,
    createdAt: f.createdAt || Date.now(),
    preview: (f.content || "").slice(0, 200),
  })));

  // Listen for savedCode events to update list in real-time
  useEffect(() => {
    if (!socket) return;
    const handler = ({ file, username, timestamp }) => {
      if (!file || !file.id) return;
      setSavedFiles((prev) => {
        if (prev.find((p) => p.id === file.id)) return prev;
        return [
          {
            id: file.id,
            name: file.name || file.id,
            content: file.content || "",
            language: file.language || "",
            createdAt: timestamp || Date.now(),
            preview: (file.content || "").slice(0, 200),
          },
          ...prev,
        ];
      });
    };

    socket.on("savedCode", handler);
    return () => socket.off("savedCode", handler);
  }, [socket]);

  // Load saved snapshots from backend (Redis) on mount
  useEffect(() => {
    let mounted = true;
    const loadSnapshots = async () => {
      try {
        console.log("📥 Fetching snapshots from /api/files/snapshots...");
        const res = await apiClient.get("/files/snapshots");
        console.log("📊 Snapshots response:", res.data);
        if (!mounted) return;
        if (res?.data?.success) {
          const snaps = (res.data.data.snapshots || []).map((s) => {
            console.log("🔍 Processing snapshot:", s);
            return {
              id: s.key,
              name: s.file?.name || s.key,
              content: s.file?.content || "",
              language: s.file?.language || "",
              createdAt: s.savedAt || Date.now(),
              preview: (s.file?.content || "").slice(0, 200),
            };
          });

          console.log("✅ Processed snaps:", snaps);
          if (snaps.length) {
            setSavedFiles((prev) => {
              const updated = [...snaps, ...prev];
              console.log("💾 Updated savedFiles state:", updated);
              return updated;
            });
          } else {
            console.log("⚠️ No snapshots found");
          }
        } else {
          console.log("❌ API returned success: false");
        }
      } catch (e) {
        console.error("❌ Failed to load snapshots:", e);
      }
    };
    loadSnapshots();
    return () => {
      mounted = false;
    };
  }, []);

 
  
  useEffect(() => {
    console.log("Current room ID in UserProfile: ", roomId);
  }, [roomId]);

  const renderPage = () => {
    console.log("🎭 Rendering page:", activePage, "with savedFiles count:", savedFiles.length, "savedFiles:", savedFiles);
    switch (activePage) {
      case "overview":  return <OverviewPage user={user} orders={mockOrders} addresses={mockAddresses} setActivePage={setActivePage} theme={theme} />;
      case "profile":   return <ProfilePage user={user} setUser={setUser} roomId={roomId} theme={theme} />;
      case "addresses": return <AddressesPage addresses={mockAddresses} theme={theme} />;
      case "orders":    return <OrdersPage orders={savedFiles} setOrders={setSavedFiles} theme={theme} />;
      default:          return null;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} roomId={roomId} theme={theme}>
      {renderPage()}
    </Layout>
  );
}