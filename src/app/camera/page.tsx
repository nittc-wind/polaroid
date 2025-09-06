"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUserId } from "@/lib/util";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  // カメラ起動
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream; // ストリームを保存
        setIsStreamReady(true);
      }
    } catch (err) {
      console.error("カメラの起動に失敗しました:", err);
      alert("カメラの使用を許可してください");
    }
  };

  // カメラ停止
  const stopCamera = () => {
    if (streamRef.current) {
      // すべてのトラックを停止
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreamReady(false);
  };

  // コンポーネントがアンマウントされる時にカメラを停止
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  // 撮影
  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) {
            alert("画像の生成に失敗しました");
            return;
          }

          const file = new File([blob], "photo.png", { type: "image/png" });
          const formData = new FormData();
          formData.append("image", file);

          const deviceId = generateUserId();

          const res = await fetch("/api/photos", {
            method: "POST",
            headers: {
              "x-device-id": deviceId,
            },
            body: formData,
          });

          if (!res.ok) {
            console.error("アップロードに失敗しました:", await res.text());
            alert("アップロードに失敗しました");
            return;
          }

          const photo = await res.json();
          if (!photo?.id) {
            alert("サーバーのレスポンスが不正です");
            return;
          }

          router.push(`/qr/${photo.id}`);
        } catch (err) {
          console.error("アップロードエラー:", err);
          alert("アップロード中にエラーが発生しました");
        }
      },
      "image/png",
      0.92,
    );
  };
  return (
    <div className="container min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="inner w-full max-w-md mx-auto">
        <Card className="card">
          <CardHeader>
            <Button variant="ghost" className="w-fit p-2" asChild>
              <Link
                href="/"
                className="flex items-center text-[#737373] hover:text-[#0a0a0a] text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Link>
            </Button>
            <CardTitle className="text-[#0a0a0a] text-lg font-medium">
              写真を撮る
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              カメラで撮影してください
            </CardDescription>
          </CardHeader>
          <CardContent className="card-body">
            <div className="mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ maxWidth: "400px", aspectRatio: "4/3" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <div className="flex flex-col gap-3">
              {!isStreamReady ? (
                <Button onClick={startCamera} className="button">
                  <Camera className="w-4 h-4 mr-2" />
                  カメラを起動
                </Button>
              ) : (
                <Button onClick={capture} className="button">
                  <Camera className="w-4 h-4 mr-2" />
                  撮影する
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
