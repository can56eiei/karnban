"use client";
import { useState, useEffect, ReactNode, useRef } from "react";
import { database } from "@/app/utils/firebaseConfig"; 
import { ref, onValue, push, set, remove, update } from "firebase/database";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const IMGBB_API_KEY = "dec4b023feb1b19e4a8f67686a452f00";

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
    upload: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
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
  const [isSaving, setIsSaving] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const ADMIN_PASSWORD = "admin123";

  // ── 1. Real-time Sync ──
  useEffect(() => {
    if (!database) return;
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

  // ── 2. Image Upload with ImgBB ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadedImageUrl(result.data.url);
      } else {
        alert("อัปโหลดไม่สำเร็จ: " + result.error.message);
      }
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ ImgBB");
    } finally {
      setIsUploading(false);
    }
  };

  // ── 3. Actions ──
  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput("");
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isUploading || !database) return;
    if (!newForm.title.trim() || !newForm.student.trim() || !uploadedImageUrl) {
        alert("กรุณากรอกข้อมูลให้ครบและอัปโหลดรูปภาพครับ");
        return;
    }

    setIsSaving(true);
    try {
      const submissionsRef = ref(database, 'submissions');
      const newSubmissionRef = push(submissionsRef);
      await set(newSubmissionRef, {
        ...newForm,
        status: "pending",
        date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
        thumb: uploadedImageUrl,
      });
      setNewForm({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
      setUploadedImageUrl(null);
      setShowUploadForm(false);
      alert("ส่งใบงานสำเร็จแล้ว!");
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = (id: string, newStatus: StatusType) => {
    if (!database) return;
    const itemRef = ref(database, `submissions/${id}`);
    update(itemRef, { status: newStatus });
  };

  const deleteItem = (id: string) => {
    if (!database) return;
    if (confirm("ยืนยันการลบใบงานนี้?")) {
      const itemRef = ref(database, `submissions/${id}`);
      remove(itemRef);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl text-blue-600">
            <div className="bg-blue-600 text-white p-1 rounded-lg"><Icon name="check" size={20} /></div>
            <span>HW-STORE</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button onClick={() => setIsAdmin(false)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-600 flex items-center gap-1">
                <Icon name="logout" size={12} /> ออกจากระบบ
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Icon name="lock" size={12} /> ADMIN
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">ใบงานที่ส่งแล้ว</h2>
            <p className="text-slate-500 text-sm">อัปเดต Real-time ด้วย Firebase</p>
          </div>
          <button onClick={() => setShowUploadForm(true)} className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Icon name="plus" size={20} /> ส่งใบงานใหม่
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-56 overflow-hidden">
                <img src={item.thumb} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.title} />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-lg ${
                    item.status === 'approved' ? 'bg-green-500 text-white' : 
                    item.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {item.status === 'approved' ? 'อนุมัติแล้ว' : item.status === 'rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{item.student} · {item.class} · เลขที่ {item.no}</p>
                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <button onClick={() => updateStatus(item.id, 'approved')} className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl font-bold text-xs hover:bg-green-600 hover:text-white transition-colors">อนุมัติ</button>
                    <button onClick={() => updateStatus(item.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-colors">ปฏิเสธ</button>
                    <button onClick={() => deleteItem(item.id)} className="px-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"><Icon name="trash" size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal: Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-6">Admin Login</h3>
            <input type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 mb-4 focus:border-blue-500 outline-none transition-all" placeholder="รหัสผ่าน: admin123" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">เข้าสู่ระบบ</button>
          </div>
        </div>
      )}

      {/* Modal: Upload Form */}
      {showUploadForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSaving && setShowUploadForm(false)}></div>
          <form onSubmit={submitNew} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">ส่งใบงานใหม่</h3>
                <button type="button" onClick={() => setShowUploadForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Icon name="x" size={24} /></button>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">หัวข้อใบงาน *</label>
                    <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none" placeholder="เช่น การทดลองเรื่องแรง" value={newForm.title} onChange={e => setNewForm({...newForm, title: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">ชื่อนักเรียน *</label>
                    <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none" placeholder="ชื่อ-นามสกุล" value={newForm.student} onChange={e => setNewForm({...newForm, student: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">ห้อง</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none" value={newForm.class} onChange={e => setNewForm({...newForm, class: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">เลขที่</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none" placeholder="21" value={newForm.no} onChange={e => setNewForm({...newForm, no: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-1">รูปภาพใบงาน *</label>
                  {uploadedImageUrl ? (
                    <div className="relative group rounded-3xl overflow-hidden aspect-video border-4 border-blue-50 shadow-inner">
                      <img src={uploadedImageUrl} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setUploadedImageUrl(null)} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-all"><Icon name="x" size={16} /></button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border-4 border-dashed border-slate-100 rounded-[2rem] p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                    >
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <Icon name="loader" size={32} className="text-blue-500 animate-spin" />
                          <p className="text-blue-500 font-bold">กำลังอัปโหลดรูปภาพ...</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform"><Icon name="upload" size={32} className="text-blue-600" /></div>
                          <p className="text-slate-500 font-bold">คลิกเพื่อเลือกรูปภาพ</p>
                          <p className="text-slate-400 text-[10px] mt-1">อัปโหลดผ่าน ImgBB (ฟรี)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-4">
              <button type="button" onClick={() => setShowUploadForm(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">ยกเลิก</button>
              <button type="submit" disabled={isUploading || isSaving} className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-xl transition-all ${isUploading || isSaving ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                {isSaving ? 'กำลังบันทึก...' : 'ส่งใบงานทันที'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
