import { apiPost } from "./api";

export async function getStudentResults(studentId: string, courseId: string) {
  return apiPost("examAjax.php", {
    action: "getStudentResults",
    student_id: studentId,
    course_id: courseId,
  });
}
