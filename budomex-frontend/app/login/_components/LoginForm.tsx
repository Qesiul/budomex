"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../../(marketing)/_components/Logo";
import { useAuth, type Role } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const IS_DEV = process.env.NODE_ENV !== "production";

const TEST_ACCOUNTS: Array<{ role: Role; username: string; password: string; label: string }> = [
  { role: "manager", username: "manager", password: "manager123", label: "Manager" },
  { role: "worker", username: "worker", password: "worker123", label: "Pracownik" },
];

function destinationFor(role: Role): string {
  return role === "manager" ? "/oms/manager" : "/oms/worker";
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fillTestAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!username.trim() || !password) {
      setError("Podaj nazwę użytkownika i hasło.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(username.trim(), password);
      router.replace(destinationFor(user.role));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Błędna nazwa użytkownika lub hasło.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError("Pola formularza są wymagane.");
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Nie udało się zalogować. Spróbuj ponownie za chwilę.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-mark">
        <Logo />
        <span className="mark-sub">OMS</span>
      </div>

      <h2>Otwórz dzień.</h2>
      <p className="login-lead">
        Manager lub produkcja — tym samym kontem. Po zalogowaniu zobaczysz panel
        dopasowany do swojej roli.
      </p>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-username">
            <span>Login</span>
          </label>
          <div className="input-wrap">
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              placeholder="np. manager"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-password">
            <span>Hasło</span>
          </label>
          <div className="input-wrap has-toggle">
            <input
              id="login-password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
            <button
              type="button"
              className="toggle-pw"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Ukryj hasło" : "Pokaż hasło"}
              tabIndex={-1}
            >
              {showPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="m1 1 22 22" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spin" aria-hidden="true" />
              Loguję…
            </>
          ) : (
            <>
              Zaloguj się
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {IS_DEV && (
        <div className="login-dev">
          <div className="login-dev-head">Konta testowe</div>
          <div className="login-dev-grid">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                className="login-dev-chip"
                onClick={() => fillTestAccount(acc.username, acc.password)}
              >
                <span className="chip-role">{acc.label}</span>
                <span className="chip-creds">
                  {acc.username} / {acc.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="login-foot">
        <span>Backend: http://localhost:8080</span>
        <span className="sep">·</span>
        <Link href="/">Strona główna</Link>
      </div>
    </div>
  );
}
