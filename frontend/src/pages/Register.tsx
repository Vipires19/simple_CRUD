import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await register(email, password);
      nav("/login", { replace: true });
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
      <h1>Cadastro</h1>
      <p className="text-muted" style={{ marginTop: "0.35rem" }}>
        Já tem conta? <Link to="/login">Entrar</Link>
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-subtle" style={{ marginTop: "0.35rem", marginBottom: 0 }}>
            Mínimo de 8 caracteres.
          </p>
        </div>
        {err ? <p className="error" style={{ marginTop: "1rem" }}>{err}</p> : null}
        <div className="row" style={{ marginTop: "1.25rem" }}>
          <button type="submit" className="btn-primary">
            Cadastrar
          </button>
          <Link to="/login" className="btn-secondary">
            Ir para login
          </Link>
        </div>
      </form>
    </div>
  );
}
