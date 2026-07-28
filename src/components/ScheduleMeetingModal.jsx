import React, { useState } from "react";
import { createScheduledMeeting } from "../services/api";

function ScheduleMeetingModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("PM");
  const [agenda, setAgenda] = useState("");
  const [participants, setParticipants] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalHour = parseInt(hour, 10);
      if (ampm === "PM" && finalHour !== 12) finalHour += 12;
      if (ampm === "AM" && finalHour === 12) finalHour = 0;
      const finalTime = `${finalHour.toString().padStart(2, '0')}:${minute}`;

      await createScheduledMeeting({
        title,
        date,
        time: finalTime,
        agenda,
        participants,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-gray-800">Schedule Meeting</h2>
        
        {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              placeholder="E.g., Project Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                min={today}
                className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select
                  className="w-1/3 border-gray-300 rounded-xl px-2 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => {
                    const h = (i + 1).toString().padStart(2, '0');
                    return <option key={h} value={h}>{h}</option>;
                  })}
                </select>
                <span className="self-center font-bold text-gray-400">:</span>
                <select
                  className="w-1/3 border-gray-300 rounded-xl px-2 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                >
                  {[...Array(60)].map((_, i) => {
                    const m = i.toString().padStart(2, '0');
                    return <option key={m} value={m}>{m}</option>;
                  })}
                </select>
                <select
                  className="w-1/3 border-gray-300 rounded-xl px-2 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  value={ampm}
                  onChange={(e) => setAmpm(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda / Description (Optional)</label>
            <textarea
              rows="3"
              className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
              placeholder="What is this meeting about?"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participants (Optional)</label>
            <input
              type="text"
              className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white border focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              placeholder="Comma-separated emails"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Invites will be sent to these emails.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Scheduling..." : "Schedule Meeting"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ScheduleMeetingModal;
