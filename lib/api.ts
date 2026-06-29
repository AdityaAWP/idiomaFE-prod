const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    // If env var is set to localhost but we're accessed from a different host, use the real hostname
    if (envUrl && envUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:3000/api`;
    }
    if (envUrl) return envUrl;
    return `http://${window.location.hostname}:3000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
};
const API_URL = getApiUrl();
const getMonolithUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_MONOLITH_URL;
    if (envUrl && envUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:3003/api`;
    }
    if (envUrl) return envUrl;
    return `http://${window.location.hostname}:3003/api`;
  }
  return process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:3003/api";
};
const MONOLITH_URL = getMonolithUrl();
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getFullImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onTokenChange: (() => void) | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
  onTokenChange?.();
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
  onTokenChange?.();
}

export function getAccessToken() {
  return accessToken;
}

export function onAuthChange(cb: () => void) {
  onTokenChange = cb;
}

export function loadTokens() {
  if (typeof window !== "undefined" && !accessToken) {
    accessToken = localStorage.getItem("access_token");
    refreshToken = localStorage.getItem("refresh_token");
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  loadTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(url, options, false);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err.message ?? "Request failed");
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  targetLanguage: string | null;
  proficiency: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export const auth = {
  register(data: { email: string; username: string; password: string }) {
    return request<AuthTokens>(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request<AuthTokens>(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  refresh(token: string) {
    return request<AuthTokens>(`${API_URL}/auth/refresh`, {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    });
  },

  logout(refreshTokenStr: string) {
    return request<void>(`${API_URL}/auth/logout`, {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshTokenStr }),
    });
  },

  getMe() {
    return request<UserProfile>(`${API_URL}/auth/me`);
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────

export interface PublicUser {
  id: string;
  username: string;
  targetLanguage: string | null;
  proficiency: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export const users = {
  updateProfile(data: {
    username?: string;
    targetLanguage?: string;
    proficiency?: string;
  }) {
    return request<UserProfile>(`${API_URL}/users/profile`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  search(query: string) {
    return request<PublicUser[]>(`${API_URL}/users/search?q=${encodeURIComponent(query)}`);
  },

  findById(id: string) {
    return request<PublicUser>(`${API_URL}/users/${id}`);
  },

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    loadTokens();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers,
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new ApiError(res.status, err.message ?? "Upload failed");
      }
      return res.json() as Promise<UserProfile>;
    });
  },
};

// ─── Matchmaking ────────────────────────────────────────────────────────────

export const match = {
  join(data: { level: string; topics: string[] }) {
    return request<{ status: string; level: string }>(`${API_URL}/match/join`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  cancel(data: { level: string }) {
    return request<{ status: string }>(`${API_URL}/match/cancel`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── Lobbies (Monolith) ─────────────────────────────────────────────────────

export interface LobbyData {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  isPrivate: boolean;
  language: string;
  ownerId: string;
  createdAt: string;
  owner?: PublicUser;
  _count?: { members: number };
  members?: { user: PublicUser; joinedAt: string }[];
}

export interface LobbyMessage {
  id: string;
  lobbyId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: PublicUser;
}

export const lobbies = {
  create(data: { name: string; description?: string; language: string; isPrivate?: boolean }) {
    return request<LobbyData>(`${MONOLITH_URL}/lobbies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list(language?: string) {
    const qs = language ? `?language=${encodeURIComponent(language)}` : "";
    return request<LobbyData[]>(`${MONOLITH_URL}/lobbies${qs}`);
  },

  get(id: string) {
    return request<LobbyData>(`${MONOLITH_URL}/lobbies/${id}`);
  },

  delete(id: string) {
    return request<void>(`${MONOLITH_URL}/lobbies/${id}`, { method: "DELETE" });
  },

  join(lobbyId: string) {
    return request<void>(`${MONOLITH_URL}/lobbies/${lobbyId}/join`, { method: "POST" });
  },

  leave(lobbyId: string) {
    return request<void>(`${MONOLITH_URL}/lobbies/${lobbyId}/leave`, { method: "POST" });
  },

  messages(lobbyId: string, cursor?: string) {
    const qs = cursor ? `?cursor=${cursor}` : "";
    return request<{ messages: LobbyMessage[]; nextCursor: string | null }>(
      `${MONOLITH_URL}/lobbies/${lobbyId}/messages${qs}`
    );
  },

  getAgoraToken(lobbyId: string) {
    return request<{ channelName: string; token: string }>(
      `${MONOLITH_URL}/lobbies/${lobbyId}/agora-token`,
      { method: "POST" }
    );
  },
};

// ─── Friends (Monolith) ─────────────────────────────────────────────────────

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  receiver?: PublicUser;
  sender?: PublicUser;
}

export interface Friendship {
  friendshipId: string;
  friend: PublicUser;
  since: string;
}

export const friends = {
  sendRequest(receiverId: string) {
    return request<FriendRequest>(`${MONOLITH_URL}/friends/request/${receiverId}`, {
      method: "POST",
    });
  },

  acceptRequest(requestId: string) {
    return request<void>(`${MONOLITH_URL}/friends/requests/${requestId}/accept`, {
      method: "PATCH",
    });
  },

  rejectRequest(requestId: string) {
    return request<void>(`${MONOLITH_URL}/friends/requests/${requestId}/reject`, {
      method: "PATCH",
    });
  },

  cancelRequest(requestId: string) {
    return request<void>(`${MONOLITH_URL}/friends/requests/${requestId}`, {
      method: "DELETE",
    });
  },

  list() {
    return request<Friendship[]>(`${MONOLITH_URL}/friends`);
  },

  receivedRequests() {
    return request<FriendRequest[]>(`${MONOLITH_URL}/friends/requests/received`);
  },

  sentRequests() {
    return request<FriendRequest[]>(`${MONOLITH_URL}/friends/requests/sent`);
  },

  unfriend(friendId: string) {
    return request<void>(`${MONOLITH_URL}/friends/${friendId}`, { method: "DELETE" });
  },
};

// ─── AI ─────────────────────────────────────────────────────────────────────

export const ai = {
  truthOrDare(language?: string) {
    return request<{ text: string }>(`${API_URL}/ai/truth-or-dare`, {
      method: "POST",
      body: language ? JSON.stringify({ language }) : undefined,
    });
  },

  topicSuggestion(topics: string[], language?: string) {
    return request<{ title: string; example: string }>(`${API_URL}/ai/topic-suggestion`, {
      method: "POST",
      body: JSON.stringify({ topics, language }),
    });
  },
};

// ─── DM (Monolith) ──────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface Conversation {
  conversationId: string;
  contact: PublicUser;
  lastMessage: Message | null;
}

export const dm = {
  send(receiverId: string, content: string) {
    return request<Message>(`${MONOLITH_URL}/dm/${receiverId}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  messages(otherUserId: string, cursor?: string) {
    const qs = cursor ? `?cursor=${cursor}` : "";
    return request<{ messages: Message[]; nextCursor: string | null }>(
      `${MONOLITH_URL}/dm/${otherUserId}${qs}`
    );
  },

  conversations() {
    return request<Conversation[]>(`${MONOLITH_URL}/dm`);
  },

  markRead(conversationId: string) {
    return request<void>(`${MONOLITH_URL}/dm/${conversationId}/read`, { method: "POST" });
  },
};
