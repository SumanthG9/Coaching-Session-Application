import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import CoachListing from "./pages/CoachListing";
import StudentSessions from "./pages/StudentSessions";
import StudentProfile from "./pages/StudentProfile";

// Coach pages
import CoachDashboard from "./pages/CoachDashboard";
import CoachRequests from "./pages/CoachRequests";
import CoachProfile from "./pages/CoachProfile";

import SessionDetails from "./pages/SessionDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/student" element={<Register defaultRole="student" />} />
        <Route path="/register/coach" element={<Register defaultRole="coach" />} />

        {/* Protected Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/coaches"
          element={
            <ProtectedRoute allowedRole="student">
              <CoachListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/sessions"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/sessions/:id"
          element={
            <ProtectedRoute allowedRole="student">
              <SessionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected Coach Routes */}
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute allowedRole="coach">
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/requests"
          element={
            <ProtectedRoute allowedRole="coach">
              <CoachRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/sessions/:id"
          element={
            <ProtectedRoute allowedRole="coach">
              <SessionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/profile"
          element={
            <ProtectedRoute allowedRole="coach">
              <CoachProfile />
            </ProtectedRoute>
          }
        />

        {/* General Protected Session Route */}
        <Route
          path="/sessions/:id"
          element={
            <ProtectedRoute>
              <SessionDetails />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
