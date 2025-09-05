import { Button } from "@/components/ui/button"
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

export default function HomePage() {
  return (
    <div className="container">
      <div className="inner">
        <Card className="card">
          <div className="card-body">
            <h2 className="text-[#0a0a0a] text-xl font-medium mb-2">ともだちチェキ</h2>
            <p className="text-[#737373] text-sm mb-8">新しい名刺交換の形</p>
          </div>

          <div className="flex flex-col gap-6">
            <Button className="button">
              <Link href="/camera" className="block">写真を撮る</Link>
            </Button>
            
            <Button className="button">
              <Link href="/photos" className="block">思い出</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
