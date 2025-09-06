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
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              新しい名刺交換の形
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center p-0">
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#603736] hover:bg-[#331515] text-white py-2 text-sm"
                asChild
              >
                <Link href="/camera" className="block w-full">
                  写真を撮る
                </Link>
              </Button>
              <Button
                className="flex-1 bg-[#603736] hover:bg-[#331515] text-white py-2 text-sm"
                asChild
              >
                <Link href="/photos" className="block w-full">
                  思い出
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
