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
import { AuthGuard } from "@/components/auth/AuthGuard";

function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // カメラ起動
  const startCamera = async () => {
    setIsCameraLoading(true);
    setError(null);
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
      setError("カメラの使用を許可してください");
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

  // ページ読み込み時にカメラを自動起動
  useEffect(() => {
    startCamera();
  }, []);

  // 撮影
  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsUploading(true);
    setIsPhotoTaken(true); // 写真撮影後にカメラ映像を隠す
    setError(null);
    setUploadProgress("写真を準備中...");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setIsUploading(false);
      setError("Canvas の初期化に失敗しました");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) {
            setError("画像の生成に失敗しました");
            return;
          }

          setUploadProgress("画像をアップロード中...");
          const file = new File([blob], "photo.png", { type: "image/png" });
          const formData = new FormData();
          formData.append("image", file);

          const res = await fetch("/api/photos", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            // 新しいエラーレスポンス形式に対応
            try {
              const errorData = await res.json();
              if (errorData.error?.message) {
                setError(
                  `アップロードに失敗しました: ${errorData.error.message}`,
                );
              } else {
                setError("アップロードに失敗しました");
              }
            } catch {
              setError("アップロードに失敗しました");
            }
            return;
          }

          setUploadProgress("QRコードを生成中...");
          // 新しい成功レスポンス形式に対応
          const response = await res.json();
          if (!response.success || !response.data?.id) {
            setError("サーバーのレスポンスが不正です");
            return;
          }

          // response.data が実際の photo オブジェクト
          router.push(`/qr/${response.data.id}`);
        } catch (err) {
          console.error("アップロードエラー:", err);
          setError("アップロード中にエラーが発生しました");
        } finally {
          setIsUploading(false);
          setUploadProgress("");
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
            <Button variant="ghost" className="w-fit p-1" asChild>
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
                  className="w-full rounded-lg bg-white flex flex-col items-center justify-center p-4"
                  style={{
                    aspectRatio: "3/4",
                    maxWidth: "340px",
                    margin: "0 auto",
                  }}
                >
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div
                      className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center w-full"
                      style={{ aspectRatio: "1/1", maxWidth: "220px" }}
                    >
                      <div className="text-[#737373] text-sm">
                        QRコードを生成しています...
                      </div>
                    </div>
                  </div>
                  {/* 下余白（チェキ風） */}
                  <div className="w-full h-8" />
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
              {/* エラー表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 text-sm">{error}</div>
                  <Button
                    onClick={() => {
                      setError(null);
                      setIsPhotoTaken(false);
                      setUploadProgress("");
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-800 border-red-200 hover:bg-red-100"
                  >
                    再試行
                  </Button>
                </div>
              )}

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
              ) : isPhotoTaken && !error ? (
                // 撮影後の操作ボタン（エラーがない場合）
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsPhotoTaken(false);
                      setUploadProgress("");
                      setError(null);
                    }}
                    variant="outline"
                    className="flex-1 py-3"
                    disabled={isUploading}
                  >
                    撮り直し
                  </Button>
                </div>
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

// カメラページを認証ガードでラップ
function CameraPageWithAuth() {
  return (
    <AuthGuard>
      <CameraPage />
    </AuthGuard>
  );
}

export default CameraPageWithAuth;
