import { apiPost } from "./api";

export async function getSessions() {
  return apiPost("attendanceAJAX.php", { action: "getSession" });
}
