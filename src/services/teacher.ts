import { BASE_URL } from "@/constants/urls";
import { apiPost } from "./api";

type EndpointCandidate = {
  endpoint: string;
  params: Record<string, string>;
};

async function postJson(endpoint: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = (await res.text()).trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function hasBackendError(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const record = payload as Record<string, unknown>;
  const status = String(record.status ?? "").toLowerCase();
  const message = String(record.message ?? "").toLowerCase();

  return status === "error" || status === "false" || message.includes("unknown action") || message.includes("invalid action");
}

function unwrapArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const keys = ["data", "result", "results", "courses", "subjects", "sessions", "feedbacks", "leaves", "records", "students", "student_list", "list"];

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as any[];
  }

  return [];
}

function unwrapObject(payload: unknown): Record<string, any> | null {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const keys = ["data", "result", "teacher", "profile"];

  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, any>;
    }
  }

  return record as Record<string, any>;
}

async function resolveArray(candidates: EndpointCandidate[], fallback: any[] = []) {
  for (const candidate of candidates) {
    try {
      const payload = await postJson(candidate.endpoint, candidate.params);
      if (!payload || hasBackendError(payload)) continue;

      const list = unwrapArray(payload);
      if (list.length > 0) return list;
    } catch {}
  }

  return fallback;
}

async function resolveObject(candidates: EndpointCandidate[], fallback: Record<string, any>) {
  for (const candidate of candidates) {
    try {
      const payload = await postJson(candidate.endpoint, candidate.params);
      if (!payload || hasBackendError(payload)) continue;

      const record = unwrapObject(payload);
      if (record) return record;
    } catch {}
  }

  return fallback;
}

function createSessionFallback() {
  const year = new Date().getFullYear();
  const label = `${year}-${year + 1}`;

  return [{ id: label, session_id: label, name: label, session_name: label, title: label }];
}

export async function getTeacherName(teacherId: string) {
  return resolveObject(
    [
      { endpoint: "dashboardAjax.php", params: { action: "getTeacherName", teacherId } },
      { endpoint: "dashboardAjax.php", params: { action: "getFacultyName", faculty_id: teacherId } },
      { endpoint: "dashboardAjax.php", params: { action: "getStudentName", studentId: teacherId } },
    ],
    { name: "Faculty", teacher_name: "Faculty" }
  );
}

export async function getTeacherStats(teacherId: string) {
  return resolveObject(
    [
      { endpoint: "dashboardAjax.php", params: { action: "getTeacherStats", teacherId } },
      { endpoint: "dashboardAjax.php", params: { action: "getFacultyStats", faculty_id: teacherId } },
    ],
    { totalStudents: 0, presentToday: 0, pendingLeaves: 0 }
  );
}

export async function getTeacherCourses(teacherId: string) {
  return resolveArray([
    { endpoint: "dashboardAjax.php", params: { action: "getTeacherCourses", teacher_id: teacherId } },
    { endpoint: "dashboardAjax.php", params: { action: "getFacultyCourses", faculty_id: teacherId } },
    { endpoint: "dashboardAjax.php", params: { action: "getTeacherSubjects", teacher_id: teacherId } },
    { endpoint: "dashboardAjax.php", params: { action: "getFacultySubjects", faculty_id: teacherId } },
    { endpoint: "dashboardAjax.php", params: { action: "getStudentSubjects", teacher_id: teacherId } },
    { endpoint: "dashboardAjax.php", params: { action: "getStudentSubjects", student_id: teacherId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getTeacherCourses", teacher_id: teacherId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getFacultyCourses", faculty_id: teacherId } },
    { endpoint: "upload_resourceAjax.php", params: { action: "getTeacherCourses", teacher_id: teacherId } },
    { endpoint: "upload_updatesAjax.php", params: { action: "getTeacherCourses", teacher_id: teacherId } },
    { endpoint: "examsAjax.php", params: { action: "getTeacherCourses", teacher_id: teacherId } },
  ]);
}

export async function getSessions(teacherId?: string) {
  return resolveArray(
    [
      { endpoint: "attendanceAJAX.php", params: { action: "getSessions", teacher_id: teacherId || "" } },
      { endpoint: "attendanceAJAX.php", params: { action: "getSessions", faculty_id: teacherId || "" } },
      { endpoint: "attendanceAJAX.php", params: { action: "getSessions" } },
      { endpoint: "attendanceAJAX.php", params: { action: "getAllSessions" } },
      { endpoint: "attendanceAJAX.php", params: { action: "fetchSessions" } },
      { endpoint: "dashboardAjax.php", params: { action: "getSessions" } },
    ],
    createSessionFallback()
  );
}

export async function getSessionCourses(teacherId: string, sessionId: string) {
  const sessionCourses = await resolveArray([
    { endpoint: "attendanceAJAX.php", params: { action: "getSessionCourses", teacher_id: teacherId, session_id: sessionId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getSessionCourses", faculty_id: teacherId, session_id: sessionId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getCoursesBySession", teacher_id: teacherId, session_id: sessionId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getCoursesBySession", faculty_id: teacherId, session_id: sessionId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getFacultyCourses", faculty_id: teacherId, session_id: sessionId } },
    { endpoint: "attendanceAJAX.php", params: { action: "getTeacherCourses", teacher_id: teacherId, session_id: sessionId } },
    { endpoint: "dashboardAjax.php", params: { action: "getTeacherCourses", teacher_id: teacherId, session_id: sessionId } },
  ]);

  return sessionCourses.length > 0 ? sessionCourses : getTeacherCourses(teacherId);
}

export async function getSections(courseId: string) {
  return resolveArray([
    { endpoint: "attendanceAJAX.php", params: { action: "getSections", course_id: courseId } },
    { endpoint: "attendanceAJAX.php", params: { action: "fetchSections", course_id: courseId } },
  ]);
}

export async function getStudentList(courseId: string, section: string, date: string) {
  return resolveArray([
    { endpoint: "attendanceAJAX.php", params: { action: "getStudentList", course_id: courseId, section, date } },
    { endpoint: "attendanceAJAX.php", params: { action: "fetchStudentList", course_id: courseId, section, date } },
    { endpoint: "attendanceAJAX.php", params: { action: "getStudents", course_id: courseId, section, date } },
    { endpoint: "attendanceAJAX.php", params: { action: "getStudentList", courseId, section, date } },
  ]);
}

export async function markAttendance(courseId: string, section: string, date: string, attendance: string) {
  return postJson("attendanceAJAX.php", { action: "markAttendance", course_id: courseId, section, date, attendance });
}

export async function getLeaveRequests(teacherId: string) {
  return resolveArray([
    { endpoint: "LeaveAjax.php", params: { action: "getLeaveRequests", teacher_id: teacherId } },
    { endpoint: "LeaveAjax.php", params: { action: "getTeacherLeaves", teacher_id: teacherId } },
    { endpoint: "LeaveAjax.php", params: { action: "getFacultyLeaveRequests", faculty_id: teacherId } },
  ]);
}

export async function approveLeave(leaveId: string) {
  return apiPost("LeaveAjax.php", { action: "approveLeave", leave_id: leaveId });
}

export async function rejectLeave(leaveId: string) {
  return apiPost("LeaveAjax.php", { action: "rejectLeave", leave_id: leaveId });
}

export async function uploadResource(formData: FormData) {
  const res = await fetch("https://aibuilderss.com/AI_Builders/ajaxhandler/upload_resourceAjax.php", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function publishUpdate(params: Record<string, string>) {
  return apiPost("upload_updatesAjax.php", { action: "publishUpdate", ...params });
}

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

export async function getFeedbacks(teacherId: string) {
  return resolveArray([
    { endpoint: "feedbackAjax.php", params: { action: "getFeedbacks", teacher_id: teacherId } },
    { endpoint: "feedbackAjax.php", params: { action: "getTeacherFeedback", teacher_id: teacherId } },
    { endpoint: "feedbackAjax.php", params: { action: "getAllFeedbacks", teacher_id: teacherId } },
  ]);
}

export async function getAttendanceReport(courseId: string, section: string) {
  return apiPost("attendanceAJAX.php", { action: "getReport", course_id: courseId, section });
}

export async function getTodaysReport(courseId: string, section: string, date: string) {
  return apiPost("attendanceAJAX.php", { action: "getTodaysReport", course_id: courseId, section, date });
}
