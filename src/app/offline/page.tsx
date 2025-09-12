"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            オフラインです
          </h1>
          <p className="text-gray-600">
            インターネット接続を確認してから、もう一度お試しください。
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            再読み込み
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            戻る
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            このページはオフラインでも表示されます
          </p>
        </div>
      </div>
    </div>
  );
}
