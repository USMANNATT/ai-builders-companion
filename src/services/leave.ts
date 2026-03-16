import { apiPost } from "./api";

export async function getStudentInfo(studentId: string) {
  // Use dashboardAjax which has working CORS
  return apiPost("dashboardAjax.php", { action: "getStudentName", studentId });
}

export async function getLeaveSubjects(studentId: string) {
  // Use dashboardAjax which has working CORS
  return apiPost("dashboardAjax.php", { action: "getStudentSubjects", student_id: studentId });
}

export async function submitLeave(params: {
  roll_no: string;
  selectedCourses: { course_id: number; faculty_id: number }[];
  reason: string;
  description: string;
  hospital_name: string;
  from_date: string;
  to_date: string;
}) {
  return apiPost("LeaveAjax.php", {
    action: "submitLeave",
    rollNumber: params.roll_no,
    leaveReason: params.reason,
    startDate: params.from_date,
    endDate: params.to_date,
    hospitalName: params.hospital_name,
    description: params.description,
    selectedCourses: JSON.stringify(params.selectedCourses),
    selectedCourseIds: JSON.stringify(params.selectedCourses.map((c) => c.course_id)),
  });
}

export async function fetchLeaveHistory(studentId: string) {
  return apiPost("dashboardAjax.php", { action: "fetchLeaves", studentId });
}
