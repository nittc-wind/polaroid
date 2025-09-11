import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ともだちチェキ",
    short_name: "ともだちチェキ",
    description: "フィルムカメラ風写真アプリで思い出をシェアしよう",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#390F0F",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["photography", "social"],
    lang: "ja",
    dir: "ltr",
    shortcuts: [
      {
        name: "写真を撮る",
        short_name: "カメラ",
        description: "新しい写真を撮影する",
        url: "/camera",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "QRコードスキャン",
        short_name: "スキャン",
        description: "QRコードをスキャンして写真を受け取る",
        url: "/scan",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
