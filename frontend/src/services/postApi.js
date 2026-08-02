import { getAuthSession } from "./authApi";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
};

// export const getPosts = async () => {
//   const response = await fetch(`${API_BASE}/posts`);
//   return parseResponse(response);
// };

// Pagination searching ans sorting 
export const getPosts = async ({
  page = 1,
  limit = 5,
  search = "",
  sort = "latest",
}) => {
  const params = new URLSearchParams({
    page,
    limit,
    sort,
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }

  const response = await fetch(`${API_BASE}/posts?${params.toString()}`);

  return parseResponse(response);
};



export const createPost = async (payload) => {
  const session = getAuthSession();
  const token = session?.accessToken;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/posts/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const likePost = async (payload) => {
  const session = getAuthSession();
  const token = session?.accessToken;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/likes`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const unlikePost = async (payload) => {
  const session = getAuthSession();
  const token = session?.accessToken;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/likes/unlike`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const createComment = async (payload) => {
  const session = getAuthSession();
  const token = session?.accessToken;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/comments/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};
