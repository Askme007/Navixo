// src/services/auth.service.ts

export const authService = {
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  getUser() {
    const user = localStorage.getItem("user");

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  setUser(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  async login(email: string, password: string) {
    const API_URL = import.meta.env.VITE_API_URL;

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    this.setToken(data.token);
    this.setUser(data.user);

    return data;
  },

  async register(name: string, email: string, password: string) {
    const API_URL = import.meta.env.VITE_API_URL;

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    this.setToken(data.token);
    this.setUser(data.user);

    return data;
  },
};