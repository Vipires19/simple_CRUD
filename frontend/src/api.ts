const API = "";

let csrf: string | null = null;

async function fetchCsrf(): Promise<string> {
  const res = await fetch(`${API}/api/csrf/`, { credentials: "include" });
  const j = (await res.json()) as { csrfToken: string };
  csrf = j.csrfToken;
  return csrf;
}

function jsonHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (csrf) h["X-CSRFToken"] = csrf;
  return h;
}

function csrfHeaders(): HeadersInit {
  const h: Record<string, string> = {};
  if (csrf) h["X-CSRFToken"] = csrf;
  return h;
}

function parseDetail(err: unknown): string {
  if (err && typeof err === "object" && "detail" in err) {
    const d = (err as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    return JSON.stringify(d);
  }
  return "Erro inesperado";
}

export async function register(email: string, password: string): Promise<void> {
  await fetchCsrf();
  const res = await fetch(`${API}/api/auth/register/`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(parseDetail(await res.json()));
}

export async function login(email: string, password: string): Promise<void> {
  await fetchCsrf();
  const res = await fetch(`${API}/api/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(parseDetail(await res.json()));
}

export async function logout(): Promise<void> {
  await fetchCsrf();
  await fetch(`${API}/api/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
    body: "{}",
  });
}

export type Me = { id: number; email: string };

export async function me(): Promise<Me | null> {
  const res = await fetch(`${API}/api/auth/me/`, { credentials: "include" });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;
  return res.json() as Promise<Me>;
}

export type UserFileRow = {
  id: number;
  original_name: string;
  size: number;
  content_type: string;
  created_at: string;
};

export async function listFiles(): Promise<UserFileRow[]> {
  const res = await fetch(`${API}/api/files/`, { credentials: "include" });
  if (!res.ok) throw new Error("Falha ao listar arquivos");
  return res.json() as Promise<UserFileRow[]>;
}

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  await fetchCsrf();
  const fd = new FormData();
  fd.append("file", file);
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/files/`);
    xhr.withCredentials = true;
    if (csrf) xhr.setRequestHeader("X-CSRFToken", csrf);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        try {
          const j = JSON.parse(xhr.responseText) as unknown;
          reject(new Error(parseDetail(j)));
        } catch {
          reject(new Error(xhr.responseText || "Falha no upload"));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Erro de rede"));
    xhr.send(fd);
  });
}

export async function deleteFile(id: number): Promise<void> {
  await fetchCsrf();
  const res = await fetch(`${API}/api/files/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: csrfHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Falha ao excluir");
  }
}

export async function downloadFile(id: number, filename: string): Promise<void> {
  const res = await fetch(`${API}/api/files/${id}/download/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Falha no download");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function previewUrl(id: number): string {
  return `${API}/api/files/${id}/preview/`;
}
