interface LocationResult {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  display_name?: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ja`,
      {
        headers: {
          "User-Agent": "Polaroid-App/1.0", // 必須: User-Agentヘッダー
        },
      },
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    if (data.error) {
      return null;
    }

    const address = data.address;

    // 日本の場合の市町村レベル取得
    const city =
      address.city || address.town || address.village || address.county;
    const prefecture = address.state;

    if (city && prefecture) {
      return `${prefecture}${city}`;
    } else if (city) {
      return city;
    } else if (data.display_name) {
      // フォールバック: 表示名から都市部分を抽出
      const parts = data.display_name.split(",");
      return parts.slice(0, 2).join(",").trim();
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
