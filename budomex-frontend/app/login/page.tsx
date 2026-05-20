import AtmospherePanel from "./_components/AtmospherePanel";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="login-shell">
      <AtmospherePanel />
      <main className="login-main">
        <div className="login-corner" aria-hidden="true">
          <span className="dot" />
          <span>Logowanie</span>
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
