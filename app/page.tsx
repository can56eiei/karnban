"use client";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { database } from "@/app/utils/firebaseConfig"; 
import { ref, onValue, push, set, remove, update } from "firebase/database";
// import { UploadButton } from "@/utils/uploadthing"; // ในโปรเจกต์จริงใช้ตัวนี้

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

// ─── ICONS & HELPER COMPONENTS (เหมือนเดิม) ──────────────────────────────────
const Icon = ({ name, size = 18, className = "" }: { name: string, size?: number, className?: string }) => {
    // ... (SVG Paths เหมือนเดิม)
    return <svg width={size} height={size} className={className}>/* paths */</svg>;
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function HomeworkRealtime() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });

  // ── 1. Real-time Sync with Firebase ──
  useEffect(() => {
    const submissionsRef = ref(database, 'submissions');
    // ฟังการเปลี่ยนแปลงของข้อมูล (Real-time)
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // แปลง Object จาก Firebase เป็น Array
        const list = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        })).reverse(); // เอาอันใหม่ขึ้นก่อน
        setSubmissions(list);
      } else {
        setSubmissions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── 2. Actions with Firebase ──
  const submitNew = async () => {
    if (!newForm.title || !newForm.student || !uploadedImageUrl) {
        alert("กรุณากรอกข้อมูลและอัปโหลดรูป");
        return;
    }

    const submissionsRef = ref(database, 'submissions');
    const newSubmissionRef = push(submissionsRef); // สร้าง ID ใหม่ใน Firebase
    
    await set(newSubmissionRef, {
      ...newForm,
      status: "pending",
      date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
      thumb: uploadedImageUrl,
    });

    setNewForm({ title: "", student: "", class: "ม.4/8", no: "", category: "physics" });
    setUploadedImageUrl(null);
    setShowUploadForm(false);
  };

  const updateStatus = (id: string, newStatus: StatusType) => {
    const itemRef = ref(database, `submissions/${id}`);
    update(itemRef, { status: newStatus });
  };

  const deleteItem = (id: string) => {
    const itemRef = ref(database, `submissions/${id}`);
    remove(itemRef);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-600">HW-Store (Real-time)</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} className="bg-white border px-4 py-2 rounded-lg shadow-sm">
            {isAdmin ? "โหมดผู้ดูแล" : "โหมดนักเรียน"}
        </button>
      </header>

      {isAdmin && (
        <div className="mb-6">
            <button 
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
            >
                + เพิ่มใบงานใหม่
            </button>
        </div>
      )}

      {/* Grid แสดงผล (ทุกคนจะเห็นเหมือนกันทันที) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {submissions.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm transition hover:shadow-md">
            <img src={item.thumb} className="w-full h-48 object-cover" alt={item.title} />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                    {item.status === 'approved' ? 'อนุมัติแล้ว' : item.status === 'rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{item.student} · {item.class} · เลขที่ {item.no}</p>
              
              {isAdmin && (
                <div className="mt-4 flex gap-2 border-t pt-3">
                  <button onClick={() => updateStatus(item.id, 'approved')} className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded">อนุมัติ</button>
                  <button onClick={() => updateStatus(item.id, 'rejected')} className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded">ปฏิเสธ</button>
                  <button onClick={() => deleteItem(item.id)} className="bg-slate-100 text-slate-600 px-2 rounded">ลบ</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal (เหมือนเดิมแต่เปลี่ยนไปใช้ Firebase submit) */}
      {/* ... (Code Form เหมือนเวอร์ชันก่อนหน้า) */}
    </div>
  );
}
