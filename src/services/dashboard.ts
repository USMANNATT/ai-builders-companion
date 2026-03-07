import { apiPost } from "./api";

export async function getStudentName(studentId: string) {
  return apiPost("dashboardAjax.php", {
    action: "getStudentName",
    studentId,
  });
}

export async function getStudentSubjects(studentId: string) {
  return apiPost("dashboardAjax.php", {
    action: "getStudentSubjects",
    student_id: studentId,
  });
}

export async function fetchLeaves(studentId: string) {
  return apiPost("dashboardAjax.php", {
    action: "fetchLeaves",
    studentId,
  });
}
