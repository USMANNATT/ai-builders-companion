import { apiPost } from "./api";

// Dashboard
export async function getTeacherName(teacherId: string) {
  return apiPost("dashboardAjax.php", { action: "getTeacherName", teacherId });
}

export async function getTeacherStats(teacherId: string) {
  return apiPost("dashboardAjax.php", { action: "getTeacherStats", teacherId });
}

export async function getTeacherCourses(teacherId: string) {
  return apiPost("dashboardAjax.php", { action: "getTeacherCourses", teacher_id: teacherId });
}

// Attendance
export async function getSessions() {
  return apiPost("attendanceAJAX.php", { action: "getSessions" });
}

export async function getSessionCourses(teacherId: string, sessionId: string) {
  return apiPost("attendanceAJAX.php", { action: "getSessionCourses", teacher_id: teacherId, session_id: sessionId });
}

export async function getSections(courseId: string) {
  return apiPost("attendanceAJAX.php", { action: "getSections", course_id: courseId });
}

export async function getStudentList(courseId: string, section: string, date: string) {
  return apiPost("attendanceAJAX.php", { action: "getStudentList", course_id: courseId, section, date });
}

export async function markAttendance(courseId: string, section: string, date: string, attendance: string) {
  return apiPost("attendanceAJAX.php", { action: "markAttendance", course_id: courseId, section, date, attendance });
}

// Leave
export async function getLeaveRequests(teacherId: string) {
  return apiPost("LeaveAjax.php", { action: "getLeaveRequests", teacher_id: teacherId });
}

export async function approveLeave(leaveId: string) {
  return apiPost("LeaveAjax.php", { action: "approveLeave", leave_id: leaveId });
}

export async function rejectLeave(leaveId: string) {
  return apiPost("LeaveAjax.php", { action: "rejectLeave", leave_id: leaveId });
}

// Resources
export async function uploadResource(formData: FormData) {
  const res = await fetch("https://aibuilderss.com/AI_Builders/ajaxhandler/upload_resourceAjax.php", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Updates
export async function publishUpdate(params: Record<string, string>) {
  return apiPost("upload_updatesAjax.php", { action: "publishUpdate", ...params });
}

// Exams
export async function getAssessmentTypes(courseId: string) {
  return apiPost("examsAjax.php", { action: "getAssessmentTypes", course_id: courseId });
}

export async function publishResult(formData: FormData) {
  const res = await fetch("https://aibuilderss.com/AI_Builders/ajaxhandler/examsAjax.php", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Feedback
export async function getFeedbacks(teacherId: string) {
  return apiPost("feedbackAjax.php", { action: "getFeedbacks", teacher_id: teacherId });
}

// Report
export async function getAttendanceReport(courseId: string, section: string) {
  return apiPost("attendanceAJAX.php", { action: "getReport", course_id: courseId, section });
}

export async function getTodaysReport(courseId: string, section: string, date: string) {
  return apiPost("attendanceAJAX.php", { action: "getTodaysReport", course_id: courseId, section, date });
}
