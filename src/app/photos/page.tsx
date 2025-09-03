import { Camera } from "lucide-react"
import Link from "next/link"

export default function MemoriesPage() {
  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-6 h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[#0a0a0a] text-lg font-medium mb-2">思い出一覧</h2>
              <p className="text-[#737373] text-sm">写真を見返す</p>
            </div>
            <Link href="/" className="text-[#737373] hover:text-[#0a0a0a] text-sm">
              戻る
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#e5e5e5] rounded-lg aspect-square flex items-center justify-center hover:bg-[#d9d9d9] transition-colors cursor-pointer"
              >
                <Camera className="w-6 h-6 text-[#737373]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
