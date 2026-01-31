"use client";
import { useState } from "react";
import { UploadButton } from "./utils/uploadthing"; // ใช้ ./ แทน @/ เพื่อความชัวร์
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  User, 
  Copy, 
  Check, 
  LogOut,
  LayoutDashboard
} from "lucide-react";

export default function HomeworkHost() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // ทดสอบ UI ในโหมด Admin

  const copyLink = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* --- Navigation Bar --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">HW-Store</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <User size={14} /> Admin Mode
              </div>
            ) : (
              <button className="text-sm font-semibold hover:text-blue-600 transition">Login</button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* --- Header Section --- */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">คลังฝากการบ้าน</h1>
          <p className="text-slate-500">จัดการและแชร์รูปภาพการบ้านของคุณได้ในที่เดียว</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* --- Left Column: Upload Zone (Admin Only) --- */}
          {isAdmin && (
            <section className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                  <Plus size={18} />
                  <span>อัปโหลดการบ้านใหม่</span>
                </div>
                
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 hover:bg-slate-100/50 transition-all flex flex-col items-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res) setImageUrl(res[0].url);
                    }}
                    onUploadError={(error) => alert(error.message)}
                  />
                  <p className="mt-4 text-xs text-slate-400 text-center">
                    รองรับไฟล์ JPG, PNG (สูงสุด 4MB)
                  </p>
                </div>

                {imageUrl && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                      <Check size={14} /> อัปโหลดสำเร็จ!
                    </p>
                    <div className="flex items-center gap-2 bg-white border border-green-200 p-2 rounded-lg">
                      <input 
                        readOnly 
                        value={imageUrl} 
                        className="bg-transparent flex-1 text-xs text-slate-600 outline-none truncate"
                      />
                      <button onClick={copyLink} className="p-1.5 hover:bg-slate-100 rounded">
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* --- Right Column: Homework List --- */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LayoutDashboard size={20} className="text-blue-600" />
                รายการการบ้านล่าสุด
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* ตัวอย่าง Homework Card */}
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all">
                  <div className="aspect-video bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <BookOpen size={40} opacity={0.3} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">วิชาฟิสิกส์</span>
                      <span className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Calendar size={10} /> 31 ม.ค. 2026
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">ใบงานเรื่องงานและพลังงาน</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">ม.4/8 เลขที่ 21 - ณพล วิรัชติ</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}