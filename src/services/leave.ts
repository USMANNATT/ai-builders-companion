import { apiPost } from "./api";

export async function getStudentInfo(studentId: string) {
  return apiPost("LeaveAjax.php", { action: "getStudentInfo", studentId });
}

export async function getLeaveSubjects(studentId: string) {
  return apiPost("LeaveAjax.php", { action: "getStudentSubjects", studentId });
}

export async function submitLeave(params: {
  roll_no: string;
  course_id: string;
  faculty_id: string;
  reason: string;
  from_date: string;
  to_date: string;
}) {
  const selectedCourses = [{ course_id: Number(params.course_id), faculty_id: Number(params.faculty_id) }];
  return apiPost("LeaveAjax.php", {
    action: "submitLeave",
    rollNumber: params.roll_no,
    leaveReason: params.reason,
    startDate: params.from_date,
    endDate: params.to_date,
    hospitalName: " ",
    description: params.reason,
    selectedCourses: JSON.stringify(selectedCourses),
    selectedCourseIds: JSON.stringify([Number(params.course_id)]),
  });
}

export async function fetchLeaveHistory(studentId: string) {
  return apiPost("dashboardAjax.php", { action: "fetchLeaves", studentId });
}
