const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000/api";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token || ""}`,
    "Content-Type": "application/json"
  };
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    ...options,
    headers
  });
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Session expired. Redirecting to login...");
  }
  if (response.status === 403) {
    throw new Error("You do not have permission.");
  }
  return response;
};

export const startMeeting = async (
  data
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings/start`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

export const stopMeeting = async (
  meetingId
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings/stop`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        meeting_id: meetingId,
      }),
    }
  );

  return response.json();
};

export const uploadAudio = async (
  meetingId,
  audioBlob
) => {

  const formData =
    new FormData();

  if (meetingId) {
    formData.append(
      "meeting_id",
      meetingId
    );
  }

  formData.append(
    "file",
    audioBlob,
    "meeting.webm"
  );

  formData.append(
    "email",
    localStorage.getItem("email") || ""
  );

  const response = await fetchWithAuth(
    `${API_URL}/meetings/upload-audio`,
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
};

export const getSummary = async (
  meetingId
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings/${meetingId}/generate-summary`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to generate summary"
    );
  }

  return response.json();
};

export const getMeetings = async (
  page = 1,
  limit = 10
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to fetch meetings"
    );
  }

  return response.json();
};

export const getMeeting = async (
  meetingId
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings/${meetingId}`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to fetch meeting"
    );
  }

  return response.json();
};

export const updateMeeting = async (
  meetingId,
  data
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings/${meetingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to update meeting"
    );
  }

  return response.json();
};

export const deleteMeetingApi = async (
  meetingId
) => {

  const response = await fetchWithAuth(
    `${API_URL}/meetings/${meetingId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to delete meeting"
    );
  }

  return response.json();
};

export const createScheduledMeeting = async (data) => {
  const response = await fetchWithAuth(
    `${API_URL}/scheduled-meetings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to schedule meeting");
  }

  return response.json();
};

export const getScheduledMeetings = async () => {
  const response = await fetchWithAuth(
    `${API_URL}/scheduled-meetings`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch scheduled meetings");
  }

  return response.json();
};

export const deleteScheduledMeeting = async (meetingId) => {
  const response = await fetchWithAuth(
    `${API_URL}/scheduled-meetings/${meetingId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to delete scheduled meeting");
  }

  return response.json();
};

export const finishScheduledMeeting = async (meetingId) => {
  const response = await fetchWithAuth(`${API_URL}/scheduled-meetings/${meetingId}/finish`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to mark meeting as finished");
  }
  return response.json();
};

export const createNotification = async (notificationData) => {
  const response = await fetchWithAuth(`${API_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notificationData),
  });

  if (!response.ok) {
    throw new Error("Failed to create notification");
  }

  return response.json();
};

export const clearUserNotifications = async () => {
  const response = await fetchWithAuth(`${API_URL}/notifications`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to clear notifications");
  }
  return response.json();
};
