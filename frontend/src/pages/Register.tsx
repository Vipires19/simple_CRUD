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
      <h1>Cadastro</h1>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="email">E-mail</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <label htmlFor="password">Senha</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err ? <p className="error">{err}</p> : null}
        <div style={{ marginTop: "1rem" }} className="row">
          <button type="submit">Cadastrar</button>
          <Link to="/login">Ir para login</Link>
        </div>
      </form>
    </div>
  );
}
