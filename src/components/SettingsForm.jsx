import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { fetchWithAuth } from "../services/api";

const API_URL = "http://localhost:8000";

function formatRole(role) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Employee";
}

function SettingsForm() {
  const { user, setUser } = useContext(UserContext);

  const authEmail = localStorage.getItem("email") || "";
  const authRole = localStorage.getItem("role") || "employee";

  const [form, setForm] = useState({
    username: user.name || localStorage.getItem("username") || "",
    email: authEmail,
    organization: "",
    role: authRole,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const successTimerRef = useRef(null);

  const clearSuccessTimer = () => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  const showSuccessMessage = (message) => {
    clearSuccessTimer();
    setSuccessMessage(message);
    successTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      successTimerRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");

    return () => {
      clearSuccessTimer();
    };
  }, []);

  useEffect(() => {
    if (!authEmail) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      clearSuccessTimer();

      try {
        const response = await fetchWithAuth(
          `${API_URL}/api/settings/${authEmail}`
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || "Unable to load profile.");
        }

        const data = await response.json();

        if (cancelled) return;

        setForm({
          username: data.username || localStorage.getItem("username") || "",
          email: authEmail,
          organization: data.organization || "",
          role: data.role || authRole,
        });
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err.message || "Unable to load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authEmail, authRole]);

  const updateForm = (updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setSuccessMessage("");
    clearSuccessTimer();
  };

  const handleSave = async () => {
    const trimmedUsername = form.username.trim();

    if (!trimmedUsername) {
      setErrorMessage("Username is required.");
      setSuccessMessage("");
      clearSuccessTimer();
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    clearSuccessTimer();
    setErrorMessage("");

    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/settings/${authEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: trimmedUsername,
            organization: form.organization,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.detail || "Failed to update profile. Please try again."
        );
      }

      const result = await response.json();
      const saved = result.data || {};

      const updatedUser = {
        name: saved.username || trimmedUsername,
        email: authEmail,
        organization: saved.organization || form.organization,
        role: saved.role || authRole,
      };

      setUser(updatedUser);
      localStorage.setItem("username", updatedUser.name);

      setForm({
        username: updatedUser.name,
        email: authEmail,
        organization: updatedUser.organization,
        role: updatedUser.role,
      });

      showSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setErrorMessage(
        err.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl mt-10">
      <h2 className="text-3xl font-bold mb-2">Profile</h2>
      <p className="text-gray-500 mb-8">
        Update your account details. Email and role cannot be changed here.
      </p>

      {loading && (
        <p className="text-gray-500 mb-6">Loading profile...</p>
      )}

      {!loading && errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {errorMessage}
        </div>
      )}

      {!loading && successMessage && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Username
          </label>
          <input
            type="text"
            value={form.username}
            placeholder="Username"
            disabled={loading || saving}
            onChange={(e) =>
              updateForm({ username: e.target.value })
            }
            className="w-full rounded-xl border p-4 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            placeholder="Email"
            disabled
            className="w-full rounded-xl border bg-gray-50 p-4 text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Organization
          </label>
          <input
            type="text"
            value={form.organization}
            placeholder="Organization"
            disabled={loading || saving}
            onChange={(e) =>
              updateForm({ organization: e.target.value })
            }
            className="w-full rounded-xl border p-4 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Role
          </label>
          <input
            type="text"
            value={formatRole(form.role)}
            disabled
            className="w-full rounded-xl border bg-gray-50 p-4 text-gray-500"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading || saving}
        className="mt-8 rounded-xl bg-green-600 px-8 py-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

export default SettingsForm;
