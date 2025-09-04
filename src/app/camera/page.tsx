"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateUserId } from "@/lib/util";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  // カメラ起動
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamReady(true);
      }
    } catch (err) {
      console.error("カメラの起動に失敗しました:", err);
      alert("カメラの使用を許可してください");
    }
  };

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
    <div>
      <h1>写真を撮る</h1>

      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="100%"
          style={{ maxWidth: "500px" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div>
        {!isStreamReady ? (
          <button onClick={startCamera}>カメラを起動</button>
        ) : (
          <button onClick={capture}>撮影する</button>
        )}
      </div>

      <div>
        <Link href="/">ホームに戻る</Link>
      </div>
    </div>
  );
}
