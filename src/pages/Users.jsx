import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { fetchWithAuth } from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New User Form State
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("employee");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [roleMessage, setRoleMessage] = useState("");
  const [roleError, setRoleError] = useState("");

  const currentUserRole = localStorage.getItem("role") || "employee";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchWithAuth("http://localhost:8000/api/users");
      const result = await response.json();
      if (response.ok) {
        setUsers(result.data || []);
      } else {
        setError(result.detail || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      setError("Server error when loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newPassword) {
      setFormError("Please fill all fields.");
      setFormSuccess("");
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");
      setFormSuccess("");
      const response = await fetchWithAuth("http://localhost:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setShowAddModal(false);
        setNewUsername("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("employee");
        setRoleMessage("User created successfully!");
        setRoleError("");
        fetchUsers();
      } else {
        setFormError(result.detail || "Failed to create user.");
      }
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Server error when creating user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRoleChange = async (email, selectedRole) => {
    try {
      setRoleMessage("");
      setRoleError("");
      const response = await fetchWithAuth(`http://localhost:8000/api/users/${email}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      const result = await response.json();
      if (response.ok) {
        setRoleMessage("Role updated successfully!");
        fetchUsers();
      } else {
        setRoleError(result.detail || "Failed to update role.");
      }
    } catch (err) {
      console.error(err);
      setRoleError(err.message || "Server error when updating role.");
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;
    try {
      setRoleMessage("");
      setRoleError("");
      const response = await fetchWithAuth(`http://localhost:8000/api/users/${email}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setRoleMessage("User deleted successfully!");
        fetchUsers();
      } else {
        setRoleError(result.detail || "Failed to delete user.");
      }
    } catch (err) {
      console.error(err);
      setRoleError(err.message || "Server error when deleting user.");
    }
  };

  return (
    <div className="flex bg-[#edf4f1] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <div className="p-8 flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-500 mt-1">Manage users, permissions, and roles</p>
            </div>
            {currentUserRole === "super_admin" && (
              <button
                onClick={() => {
                  setFormError("");
                  setFormSuccess("");
                  setShowAddModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-2xl shadow transition"
              >
                Add New User
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {roleMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-xl mb-6">
              {roleMessage}
            </div>
          )}

          {roleError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6">
              {roleError}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <th className="p-6">Username</th>
                    <th className="p-6">Email</th>
                    <th className="p-6">Role</th>
                    {currentUserRole === "super_admin" && <th className="p-6">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50 transition">
                      <td className="p-6 font-medium">{u.username}</td>
                      <td className="p-6">{u.email}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === "super_admin" ? "bg-purple-100 text-purple-800" :
                          u.role === "admin" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      {currentUserRole === "super_admin" && (
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.email, e.target.value)}
                              className="border rounded-xl p-2 bg-white text-sm focus:ring-green-500"
                            >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                            {u.role !== "super_admin" && (
                              <button
                                onClick={() => handleDeleteUser(u.email)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Delete user"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={currentUserRole === "super_admin" ? 4 : 3} className="p-10 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create User</h2>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:outline-green-500"
                  placeholder="e.g. johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:outline-green-500"
                  placeholder="e.g. john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:outline-green-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:outline-green-500 bg-white"
                >
                  <option value="employee">Employee</option>
                  {currentUserRole === "super_admin" && (
                    <option value="admin">Admin</option>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:bg-gray-400"
                >
                  {formLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
