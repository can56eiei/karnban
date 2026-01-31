"use client";
import { useState, useMemo, ReactNode } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type StatusType = "pending" | "approved" | "rejected";
type IconName =
  | "check" | "x" | "clock" | "shield" | "eye" | "plus"
  | "logout" | "copy" | "user" | "book" | "calendar"
  | "filter" | "search" | "upload" | "arrow_left" | "trash" | "lock";

interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

interface Submission {
  id: number;
  title: string;
  student: string;
  class: string;
  no: number | string;
  category: string;
  status: StatusType;
  date: string;
  thumb: string;
}

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

interface StatusBadgeProps {
  status: StatusType;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { id: "physics", label: "ฟิสิกส์", emoji: "⚛️", color: "#3b82f6" },
  { id: "math", label: "คณิตศาสตร์", emoji: "📐", color: "#8b5cf6" },
  { id: "chemistry", label: "เคมี", emoji: "🧪", color: "#10b981" },
  { id: "biology", label: "ชีว", emoji: "🌱", color: "#f59e0b" },
  { id: "english", label: "ภาษาอังกฤษ", emoji: "🇬🇧", color: "#ef4444" },
  { id: "thai", label: "ภาษาไทย", emoji: "🇹🇭", color: "#ec4899" },
  { id: "history", label: "ประวัติศาสตร์", emoji: "📜", color: "#64748b" },
  { id: "social", label: "สังคมศึกษา", emoji: "🌍", color: "#14b8a6" },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  { id: 1, title: "ใบงานเรื่องงานและพลังงาน", student: "ณพล วิรัชติ", class: "ม.4/8", no: 21, category: "physics", status: "approved", date: "31 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw1/400/300" },
  { id: 2, title: "แบบทดสอบสมการ กรณีที่ 2", student: "สิรินทร์ โรมัน", class: "ม.5/3", no: 7, category: "math", status: "pending", date: "30 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw2/400/300" },
  { id: 3, title: "รายงานการทดลอง เรื่องอิฐ", student: "วิรุฒน์ คงสุข", class: "ม.4/8", no: 15, category: "chemistry", status: "pending", date: "29 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw3/400/300" },
  { id: 4, title: "การแบ่งเซลล์ มิโตซิส", student: "พรรณ์พิมพ์ เจ้าPhoto", class: "ม.5/3", no: 22, category: "biology", status: "approved", date: "28 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw4/400/300" },
  { id: 5, title: "เรียบเรียงเรื่อง Present Perfect", student: " เอมิลี่ สมิทธ์", class: "ม.4/8", no: 3, category: "english", status: "rejected", date: "27 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw5/400/300" },
  { id: 6, title: "วรรณยุกต์และตัวสะกด", student: "จิตรลดา พลับ", class: "ม.5/3", no: 11, category: "thai", status: "approved", date: "26 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw6/400/300" },
  { id: 7, title: "สงงครามโลกครั้งที่ 2 สาเหตุ", student: "ภัทรวงศ์ สุขเดียว", class: "ม.4/8", no: 9, category: "history", status: "pending", date: "25 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw7/400/300" },
  { id: 8, title: "การเปลี่ยนแปลงสังคม ยุคโลกาภิวัตน์", student: "ปาลิตา กรุงไทย", class: "ม.5/3", no: 5, category: "social", status: "approved", date: "24 ม.ค. 2026", thumb: "https://picsum.photos/seed/hw8/400/300" },
];

// ─── ICONS (inline SVG) ──────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }: IconProps) => {
  const paths: Record<IconName, ReactNode> = {
    check: <><path d="M20 6L9 17l-5-5" />{""}</>,
    x: <><path d="M18 6 6 18M6 6l12 12" />{""}</>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="8" r="4" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></>,
    arrow_left: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const cfgMap: Record<StatusType, { bg: string; text: string; label: string; icon: IconName }> = {
    pending: { bg: "#fef3c7", text: "#b45309", label: "รออนุมัติ", icon: "clock" },
    approved: { bg: "#d1fae5", text: "#047857", label: "อนุมัติแล้ว", icon: "check" },
    rejected: { bg: "#fee2e2", text: "#dc2626", label: "ปฏิเสธ", icon: "x" },
  };
  const cfg = cfgMap[status];
  return (
    <span style={{ background: cfg.bg, color: cfg.text }} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full">
      <Icon name={cfg.icon} size={10} /> {cfg.label}
    </span>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function HomeworkHost() {
  // ── State ──
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("browse"); // browse | admin | detail
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [detailItem, setDetailItem] = useState<Submission | null>(null);
  const [adminTab, setAdminTab] = useState("pending"); // pending | all
  const [copied, setCopied] = useState(false);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });

  // ── Admin login ──
  const ADMIN_PASSWORD = "admin123";
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  // ── Confirm delete ──
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return submissions
      .filter((s) => (view === "browse" ? s.status === "approved" : true))
      .filter((s) => (selectedCat !== "all" ? s.category === selectedCat : true))
      .filter((s) => (adminTab === "pending" && view === "admin" ? s.status === "pending" : true))
      .filter((s) => {
        const q = searchQ.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.student.toLowerCase().includes(q);
      });
  }, [submissions, selectedCat, searchQ, view, adminTab]);

  // ── Actions ──
  const approve = (id: number) => setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "approved" as StatusType } : s)));
  const reject = (id: number) => setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" as StatusType } : s)));
  const deleteItem = (id: number) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
    if (detailItem?.id === id) setDetailItem(null);
  };
  const handleLoginAttempt = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput("");
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
  };
  const submitNew = () => {
    if (!newForm.title || !newForm.student) return;
    setSubmissions((prev) => [
      {
        id: Date.now(),
        ...newForm,
        status: "pending" as StatusType,
        date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
        thumb: `https://picsum.photos/seed/new${Date.now()}/400/300`,
      },
      ...prev,
    ]);
    setNewForm({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
    setShowUploadForm(false);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const getCat = (id: string): Category => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  // ─── DETAIL VIEW ─────────────────────────────────────────────────────────
  if (detailItem) {
    const cat = getCat(detailItem.category);
    return (
      <div className="min-h-screen" style={{ background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif" }}>
        {/* Nav */}
        <nav className="sticky top-0 z-50 px-6 py-4" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDetailItem(null)}>
              <Icon name="arrow_left" size={18} className="text-slate-500" />
              <span className="text-sm text-slate-500 font-medium">กลับ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 text-white" style={{ background: "#3b82f6" }}><Icon name="book" size={16} /></div>
              <span className="font-bold text-lg">HW-Store</span>
            </div>
            <div className="w-24" />
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <img src={detailItem.thumb} alt={detailItem.title} className="w-full" style={{ height: 280, objectFit: "cover" }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cat.color + "18", color: cat.color }}>{cat.emoji} {cat.label}</span>
                <StatusBadge status={detailItem.status} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2">{detailItem.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-5">
                <span className="flex items-center gap-1"><Icon name="user" size={14} /> {detailItem.student} (เลขที่ {detailItem.no})</span>
                <span className="flex items-center gap-1"><Icon name="calendar" size={14} /> {detailItem.date}</span>
                <span className="flex items-center gap-1"><Icon name="book" size={14} /> {detailItem.class}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyLink(window.location.href + `?hw=${detailItem.id}`)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition" style={{ background: "#f1f5f9", color: "#475569" }}>
                  <Icon name={copied ? "check" : "copy"} size={14} className={copied ? "text-green-600" : ""} /> {copied ? "คอปแล้ว!" : "คอปลิงค์"}
                </button>
                {isAdmin && detailItem.status === "pending" && (
                  <>
                    <button onClick={() => { approve(detailItem.id); setDetailItem({ ...detailItem, status: "approved" }); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition" style={{ background: "#10b981" }}>
                      <Icon name="check" size={14} /> อนุมัติ
                    </button>
                    <button onClick={() => { reject(detailItem.id); setDetailItem({ ...detailItem, status: "rejected" }); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition" style={{ background: "#ef4444" }}>
                      <Icon name="x" size={14} /> ปฏิเสธ
                    </button>
                  </>
                )}
                {isAdmin && (
                  <button onClick={() => setConfirmDeleteId(detailItem.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition" style={{ background: "#fee2e2", color: "#ef4444" }}>
                    <Icon name="trash" size={14} /> ลบใบงาน
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── MAIN LAYOUT ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 px-6 py-4" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 text-white" style={{ background: "#3b82f6" }}><Icon name="book" size={18} /></div>
            <span className="font-bold text-xl">HW-Store</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button onClick={() => { setView("browse"); setSelectedCat("all"); }} className="text-sm font-semibold transition" style={{ color: view === "browse" ? "#3b82f6" : "#64748b" }}>
                  คลัง
                </button>
                <button onClick={() => { setView("admin"); setSelectedCat("all"); }} className="relative text-sm font-semibold transition flex items-center gap-1" style={{ color: view === "admin" ? "#3b82f6" : "#64748b" }}>
                  <Icon name="shield" size={14} /> Admin
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-3 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full" style={{ background: "#ef4444" }}>{pendingCount}</span>
                  )}
                </button>
              </>
            )}
            {!isAdmin ? (
              <button onClick={() => { setShowLoginModal(true); setLoginError(false); }} className="text-sm font-bold px-4 py-1.5 rounded-lg text-white transition flex items-center gap-1.5" style={{ background: "#3b82f6" }}><Icon name="lock" size={13} /> เข้า Admin</button>
            ) : (
              <button onClick={() => { setIsAdmin(false); setView("browse"); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition">
                <Icon name="logout" size={14} /> ออก
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── LOGIN MODAL ── */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-2 text-white" style={{ background: "#3b82f6" }}><Icon name="lock" size={18} /></div>
                  <h2 className="font-extrabold text-slate-800">เข้า Admin</h2>
                </div>
                <button onClick={() => { setShowLoginModal(false); setLoginError(false); setPasswordInput(""); }} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={18} /></button>
              </div>
              <p className="text-xs text-slate-400 mb-4">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ Admin Panel</p>
              <label className="block text-xs font-bold text-slate-500 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLoginAttempt()}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300 transition"
                style={{ borderColor: loginError ? "#ef4444" : "#e2e8f0" }}
                autoFocus
              />
              {loginError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><Icon name="x" size={11} /> รหัสผ่านไม่ถูกต้อง</p>
              )}
              <div className="flex gap-2 mt-5">
                <button onClick={handleLoginAttempt} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition" style={{ background: "#3b82f6" }}>เข้าสู่ระบบ</button>
                <button onClick={() => { setShowLoginModal(false); setLoginError(false); setPasswordInput(""); }} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 transition" style={{ background: "#f1f5f9" }}>ยกเลิก</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIRM DELETE MODAL ── */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-2 text-white" style={{ background: "#ef4444" }}><Icon name="trash" size={18} /></div>
                  <h2 className="font-extrabold text-slate-800">ยืนยันลบ</h2>
                </div>
                <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={18} /></button>
              </div>
              <p className="text-sm text-slate-500 mb-1">คุณต้องการลบใบงานนี้ใช่ไหม?</p>
              <p className="text-xs text-slate-400 mb-5">การกระทำนี้จะไม่สามารถเปลี่ยนกลับได้</p>
              <div className="flex gap-2">
                <button onClick={() => deleteItem(confirmDeleteId)} className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition flex items-center justify-center gap-1.5" style={{ background: "#ef4444" }}><Icon name="trash" size={14} /> ลบเลย</button>
                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 transition" style={{ background: "#f1f5f9" }}>ยกเลิก</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN VIEW ── */}
        {view === "admin" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2"><Icon name="shield" size={22} className="text-blue-600" /> แผงควบคุม Admin</h1>
                <p className="text-slate-400 text-sm mt-0.5">จัดการบทส่งของนักเรียน</p>
              </div>
              <button onClick={() => setShowUploadForm(!showUploadForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition shadow-sm" style={{ background: "#3b82f6" }}>
                <Icon name="plus" size={15} /> เพิ่มใบงาน
              </button>
            </div>

            {/* Upload Form Modal */}
            {showUploadForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-extrabold text-slate-800">เพิ่มใบงานใหม่</h2>
                    <button onClick={() => setShowUploadForm(false)} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={18} /></button>
                  </div>

                  <label className="block text-xs font-bold text-slate-500 mb-1">เรื่อง *</label>
                  <input value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} placeholder="เรื่องของใบงาน" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 mb-3" />

                  <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อนักเรียน *</label>
                  <input value={newForm.student} onChange={(e) => setNewForm({ ...newForm, student: e.target.value })} placeholder="ชื่อนักเรียน" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 mb-3" />

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">ห้อง</label>
                      <input value={newForm.class} onChange={(e) => setNewForm({ ...newForm, class: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-slate-500 mb-1">เลขที่</label>
                      <input value={newForm.no} onChange={(e) => setNewForm({ ...newForm, no: e.target.value })} placeholder="21" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                  </div>

                  <label className="block text-xs font-bold text-slate-500 mb-1 mt-3">หมวดหมู่</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} onClick={() => setNewForm({ ...newForm, category: cat.id })} className="text-center p-2 rounded-lg border transition text-[10px] font-bold" style={{ borderColor: newForm.category === cat.id ? cat.color : "#e2e8f0", background: newForm.category === cat.id ? cat.color + "12" : "#fff", color: newForm.category === cat.id ? cat.color : "#64748b" }}>
                        <div className="text-base mb-0.5">{cat.emoji}</div>{cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button onClick={submitNew} className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition" style={{ background: "#3b82f6" }}>เพิ่มใบงาน</button>
                    <button onClick={() => setShowUploadForm(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 transition" style={{ background: "#f1f5f9" }}>ยกเลิก</button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {([
                { label: "รอการอนุมัติ", value: submissions.filter(s => s.status === "pending").length, color: "#f59e0b", icon: "clock" as IconName },
                { label: "อนุมัติแล้ว", value: submissions.filter(s => s.status === "approved").length, color: "#10b981", icon: "check" as IconName },
                { label: "ปฏิเสธ", value: submissions.filter(s => s.status === "rejected").length, color: "#ef4444", icon: "x" as IconName },
              ] as const).map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                  <div className="rounded-full p-2" style={{ background: stat.color + "15", color: stat.color }}><Icon name={stat.icon} size={18} /></div>
                  <div>
                    <div className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab filter */}
            <div className="flex gap-2 mb-4">
              {["pending", "all"].map((tab) => (
                <button key={tab} onClick={() => setAdminTab(tab)} className="text-xs font-bold px-3 py-1.5 rounded-full transition" style={{ background: adminTab === tab ? "#3b82f6" : "#fff", color: adminTab === tab ? "#fff" : "#64748b", border: "1px solid " + (adminTab === tab ? "#3b82f6" : "#e2e8f0") }}>
                  {tab === "pending" ? "รออนุมัติ" : "ทั้งหมด"}
                </button>
              ))}
            </div>

            {/* Admin list */}
            <div className="space-y-3">
              {filtered.map((item) => {
                const cat = getCat(item.category);
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 flex items-center gap-4 p-3 hover:shadow-sm transition">
                    <img src={item.thumb} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cat.color + "15", color: cat.color }}>{cat.emoji} {cat.label}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="font-bold text-sm text-slate-800 truncate mt-0.5">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.student} · {item.class} · เลขที่ {item.no}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === "pending" && (
                        <>
                          <button onClick={() => approve(item.id)} className="p-1.5 rounded-lg text-white transition" style={{ background: "#10b981" }} title="อนุมัติ"><Icon name="check" size={15} /></button>
                          <button onClick={() => reject(item.id)} className="p-1.5 rounded-lg text-white transition" style={{ background: "#ef4444" }} title="ปฏิเสธ"><Icon name="x" size={15} /></button>
                        </>
                      )}
                      <button onClick={() => setDetailItem(item)} className="p-1.5 rounded-lg transition" style={{ background: "#f1f5f9", color: "#64748b" }} title="ดูรายละเอียด"><Icon name="eye" size={15} /></button>
                      <button onClick={() => setConfirmDeleteId(item.id)} className="p-1.5 rounded-lg transition hover:bg-red-100" style={{ background: "#f1f5f9", color: "#ef4444" }} title="ลบ"><Icon name="trash" size={15} /></button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">ไม่มีรายการ</div>
              )}
            </div>
          </>
        )}

        {/* ── BROWSE VIEW ── */}
        {view === "browse" && (
          <>
            {/* Hero */}
            <div className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-1">คลังฝากการบ้าน</h1>
                <p className="opacity-75 text-sm">ค้นหาและดูการบ้านของเพื่อนๆ ได้เลยที่นี่</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="ค้นหาเรื่อง หรือชื่อนักเรียน..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap mb-6">
              <button onClick={() => setSelectedCat("all")} className="text-xs font-bold px-3 py-1.5 rounded-full transition" style={{ background: selectedCat === "all" ? "#3b82f6" : "#fff", color: selectedCat === "all" ? "#fff" : "#64748b", border: "1px solid " + (selectedCat === "all" ? "#3b82f6" : "#e2e8f0") }}>
                ทั้งหมด
              </button>
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className="text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1" style={{ background: selectedCat === cat.id ? cat.color : "#fff", color: selectedCat === cat.id ? "#fff" : "#64748b", border: "1px solid " + (selectedCat === cat.id ? cat.color : "#e2e8f0") }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const cat = getCat(item.category);
                return (
                  <div key={item.id} onClick={() => setDetailItem(item)} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="relative overflow-hidden" style={{ height: 160 }}>
                      <img src={item.thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ background: cat.color, color: "#fff" }}>{cat.emoji} {cat.label}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-slate-800 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Icon name="user" size={11} /> {item.student} · เลขที่ {item.no}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Icon name="calendar" size={11} /> {item.date}</p>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-slate-400 text-sm">ไม่พบรายการที่ตรงกับเกณฑ์</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}