import React, { useState } from "react";

function ViewScheduledMeetingModal({ meeting, onClose, onDelete, onFinish }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!meeting) return null;

  const userRole = localStorage.getItem("role") || "employee";
  const creatorRole = meeting.creator_role || "employee";
  const userEmail = localStorage.getItem("email") || "";
  
  let canDelete = true;
  if (meeting.user_email !== userEmail) {
     if (creatorRole === "super_admin" && userRole !== "super_admin") {
         canDelete = false;
     }
     if (creatorRole === "admin" && userRole === "employee") {
         canDelete = false;
     }
     if (creatorRole === "employee" && userRole === "employee") {
         canDelete = false;
     }
  }

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hourStr, minuteStr] = timeString.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 
    return `${hour}:${minuteStr} ${ampm}`;
  };

  const getDynamicStatus = (meeting) => {
    if (meeting.status === 'Finished') return 'Finished';

    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.time}:00`);
    const diffMins = (now - meetingDate) / (1000 * 60);

    if (diffMins >= 0 && diffMins <= 15) {
      return "Time for meeting";
    } else if (diffMins > 15) {
      return "Ended";
    }
    return meeting.status || 'Upcoming';
  };

  const status = getDynamicStatus(meeting);

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

        <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                status === 'Time for meeting' ? 'bg-green-100 text-green-700' : 
                status === 'Ended' || status === 'Finished' ? 'bg-gray-100 text-gray-600' : 
                'bg-blue-100 text-blue-700'
            }`}>
                {status}
            </span>
            <h2 className="text-3xl font-bold text-gray-800 leading-tight">{meeting.title}</h2>
        </div>

        <div className="space-y-4">
            <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mr-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                    <p className="text-gray-800 font-semibold">{meeting.date} at {formatTime(meeting.time)}</p>
                </div>
            </div>

            <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Agenda</p>
                    <p className="text-gray-800 mt-1">{meeting.agenda}</p>
                </div>
            </div>
            
            {meeting.participants && meeting.participants.length > 0 && (
                <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mr-4">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium mb-1">Participants</p>
                        <div className="flex flex-wrap gap-2">
                            {meeting.participants.map((email, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm break-all">
                                    {email}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="mt-8 border-t pt-4 flex justify-between items-center">
            {canDelete && (
                !showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Meeting
                </button>
            ) : (
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100 flex-1 mr-4">
                    <span className="text-sm font-medium text-red-800">Are you sure you want to delete this meeting?</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onDelete(meeting.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            ))}

            {status !== 'Finished' && !showConfirm && (
              <button
                onClick={() => onFinish(meeting.id)}
                className="text-green-600 hover:text-green-800 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Finished
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default ViewScheduledMeetingModal;
