const API_BASE = process.env.REACT_APP_API_BASE || "/api";

export const getToken = () => localStorage.getItem("token") || "";
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const setAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const requireAuth = () => {
  const user = getUser();
  const token = getToken();
  if (!user || !token) {
    return null;
  }
  return user;
};

export const logout = () => {
  clearAuth();
  window.location.href = "/login";
};