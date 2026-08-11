'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
        <div className="text-6xl mb-6">📶</div>
        
        {/* Marathi Warning */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">इंटरनेट कनेक्शन नाही</h2>
        <p className="text-sm text-gray-500 mb-6">
          आपण सध्या ऑफलाइन आहात. कृपया आपले इंटरनेट चालू करा किंवा नेटवर्क कव्हरेज तपासा.
        </p>

        <hr className="w-full border-gray-100 mb-6" />

        {/* English Warning */}
        <h3 className="text-lg font-bold text-gray-700 mb-1">No Internet Connection</h3>
        <p className="text-xs text-gray-400 mb-6">
          You are currently offline. Critical portal features will sync automatically when connection restores.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-full transition"
        >
          पुन्हा प्रयत्न करा / Retry Connection
        </button>
      </div>
    </div>
  );
}
