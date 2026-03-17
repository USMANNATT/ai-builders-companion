import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "@/components/AuthProvider";
import AppLayout from "@/components/AppLayout";
import TeacherLayout from "@/components/TeacherLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import Resources from "@/pages/Resources";
import Results from "@/pages/Results";
import Attendance from "@/pages/Attendance";
import Leave from "@/pages/Leave";
import Announcements from "@/pages/Announcements";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Teacher pages
import TeacherDashboard from "@/pages/teacher/Dashboard";
import TeacherAttendance from "@/pages/teacher/Attendance";
import TeacherLeaveRequests from "@/pages/teacher/LeaveRequests";
import TeacherUploadResources from "@/pages/teacher/UploadResources";
import TeacherUploadUpdates from "@/pages/teacher/UploadUpdates";
import TeacherUploadExams from "@/pages/teacher/UploadExams";
import TeacherFeedback from "@/pages/teacher/Feedback";
import TeacherSettings from "@/pages/teacher/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Student routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/results" element={<Results />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Teacher routes */}
            <Route element={<TeacherLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/attendance" element={<TeacherAttendance />} />
              <Route path="/teacher/leave-requests" element={<TeacherLeaveRequests />} />
              <Route path="/teacher/upload-resources" element={<TeacherUploadResources />} />
              <Route path="/teacher/upload-updates" element={<TeacherUploadUpdates />} />
              <Route path="/teacher/upload-exams" element={<TeacherUploadExams />} />
              <Route path="/teacher/feedback" element={<TeacherFeedback />} />
              <Route path="/teacher/settings" element={<TeacherSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
