import { authService } from "./auth.service";

const API = import.meta.env.VITE_API_URL;

async function apiGet(endpoint: string) {
  const token = authService.getToken();

  const res = await fetch(`${API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export const dashboardService = {
  async getDashboard() {
    return apiGet("/api/dashboard");
  },

  async getLeetcodeProfile() {
    return apiGet("/api/platforms/leetcode");
  },

  async getCodeforcesProfile() {
    return apiGet("/api/platforms/codeforces");
  },
};