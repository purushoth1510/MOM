import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import ViewMeeting from "./pages/ViewMeeting";
import Extension from "./pages/Extension";
import AIAssistant from "./pages/AIAssistant";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/"  element={<Login />} />

        <Route path="/register"  element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/meetings" element={
          <ProtectedRoute>
            <Meetings />
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/extension" element={
          <ProtectedRoute>
            <Extension />
          </ProtectedRoute>
        } />

        <Route path="/meetings/:id" element={
          <ProtectedRoute>
            <ViewMeeting />
          </ProtectedRoute>
        } />

        <Route path="/assistant"  element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <AIAssistant />
          </ProtectedRoute>
        }/>

        <Route path="/ai-assistant"  element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <AIAssistant />
          </ProtectedRoute>
        }/>


      </Routes>

    </BrowserRouter>
  );
}

export default App;