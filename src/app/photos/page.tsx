import { Camera, Divide ,ArrowLeft} from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MemoriesPage() {
  return (
    <div className="container">
      <div className="inner">
        <Card className="card">
          <CardContent className="card-body">
            <div>
                <Button variant="ghost">
                  <Link href="/" className="flex items-center text-[#737373] hover:text-[#0a0a0a] text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                  </Link>
                </Button>
              <h2 className="text-[#0a0a0a] text-lg font-medium mb-2">思い出一覧</h2>
              <p className="text-[#737373] text-sm">写真を見返す</p>
            </div>
          </CardContent>

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
        </Card>
      </div>
    </div>
  )
}
