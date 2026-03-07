import { apiPost } from "./api";

export async function getStudentAttendance(studentId: string) {
  return apiPost("attendanceAJAX.php", { action: "getAttendanceOfOneStudent", studentid: studentId });
}
