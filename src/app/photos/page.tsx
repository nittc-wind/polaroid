import { Camera, Divide, ArrowLeft } from "lucide-react";
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
import { Button } from "@/components/ui/button";

export default function MemoriesPage() {
  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-3 flex flex-row items-center gap-2">
            <Button className="w-fit p-1" variant="ghost" asChild>
              <Link
                href="/"
                className="flex items-center text-[#737373] hover:text-[#0a0a0a]"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <CardTitle className="text-[#0a0a0a] text-base font-medium">
                思い出一覧
              </CardTitle>
              <CardDescription className="text-[#737373] text-xs">
                写真を見返す
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#e5e5e5] rounded-lg aspect-square flex items-center justify-center hover:bg-[#d9d9d9] transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#737373]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
