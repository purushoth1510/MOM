import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SettingsForm from "../components/SettingsForm";
import ToggleSwitch from "../components/ToggleSwitch";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../services/api";

const API_URL = "http://localhost:8000";

function Settings() {
  const navigate = useNavigate();

  const authEmail = localStorage.getItem("email") || "";

  const [capture, setCapture] = useState(true);
  const [transcript, setTranscript] = useState(true);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesError, setPreferencesError] = useState("");

  useEffect(() => {
    if (!authEmail) {
      setPreferencesLoading(false);
      return;
    }

    let cancelled = false;

    const loadSettings = async () => {
      setPreferencesLoading(true);
      setPreferencesError("");

      try {
        const response = await fetchWithAuth(
          `${API_URL}/api/settings/${authEmail}`
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || "Unable to load preferences.");
        }

        const data = await response.json();

        if (cancelled) return;

        setCapture(data.capture ?? true);
        setTranscript(data.transcript ?? true);
      } catch (err) {
        if (!cancelled) {
          setPreferencesError(err.message || "Unable to load preferences.");
        }
      } finally {
        if (!cancelled) {
          setPreferencesLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [authEmail]);

  const saveSettings = async (newCapture, newTranscript) => {
    setPreferencesError("");

    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/settings/${authEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            capture: newCapture,
            transcript: newTranscript,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Unable to save preferences.");
      }
    } catch (err) {
      setPreferencesError(err.message || "Unable to save preferences.");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold">Settings</h1>

            <button
              onClick={() => {
                localStorage.removeItem("username");
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                localStorage.removeItem("role");

                navigate("/");
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <SettingsForm />

          <div className="bg-white p-8 rounded-3xl mt-10">
            <h2 className="text-2xl font-bold mb-2">Preferences</h2>
            <p className="text-gray-500 mb-6">
              These settings apply only to your account.
            </p>

            {preferencesLoading && (
              <p className="text-gray-500 mb-6">Loading preferences...</p>
            )}

            {preferencesError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                {preferencesError}
              </div>
            )}

            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h2 className="font-bold">Auto Capture Meetings</h2>
                <p className="text-gray-500">
                  Start recording automatically
                </p>
              </div>

              <ToggleSwitch
                enabled={capture}
                disabled={preferencesLoading}
                setEnabled={(value) => {
                  setCapture(value);
                  saveSettings(value, transcript);
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-6">
              <div>
                <h2 className="font-bold">Tanglish Transcription</h2>
                <p className="text-gray-500">
                  Process Tamil-English speech
                </p>
              </div>

              <ToggleSwitch
                enabled={transcript}
                disabled={preferencesLoading}
                setEnabled={(value) => {
                  setTranscript(value);
                  saveSettings(capture, value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
