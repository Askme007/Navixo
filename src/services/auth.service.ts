// src/services/auth.service.ts

export interface User {
  id: string;
  name: string;
  email: string;
  provider?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  /* =========================
     TOKEN
  ========================= */

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  /* =========================
     USER
  ========================= */

  getUser(): User | null {
    const user = localStorage.getItem("user");

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  setUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  /* =========================
     AUTH STATE
  ========================= */

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /* =========================
     LOGIN
  ========================= */

  async login(email: string, password: string) {
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

    return data.user;
  },

  /* =========================
     REGISTER
  ========================= */

  async register(
    name: string,
    email: string,
    password: string
  ) {
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

    return data.user;
  },
};