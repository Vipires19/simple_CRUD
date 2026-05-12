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

function fileExtLabel(filename: string): string {
  const ext = filename.split(".").pop();
  if (!ext) return "FILE";
  return ext.slice(0, 5).toUpperCase();
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
    return (
      <div className="page-loading" aria-busy="true">
        <div className="spinner" />
        <span className="text-muted">Carregando…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="card card--header">
        <div>
          <div className="brand-mark">
            <span className="brand-mark__dot" aria-hidden />
            File Manager
          </div>
          <h1>Meus arquivos</h1>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            <span className="mono">{user.email}</span>
            <span className="text-subtle"> · id {user.id}</span>
          </p>
        </div>
        <div className="row row--end">
          <button type="button" className="btn-secondary" onClick={() => void onLogout()} disabled={busy}>
            Sair
          </button>
          <Link to="/login" className="btn-ghost">
            Trocar de conta
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Enviar</h2>
        <p className="error hint">Tipos permitidos: .png, .jpg, .jpeg, .pdf, .txt — máximo 10MB</p>
        <label className="upload-zone">
          <span className="upload-zone__title">
            {busy && uploadPct !== null ? `Enviando… ${uploadPct}%` : "Escolher arquivo"}
          </span>
          <span className="upload-zone__hint">Clique para selecionar um arquivo no seu dispositivo</span>
          <input
            type="file"
            className="sr-only"
            accept=".png,.jpg,.jpeg,.pdf,.txt"
            disabled={busy}
            onChange={(e) => void onFileChange(e)}
          />
        </label>
        {uploadPct !== null && busy ? (
          <div className="upload-bar" aria-hidden>
            <div className="upload-bar__fill" style={{ width: `${uploadPct}%` }} />
          </div>
        ) : null}
        {msg ? <p className="success" style={{ marginTop: "1rem", marginBottom: 0 }}>{msg}</p> : null}
        {err ? <p className="error" style={{ marginTop: "1rem", marginBottom: 0 }}>{err}</p> : null}
      </div>

      <div className="card">
        <h2>Arquivos</h2>
        {files.length === 0 ? <p className="empty-state">Nenhum arquivo ainda. Envie o primeiro acima.</p> : null}
        {files.map((row) => (
          <div key={row.id} className="file-row">
            {isImage(row.content_type) ? (
              <img className="thumb" src={previewUrl(row.id)} alt={row.original_name} />
            ) : (
              <div className="thumb thumb--doc" aria-hidden>
                {fileExtLabel(row.original_name)}
              </div>
            )}
            <div className="file-meta">
              <div className="file-name">{row.original_name}</div>
              <div className="file-details">
                {fmtBytes(row.size)} · {new Date(row.created_at).toLocaleString()}
              </div>
              <div className="row" style={{ marginTop: "0.65rem" }}>
                <button type="button" className="btn-primary" disabled={busy} onClick={() => void onDownload(row)}>
                  Download
                </button>
                <button type="button" className="btn-danger" disabled={busy} onClick={() => void onDelete(row.id)}>
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
