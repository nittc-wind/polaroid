import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-6 h-[600px] flex flex-col">
          <div className="flex-1">
            <h2 className="text-[#0a0a0a] text-xl font-medium mb-2">Title Text</h2>
            <p className="text-[#737373] text-sm mb-8">This is a card description.</p>
          </div>

          <div className="space-y-4">
            <Button className="w-full bg-[#737373] hover:bg-[#171717] text-white rounded-lg py-3">
              <Link href="/camera" className="block">写真を撮る</Link>
            </Button>
            
              <Button className="w-full bg-[#737373] hover:bg-[#171717] text-white rounded-lg py-3">
                <Link href="/photos" className="block">思い出</Link>
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
