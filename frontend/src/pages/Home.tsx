import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteFile,
  downloadFile,
  listFiles,
  logout,
  me,
  previewUrl,
  uploadFile,
  type Me,
  type UserFileRow,
} from "../api";

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(ct: string): boolean {
  return ct.toLowerCase().startsWith("image/");
}

export default function Home() {
  const nav = useNavigate();
  const [user, setUser] = useState<Me | null>(null);
  const [files, setFiles] = useState<UserFileRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const u = await me();
    if (!u) {
      nav("/login", { replace: true });
      return;
    }
    setUser(u);
    const list = await listFiles();
    setFiles(list);
  }, [nav]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onLogout() {
    setErr(null);
    await logout();
    nav("/login", { replace: true });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErr(null);
    setMsg(null);
    setUploadPct(0);
    setBusy(true);
    try {
      await uploadFile(f, (p) => setUploadPct(p));
      setMsg("Upload concluído");
      setUploadPct(null);
      await refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Falha no upload");
      setUploadPct(null);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    setErr(null);
    setBusy(true);
    try {
      await deleteFile(id);
      await refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Falha ao excluir");
    } finally {
      setBusy(false);
    }
  }

  async function onDownload(row: UserFileRow) {
    setErr(null);
    try {
      await downloadFile(row.id, row.original_name);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Falha no download");
    }
  }

  if (!user) {
    return <p>Carregando…</p>;
  }

  return (
    <div>
      <div className="card">
        <h1>Meus arquivos</h1>
        <p>
          Logado como <strong>{user.email}</strong> (id {user.id})
        </p>
        <div className="row">
          <button type="button" onClick={() => void onLogout()} disabled={busy}>
            Sair
          </button>
          <Link to="/login">Trocar de conta</Link>
        </div>
      </div>

      <div className="card">
        <h2>Enviar arquivo</h2>
        <p className="error" style={{ marginTop: 0 }}>
          Permitidos: .png, .jpg, .jpeg, .pdf, .txt — máximo 10MB
        </p>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.txt"
          disabled={busy}
          onChange={(e) => void onFileChange(e)}
        />
        {uploadPct !== null ? <p>Upload: {uploadPct}%</p> : null}
        {msg ? <p className="success">{msg}</p> : null}
        {err ? <p className="error">{err}</p> : null}
      </div>

      <div className="card">
        <h2>Lista</h2>
        {files.length === 0 ? <p>Nenhum arquivo ainda.</p> : null}
        {files.map((row) => (
          <div key={row.id} className="file-row">
            {isImage(row.content_type) ? (
              <img
                className="thumb"
                src={previewUrl(row.id)}
                alt={row.original_name}
              />
            ) : null}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div>
                <strong>{row.original_name}</strong>
              </div>
              <div style={{ fontSize: "0.9rem", color: "#475569" }}>
                {fmtBytes(row.size)} · {new Date(row.created_at).toLocaleString()}
              </div>
              <div className="row" style={{ marginTop: "0.5rem" }}>
                <button type="button" disabled={busy} onClick={() => void onDownload(row)}>
                  Download
                </button>
                <button type="button" disabled={busy} onClick={() => void onDelete(row.id)}>
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
