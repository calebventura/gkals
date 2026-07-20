import { FormEvent, useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";

interface AuthScreenProps {
  isSupabaseConfigured: boolean;
  onDemoStart: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<void>;
}

export function AuthScreen({
  isSupabaseConfigured,
  onDemoStart,
  onSignIn,
  onSignUp
}: AuthScreenProps) {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        await onSignUp(email, password, displayName);
      } else {
        await onSignIn(email, password);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo completar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="brand-block">
        <div className="app-mark">G</div>
        <div>
          <p className="eyebrow">Gkals</p>
          <h1>Haz lo que dijiste que ibas a hacer.</h1>
        </div>
      </section>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="segmented" role="tablist" aria-label="Modo de acceso">
          <button
            type="button"
            className={mode === "sign-up" ? "active" : ""}
            onClick={() => setMode("sign-up")}
          >
            Crear cuenta
          </button>
          <button
            type="button"
            className={mode === "sign-in" ? "active" : ""}
            onClick={() => setMode("sign-in")}
          >
            Entrar
          </button>
        </div>

        {mode === "sign-up" ? (
          <label>
            Nombre
            <input
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tu nombre"
              required
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            autoComplete="email"
            inputMode="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
          />
        </label>

        <label>
          Password
          <input
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-action" type="submit" disabled={isSubmitting}>
          {mode === "sign-up" ? <ShieldCheck size={20} /> : <LogIn size={20} />}
          {isSubmitting ? "Procesando" : mode === "sign-up" ? "Crear sin verificacion" : "Entrar"}
        </button>

          <button className="secondary-action" type="button" onClick={onDemoStart}>
            Abrir modo de prueba local
          </button>
      </form>
    </main>
  );
}
