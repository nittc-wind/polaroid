"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DevelopPage() {
  const params = useParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isDeveloping, setIsDeveloping] = useState(true);

  useEffect(() => {
    // 60秒かけて現像
    const duration = 60000; // 60秒
    const interval = 100; // 100msごとに更新
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsDeveloping(false);
          // 完了画面へ自動遷移
          setTimeout(() => {
            router.push(`/complete/${params.id}`);
          }, 1000);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [params.id, router]);

  return (
    <div>
      <h1>現像中...</h1>
      <p>チェキを現像しています。しばらくお待ちください。</p>

      <div>
        {/* プログレスバー */}
        <div
          style={{
            width: "300px",
            height: "30px",
            border: "1px solid black",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#4CAF50",
              transition: "width 0.1s",
            }}
          />
        </div>
        <p>{Math.round(progress)}%</p>
      </div>

      <div>
        {/* 現像中のアニメーション表示エリア */}
        <div
          style={{
            width: "300px",
            height: "400px",
            border: "2px solid black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: progress / 100,
          }}
        >
          <p>写真が徐々に現れます...</p>
        </div>
      </div>

      {!isDeveloping && (
        <div>
          <p>現像が完了しました！</p>
        </div>
      )}
    </div>
  );
}
