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
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUserId } from "@/lib/util";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);

  // カメラ起動
  const startCamera = async () => {
    setIsCameraLoading(true);
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
    } finally {
      setIsCameraLoading(false);
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

    setIsUploading(true);
    setIsPhotoTaken(true); // 写真撮影後にカメラ映像を隠す

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setIsUploading(false);
      return;
    }

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
        } finally {
          setIsUploading(false);
        }
      },
      "image/png",
      0.92,
    );
  };
  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-3 flex flex-row items-center gap-2">
            <Button variant="ghost" className="w-fit p-1">
              <Link
                href="/"
                className="flex items-center text-[#737373] hover:text-[#0a0a0a]"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <CardTitle className="text-[#0a0a0a] text-base font-medium">
                写真を撮る
              </CardTitle>
              <CardDescription className="text-[#737373] text-xs">
                カメラで撮影してください
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            <div className="mb-4 flex-1">
              {isPhotoTaken ? (
                <div
                  className="w-full rounded-lg bg-white flex items-center justify-center"
                  style={{
                    maxWidth: "100%",
                    aspectRatio: "4/3",
                    maxHeight: "40vh",
                  }}
                >
                  <div className="text-[#737373] text-sm">
                    QRコードを生成しています...
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                  style={{
                    maxWidth: "100%",
                    aspectRatio: "4/3",
                    maxHeight: "40vh",
                  }}
                />
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
            <div className="flex flex-col gap-3">
              {!isStreamReady ? (
                <Button
                  onClick={startCamera}
                  disabled={isCameraLoading}
                  className="w-full bg-[#603736] hover:bg-[#331515] text-white py-3 disabled:opacity-50"
                >
                  {isCameraLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      起動中...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      カメラを起動
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={capture}
                  disabled={isUploading}
                  className="w-full bg-[#603736] hover:bg-[#331515] text-white py-3 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      撮影する
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
