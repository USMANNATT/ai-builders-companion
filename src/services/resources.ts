import { apiPost } from "./api";

export async function getSubjectResources(courseId: string) {
  return apiPost("resourceAJAX.php", {
    action: "getSubjectResources",
    course_id: courseId,
  });
}
