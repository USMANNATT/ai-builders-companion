import { apiPost } from "./api";

export async function getUpdates(studentId: string) {
  return apiPost("upload_updatesAjax.php", {
    action: "getUpdates",
    student_id: studentId,
  });
}
