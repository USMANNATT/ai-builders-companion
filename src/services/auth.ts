import { apiPost } from "./api";

interface LoginResponse {
  status: string;
  id?: number;
  role?: string;
  redirect?: string;
  message?: string;
  facid?: number | string;
  facultyid?: number | string;
  faculty_id?: number | string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("loginAjax.php", {
    action: "verifyUser",
    user_name: username,
    password: password,
  });
}

export async function logout(): Promise<any> {
  return apiPost("logoutStudentAjax.php", { action: "logoutStudent" });
}
