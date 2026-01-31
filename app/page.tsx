"use client";
import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "./api/uploadthing/core";
import { Copy, Check } from "lucide-react";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleUploadComplete = (res: { url: string }[]) => {
    if (res) {
      setImageUrl(res[0].url);
      // เปิด visibility หลังจาก state อัพเডท เพื่อให้ transition ทำงานได้
      requestAnimationFrame(() => setVisible(true));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Image Hosting</h1>
        <p className="text-slate-500 mb-8">ฝากรูปฟรี รวดเร็ว พร้อมใช้งานทันที</p>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 bg-slate-50 mb-6 flex justify-center">
<UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            appearance={{
              button:
                "bg-slate-800 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-slate-700 transition-colors ut-uploading:opacity-50 ut-uploading:cursor-not-allowed",
              allowedContent: "text-slate-400 text-xs mt-2",
            }}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div>

        {/* Result Preview */}
        {imageUrl && (
          <div
            className="space-y-4 transition-all duration-500 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <div className="mx-auto max-w-sm">
              <img src={imageUrl} alt="Uploaded" className="rounded-lg shadow-md border" />
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-lg">
              <input
                readOnly
                value={imageUrl}
                className="bg-transparent flex-1 text-sm text-slate-600 outline-none overflow-hidden text-ellipsis"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white rounded-md transition-colors"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}