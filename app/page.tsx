"use client";
import { useState, useEffect, ReactNode } from "react";
import { database } from "@/app/utils/firebaseConfig"; 
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type StatusType = "pending" | "approved" | "rejected";
interface Submission {
  id: string;
  title: string;
  student: string;
  class: string;
  no: number | string;
  category: string;
  status: StatusType;
  date: string;
  thumb: string;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }: { name: string, size?: number, className?: string }) => {
  const paths: Record<string, ReactNode> = {
    check: <path d="M20 6L9 17l-5-5" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2-2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>,
    logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
    loader: <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function HomeworkRealtime() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });

  // ── Admin Login State ──
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const ADMIN_PASSWORD = "admin123";

  // ── 1. Real-time Sync with Firebase ──
  useEffect(() => {
    const submissionsRef = ref(database, 'submissions');
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        })).reverse();
        setSubmissions(list);
      } else {
        setSubmissions([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── 2. Actions ──
  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput("");
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const submitNew = async () => {
    // ตรวจสอบข้อมูล
    if (!newForm.title.trim()) return alert("กรุณาใส่หัวข้อใบงาน");
    if (!newForm.student.trim()) return alert("กรุณาใส่ชื่อนักเรียน");
    if (!uploadedImageUrl) return alert("กรุณาอัปโหลดรูปภาพให้เสร็จสิ้นก่อนส่ง");

    try {
      const submissionsRef = ref(database, 'submissions');
      const newSubmissionRef = push(submissionsRef);
      
      await set(newSubmissionRef, {
        ...newForm,
        status: "pending",
        date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
        thumb: uploadedImageUrl,
      });

      // Reset Form
      setNewForm({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
      setUploadedImageUrl(null);
      setShowUploadForm(false);
      alert("ส่งใบงานสำเร็จแล้ว!");
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const updateStatus = (id: string, newStatus: StatusType) => {
    const itemRef = ref(database, `submissions/${id}`);
    update(itemRef, { status: newStatus });
  };

  const deleteItem = (id: string) => {
    if (confirm("ยืนยันการลบใบงานนี้?")) {
      const itemRef = ref(database, `submissions/${id}`);
      remove(itemRef);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Icon name="check" size={20} /></div>
            <h1 className="text-xl font-bold text-slate-800">HW-Store</h1>
        </div>
        <div className="flex gap-2">
            {!isAdmin ? (
                <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                    <Icon name="lock" size={14} /> เข้า Admin
                </button>
            ) : (
                <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition">
                    <Icon name="logout" size={14} /> ออกจากระบบ
                </button>
            )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-700">รายการใบงาน</h2>
            <button onClick={() => setShowUploadForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
                <Icon name="plus" size={18} /> ส่งใบงานใหม่
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm group">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img src={item.thumb} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={item.title} />
                        <div className="absolute top-3 right-3">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm ${
                                item.status === 'approved' ? 'bg-green-500 text-white' : 
                                item.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                                {item.status === 'approved' ? 'อนุมัติแล้ว' : item.status === 'rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-slate-800 truncate mb-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 mb-4">{item.student} · {item.class} · เลขที่ {item.no}</p>
                        
                        {isAdmin && (
                            <div className="flex gap-2 border-t pt-3">
                                <button onClick={() => updateStatus(item.id, 'approved')} className="flex-1 bg-green-50 text-green-600 text-xs font-bold py-2 rounded-lg hover:bg-green-100 transition">อนุมัติ</button>
                                <button onClick={() => updateStatus(item.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-lg hover:bg-red-100 transition">ปฏิเสธ</button>
                                <button onClick={() => deleteItem(item.id)} className="bg-slate-100 text-slate-500 p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition"><Icon name="trash" size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {submissions.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-400">ยังไม่มีข้อมูลใบงานในขณะนี้</p>
                </div>
            )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">เข้าสู่โหมด Admin</h3>
                <p className="text-sm text-slate-500 mb-6">กรุณาใส่รหัสผ่านเพื่อจัดการข้อมูล</p>
                <input 
                    type="password" 
                    placeholder="รหัสผ่าน" 
                    className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 mb-4 focus:border-blue-500 outline-none transition"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">เข้าสู่ระบบ</button>
                    <button onClick={() => setShowLoginModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition">ยกเลิก</button>
                </div>
            </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-extrabold text-slate-800 mb-6">ส่งใบงานใหม่</h3>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">หัวข้อใบงาน *</label>
                        <input placeholder="เช่น ใบงานเรื่องแรง" className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 focus:border-blue-500 outline-none transition" value={newForm.title} onChange={e => setNewForm({...newForm, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">ชื่อนักเรียน *</label>
                        <input placeholder="ชื่อ-นามสกุล" className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 focus:border-blue-500 outline-none transition" value={newForm.student} onChange={e => setNewForm({...newForm, student: e.target.value})} />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">ห้อง</label>
                            <input className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 focus:border-blue-500 outline-none transition" value={newForm.class} onChange={e => setNewForm({...newForm, class: e.target.value})} />
                        </div>
                        <div className="w-24">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">เลขที่</label>
                            <input placeholder="21" className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 focus:border-blue-500 outline-none transition" value={newForm.no} onChange={e => setNewForm({...newForm, no: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">รูปภาพใบงาน *</label>
                    {uploadedImageUrl ? (
                        <div className="relative rounded-2xl overflow-hidden h-40 border-2 border-blue-100">
                            <img src={uploadedImageUrl} className="w-full h-full object-cover" />
                            <button onClick={() => setUploadedImageUrl(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition"><Icon name="x" size={14} /></button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Icon name="loader" size={24} className="text-blue-500 animate-spin" />
                                    <p className="text-sm text-blue-500 font-bold">กำลังอัปโหลดรูปภาพ...</p>
                                </div>
                            ) : (
                                <UploadButton<OurFileRouter, "imageUploader">
                                    endpoint="imageUploader"
                                    onUploadBegin={() => setIsUploading(true)}
                                    onClientUploadComplete={(res) => {
                                        setIsUploading(false);
                                        setUploadedImageUrl(res[0].url);
                                    }}
                                    onUploadError={(error: Error) => {
                                        setIsUploading(false);
                                        alert(`เกิดข้อผิดพลาด: ${error.message}`);
                                    }}
                                    content={{
                                        button({ ready }) {
                                          if (ready) return "เลือกรูปภาพ";
                                          return "กำลังโหลด...";
                                        },
                                        allowedContent: "รูปภาพ (สูงสุด 4MB)"
                                    }}
                                    appearance={{
                                        button: "bg-blue-600 px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all",
                                        allowedContent: "text-[10px] text-slate-400 mt-2"
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={submitNew} 
                        disabled={isUploading}
                        className={`flex-1 py-4 rounded-2xl font-bold shadow-lg transition ${
                            isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isUploading ? 'รออัปโหลดรูปภาพ...' : 'ส่งใบงาน'}
                    </button>
                    <button 
                        onClick={() => { setShowUploadForm(false); setUploadedImageUrl(null); setIsUploading(false); }} 
                        className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition"
                    >
                        ยกเลิก
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
