const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    json = { success: false, message: "Response parsing failed" };
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      endpoint !== "/auth/refresh" &&
      endpoint !== "/auth/login" &&
      endpoint !== "/auth/register" &&
      typeof window !== "undefined"
    ) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.success && refreshData.data?.token) {
                const newToken = refreshData.data.token;
                localStorage.setItem("auth_token", newToken);
                if (refreshData.data.refreshToken) {
                  localStorage.setItem("refresh_token", refreshData.data.refreshToken);
                }
                isRefreshing = false;
                onRefreshed(newToken);
              } else {
                throw new Error("Invalid refresh payload");
              }
            } else {
              throw new Error("Refresh endpoint returned failure status");
            }
          } catch (err) {
            isRefreshing = false;
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            throw {
              status: 401,
              message: "Session expired. Please log in again.",
            };
          }
        }

        // Wait for the token refresh process and retry original request
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            headers.set("Authorization", `Bearer ${newToken}`);
            fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            })
              .then(async (retryRes) => {
                const retryText = await retryRes.text();
                let retryJson: any = {};
                try {
                  retryJson = retryText ? JSON.parse(retryText) : {};
                } catch (err) {
                  retryJson = { success: false, message: "Response parsing failed" };
                }

                if (!retryRes.ok) {
                  reject({
                    status: retryRes.status,
                    message: retryJson.message || "Request failed",
                    errors: retryJson.errors,
                  });
                } else {
                  resolve(retryJson.data);
                }
              })
              .catch(reject);
          });
        });
      }
    }

    throw {
      status: response.status,
      message: json.message || "Request failed",
      errors: json.errors,
    };
  }

  return json.data;
}

export const client = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
