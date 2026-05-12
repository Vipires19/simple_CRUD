import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/home", { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Erro");
    }
  }

  return (
    <div className="card">
      <div className="brand-mark">
        <span className="brand-mark__dot" aria-hidden />
        File Manager
      </div>
      <h1>Entrar</h1>
      <p className="text-muted" style={{ marginTop: "0.35rem" }}>
        Novo por aqui? <Link to="/register">Cadastrar</Link>
      </p>
      <form onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err ? <p className="error" style={{ marginTop: "1rem" }}>{err}</p> : null}
        <div className="row" style={{ marginTop: "1.25rem" }}>
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}
