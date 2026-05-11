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
      <h1>Login</h1>
      <p>
        Novo por aqui? <Link to="/register">Cadastrar</Link>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err ? <p className="error">{err}</p> : null}
        <div style={{ marginTop: "1rem" }} className="row">
          <button type="submit">Entrar</button>
        </div>
      </form>
    </div>
  );
}
