import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function AuthForm() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
      {mode === "signup" && (
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      )}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <div className="pw-wrap">
        <input
          type={showPw ? "text" : "password"}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setShowPw(s => !s)}
          aria-label={showPw ? "Hide password" : "Show password"}
        >
          {showPw ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>
        {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </button>
      <button
        type="button"
        className="link"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
        }}
      >
        {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
      </button>
    </form>
  );
}