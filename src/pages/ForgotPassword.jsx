import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const getErrorMessage = (data, fallback) =>
    data?.message || data?.detail || fallback;

  const handleSendOtp = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Email is required.");
      setSuccessMessage("");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmail(trimmedEmail);
        setSuccessMessage(data.message || "OTP sent successfully.");
        setStep(2);
      } else {
        setErrorMessage(
          getErrorMessage(data, "Unable to send OTP.")
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return;

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setErrorMessage("OTP is required.");
      setSuccessMessage("");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setErrorMessage("OTP must be exactly 6 digits.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: trimmedOtp,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "OTP verified.");
        setStep(3);
      } else {
        setErrorMessage(
          getErrorMessage(data, "Invalid OTP.")
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill all password fields.");
      setSuccessMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          data.message || "Password updated successfully."
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setErrorMessage(
          getErrorMessage(data, "Unable to reset password.")
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#edf4f1]">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-[450px]">
        <h1 className="text-4xl font-bold mb-2 text-center">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {step === 1 && "Enter your registered email to receive an OTP."}
          {step === 2 && "Enter the 6-digit OTP sent to your email."}
          {step === 3 && "Choose a new password for your account."}
        </p>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-full border p-3 rounded-xl mb-6"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full p-3 rounded-xl text-white ${
                loading ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              disabled={loading}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (errorMessage) setErrorMessage("");
              }}
              className="w-full border p-3 rounded-xl mb-6"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`w-full p-3 rounded-xl text-white ${
                loading ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              disabled={loading}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-full border p-3 rounded-xl mb-4"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-full border p-3 rounded-xl mb-6"
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`w-full p-3 rounded-xl text-white ${
                loading ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="text-center mt-4">
          Back to
          <span
            onClick={() => navigate("/")}
            className="text-green-600 cursor-pointer ml-2 font-semibold"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
