import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-6 max-h-[85vh] flex flex-col">
          <CardHeader className="p-0 mb-6 text-center">
            <CardTitle className="text-[#331515] text-xl font-medium mb-2">
              ともだちチェキ
            </h2>
            <p className="text-[#737373] text-sm mb-8">新しい名刺交換の形</p>
          </div>

          <div className="flex flex-col gap-6">
            <Button className="button" asChild>
              <Link href="/camera">写真を撮る</Link>
            </Button>

            <Button className="button" asChild>
              <Link href="/photos">思い出</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
