import { useState } from "react";
import { LogIn, AlertCircle } from "lucide-react";

function LoginPage({ onLogin }) {
  const [hrmsId, setHrmsId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dummy user database
  const dummyUsers = [
    { hrmsId: "PM_1001", password: "password123", role: "Pointsman" },
    { hrmsId: "SM_1001", password: "password123", role: "Station Master" },
    { hrmsId: "TM_1001", password: "password123", role: "Train Manager" },
    { hrmsId: "SS_1001", password: "password123", role: "Station Superintendent" },
    { hrmsId: "TI_1001", password: "password123", role: "Traffic Inspector" },
    { hrmsId: "GM_1001", password: "password123", role: "AOM/General" },
    { hrmsId: "SA_1001", password: "password123", role: "Super Admin" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (!hrmsId.trim() || !password.trim()) {
        setError("Please enter both HRMS ID and Password");
        setLoading(false);
        return;
      }

      // Validate credentials
      const user = dummyUsers.find(
        (u) => u.hrmsId === hrmsId && u.password === password
      );

      if (user) {
        // Extract role from ID prefix
        const idPrefix = hrmsId.split("_")[0];
        const roleMap = {
          PM: "Pointsman",
          SM: "Station Master",
          TM: "Train Manager",
          SS: "Station Superintendent",
          TI: "Traffic Inspector",
          GM: "AOM/General",
          SA: "Super Admin"
        };

        const detectedRole = roleMap[idPrefix] || user.role;

        onLogin({
          hrmsId: user.hrmsId,
          role: detectedRole,
          name: `${detectedRole} User`
        });
      } else {
        setError("Invalid HRMS ID or Password");
      }

      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-badge">IR</div>
            </div>
            <h1>Indian Railway</h1>
            <p>Staff Management System</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="login-field">
              <label>HRMS ID</label>
              <input
                type="text"
                value={hrmsId}
                onChange={(e) => setHrmsId(e.target.value)}
                placeholder="e.g., SA_1001, SM_1001"
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">Signing in...</span>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-demo-info">
            <h4>Demo Credentials</h4>
            <div className="demo-list">
              <div>Super Admin: SA_1001</div>
              <div>Station Master: SM_1001</div>
              <div>Train Manager: TM_1001</div>
              <div>Traffic Inspector: TI_1001</div>
              <div className="demo-password">Password: password123</div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2026 Indian Railways. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
