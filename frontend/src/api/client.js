import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("docmind_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("docmind_token");
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (email, password) =>
    client.post("/auth/register", { email, password }),
  login: (email, password) => client.post("/auth/login", { email, password }),
  getMe: () => client.get("/auth/me"),
};

export const documentsAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    });
  },
  list: () => client.get("/documents/"),
  delete: (documentId) => client.delete(`/documents/${documentId}`),
  getPdfBlob: (documentId) => client.get(`/documents/${documentId}/pdf`, { responseType: 'blob' }),
};

export const chatAPI = {
  query: (documentId, question) =>
    client.post("/chat/query", { document_id: documentId, question }),
  queryStream: async (documentId, question) => {
    const token = localStorage.getItem("docmind_token");
    const response = await fetch(`${API_URL}/chat/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ document_id: documentId, question }),
    });

    if (!response.ok) {
      let errorMsg = "Query failed";
      try {
        const error = await response.json();
        errorMsg = error.detail || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return response.body.getReader();
  },
  history: (documentId) => client.get(`/chat/history/${documentId}`),
};

export default client;
