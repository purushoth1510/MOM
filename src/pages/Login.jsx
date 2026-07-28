import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

  const handleLogin = async () => {
    if (loading) return;

    if (!username || !password) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        navigate("/dashboard");
      } else {
        setErrorMessage(data.detail || "Invalid credentials.");
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
      <div className="bg-white p-10 rounded-3xl shadow-lg w-[400px]">
        <h1 className="text-4xl font-bold mb-8 text-center">
          MoM Assistant
        </h1>

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

        <input
          type="text"
          placeholder="Email / Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errorMessage) setErrorMessage("");
            if (successMessage) setSuccessMessage("");
          }}
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMessage) setErrorMessage("");
            if (successMessage) setSuccessMessage("");
          }}
          className="w-full border p-3 rounded-xl mb-2"
        />

        <p className="text-right mb-4">
          <span
            onClick={() => navigate("/forgot-password")}
            className="text-green-600 cursor-pointer text-sm font-semibold"
          >
            Forgot Password?
          </span>
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-3 rounded-xl text-white ${
            loading ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4">
          Don't have an account?
          <span
            onClick={() => navigate("/register")}
            className="text-green-600 cursor-pointer ml-2 font-semibold"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;