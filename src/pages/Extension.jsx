import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AIChatWidget from "../components/AIChatWidget";

import { useState } from "react";

function Extension() {
  const [micMessage, setMicMessage] = useState("");
  const [micError, setMicError] = useState("");

  return (

    <div className="flex min-h-screen bg-[#edf4f1]">

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <div className="p-10">

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">

            Chrome Extension • v1.4

          </span>

          <h1 className="text-6xl font-bold mt-6">

            Capture every meeting,
            in any language.

          </h1>

          <p className="text-gray-500 mt-6 text-xl max-w-3xl">

            Download the MoM browser extension
            as a ZIP file, then install it
            manually in Chrome to automatically
            record, transcribe and structure
            every meeting.

          </p>

          <div className="flex flex-wrap gap-4 mt-8">

            <a
              href="/extensions/mom-extension.zip"
              download
              className="bg-green-600 text-white px-8 py-4 rounded-2xl inline-flex items-center justify-center"
            >
              Download Extension
            </a>

          </div>

          <div className="mt-10 max-w-4xl rounded-3xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Manual install in Chrome
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6 text-gray-600">
              <li>Download the ZIP file above and extract it to a folder on your computer.</li>
              <li>Open Chrome and go to <span className="font-semibold text-gray-900">chrome://extensions</span>.</li>
              <li>Turn on <span className="font-semibold text-gray-900">Developer mode</span>.</li>
              <li>Click <span className="font-semibold text-gray-900">Load unpacked</span> and select the extracted extension folder.</li>
              <li>Pin the extension from the Chrome toolbar to start using it.</li>
            </ol>
          </div>

          <div className="mt-6">

  {micMessage && (
    <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 inline-block">
      {micMessage}
    </div>
  )}

  {micError && (
    <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 inline-block">
      {micError}
    </div>
  )}

  <button
    onClick={async () => {

      setMicMessage("");
      setMicError("");

      try {

        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        setMicMessage("Microphone working.");

      } catch (err) {

        console.error(err);

        setMicError(err.message || "Unable to access microphone.");

      }

    }}
    className="bg-blue-600 text-white px-6 py-3 rounded-xl"
  >
    Test Microphone
  </button>

</div>

          <div className="grid grid-cols-4 gap-6 mt-12">

            <div className="bg-white p-6 rounded-3xl">

              <h2 className="font-bold text-xl">

                Live Capture

              </h2>

              <p className="text-gray-500 mt-3">

                Record audio from
                Google Meet,
                Zoom and Teams.

              </p>

            </div>

            <div className="bg-white p-6 rounded-3xl">

              <h2 className="font-bold text-xl">

                Multilingual

              </h2>

              <p className="text-gray-500 mt-3">

                English,
                Tamil,
                Tanglish support.

              </p>

            </div>

            <div className="bg-white p-6 rounded-3xl">

              <h2 className="font-bold text-xl">

                OCR Detection

              </h2>

              <p className="text-gray-500 mt-3">

                Detect meeting
                participants
                automatically.

              </p>

            </div>

            <div className="bg-white p-6 rounded-3xl">

              <h2 className="font-bold text-xl">

                AI Extraction

              </h2>

              <p className="text-gray-500 mt-3">

                Auto-generate
                summaries,
                action items
                and decisions.

              </p>

            </div>

          </div>
            <AIChatWidget />

        </div>

      </div>

    </div>

  );

}

export default Extension;