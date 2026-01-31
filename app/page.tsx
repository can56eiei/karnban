"use client";
import { useState, useMemo, ReactNode } from "react";
// หมายเหตุ: ในโปรเจกต์จริงต้องติดตั้ง @uploadthing/react และ uploadthing
// import { UploadButton } from "@/utils/uploadthing"; 

// ─── TYPES ───────────────────────────────────────────────────────────────────
type StatusType = "pending" | "approved" | "rejected";
type IconName =
  | "check" | "x" | "clock" | "shield" | "eye" | "plus"
  | "logout" | "copy" | "user" | "book" | "calendar"
  | "filter" | "search" | "upload" | "arrow_left" | "trash" | "lock" | "image" | "loader";

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

// ─── ICONS (inline SVG) ──────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }: IconProps) => {
  const paths: Record<IconName, ReactNode> = {
    check: <><path d="M20 6L9 17l-5-5" /></>,
    x: <><path d="M18 6 6 18M6 6l12 12" /></>,
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
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    loader: <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// ─── PLACEHOLDER FOR UPLOADTHING COMPONENT ──────────────────────────────────
// ในโปรเจกต์จริง ให้ใช้คอมโพเนนต์จาก UploadThing
const MockUploadButton = ({ onClientUploadComplete, onUploadError }: any) => {
  const [uploading, setUploading] = useState(false);
  
  const simulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const mockUrl = `https://utfs.io/f/mock-id-${Date.now()}.png`;
      onClientUploadComplete([{ url: mockUrl }]);
      setUploading(false);
    }, 1500);
  };

  return (
    <button 
      onClick={simulateUpload}
      disabled={uploading}
      className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl mb-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition overflow-hidden disabled:opacity-50"
    >
      {uploading ? (
        <Icon name="loader" size={24} className="text-blue-500 animate-spin" />
      ) : (
        <>
          <Icon name="upload" size={24} className="text-slate-300 mb-1" />
          <span className="text-xs text-slate-400 font-medium">อัปโหลดรูปภาพผ่าน UploadThing</span>
        </>
      )}
    </button>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function HomeworkHost() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("browse");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [detailItem, setDetailItem] = useState<Submission | null>(null);
  const [adminTab, setAdminTab] = useState("pending");
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const submitNew = () => {
    if (!newForm.title || !newForm.student || !uploadedImageUrl) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดรูปภาพ");
        return;
    }
    
    setSubmissions((prev) => [
      {
        id: Date.now(),
        ...newForm,
        status: "pending",
        date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
        thumb: uploadedImageUrl,
      },
      ...prev,
    ]);
    
    setNewForm({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
    setUploadedImageUrl(null);
    setShowUploadForm(false);
  };

  const getCat = (id: string): Category => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation & Layout Logic (Same as before) */}
      <nav className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-10">
        <span className="font-bold text-xl text-blue-600">HW-Store</span>
        <button onClick={() => setIsAdmin(!isAdmin)} className="text-sm px-3 py-1 bg-slate-100 rounded">
            {isAdmin ? "Admin Mode" : "User Mode"}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {isAdmin && (
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold">จัดการใบงาน</h2>
                <button 
                    onClick={() => setShowUploadForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <Icon name="plus" size={16} /> เพิ่มใบงาน
                </button>
            </div>
        )}

        {showUploadForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h3 className="font-bold text-lg mb-4">ส่งใบงานใหม่</h3>
                    
                    <div className="space-y-3 mb-4">
                        <input 
                            placeholder="หัวข้อใบงาน" 
                            className="w-full border p-2 rounded"
                            value={newForm.title}
                            onChange={e => setNewForm({...newForm, title: e.target.value})}
                        />
                        <input 
                            placeholder="ชื่อนักเรียน" 
                            className="w-full border p-2 rounded"
                            value={newForm.student}
                            onChange={e => setNewForm({...newForm, student: e.target.value})}
                        />
                    </div>

                    {/* Upload Section */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-slate-500 block mb-1">รูปภาพใบงาน (UploadThing)</label>
                        {uploadedImageUrl ? (
                            <div className="relative rounded-xl overflow-hidden h-32 border">
                                <img src={uploadedImageUrl} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => setUploadedImageUrl(null)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                >
                                    <Icon name="x" size={12} />
                                </button>
                            </div>
                        ) : (
                            <MockUploadButton 
                                onClientUploadComplete={(res: any) => {
                                    setUploadedImageUrl(res[0].url);
                                }}
                                onUploadError={(error: Error) => {
                                    alert(`ERROR! ${error.message}`);
                                }}
                            />
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={submitNew} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">บันทึก</button>
                        <button onClick={() => setShowUploadForm(false)} className="px-4 py-2 bg-slate-100 rounded-lg">ยกเลิก</button>
                    </div>
                </div>
            </div>
        )}

        {/* Display List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm">
                    <img src={item.thumb} className="w-full h-40 object-cover rounded-lg mb-3" />
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.student} - {item.class}</p>
                </div>
            ))}
            {submissions.length === 0 && <p className="text-center col-span-2 text-slate-400 py-10">ยังไม่มีข้อมูลใบงาน</p>}
        </div>
      </main>
    </div>
  );
}
