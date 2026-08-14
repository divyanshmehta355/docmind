import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Mail, Lock, Brain } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slide-in-up">
        {}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Brain size={32} />
          </div>
          <h1 className="auth-logo-text">
            Doc<span className="gradient-text">Mind</span>
          </h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        {}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error animate-fade-in">{error}</div>}

          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="register-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="register-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="register-confirm"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-loading">Creating account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          position: relative;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: var(--radius-xl);
          padding: 1px;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple), var(--accent-pink));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.4;
          animation: borderGlow 4s ease-in-out infinite;
        }

        .auth-logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--gradient-primary);
          color: white;
          margin-bottom: 16px;
        }

        .auth-logo-text {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-field label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-wrap .input-field {
          padding-left: 44px;
        }

        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .auth-error {
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.3);
          color: var(--error);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
        }

        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          margin-top: 4px;
          font-size: 1rem;
        }

        .auth-loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-switch {
          text-align: center;
          margin-top: 24px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .auth-switch a {
          color: var(--accent-blue);
          font-weight: 600;
          transition: color var(--transition-fast);
        }

        .auth-switch a:hover {
          color: var(--accent-purple);
        }
      `}</style>
    </div>
  );
}
