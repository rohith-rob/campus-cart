"use client";
import { useState } from "react";
import Link from "next/link";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Force a full refresh to update session state globally
                window.location.href = "/admin";
            } else {
                setError(data.error || "Login failed");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center animate-fade-in" style={{ minHeight: "calc(100vh - 80px)", padding: "20px" }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: "400px", padding: "40px", border: "1px solid rgba(0, 255, 204, 0.4)", boxShadow: "0 0 40px rgba(0, 255, 204, 0.1)" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 className="text-gradient" style={{ fontSize: "2rem", marginBottom: "8px" }}>Admin Portal</h1>
                    <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Restricted access. Authorized personnel only.</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(255, 0, 0, 0.1)", color: "#ff8080", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem", textAlign: "center", border: "1px solid rgba(255, 0, 0, 0.2)" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Admin Email ID</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@campuscart.com"
                            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Secure Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "12px", padding: "14px", fontSize: "1.05rem", fontWeight: "bold", letterSpacing: "1px" }}>
                        {loading ? "Authenticating..." : "SECURE LOGIN"}
                    </button>
                </form>

                <div style={{ marginTop: "32px", textAlign: "center" }}>
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                        Not an admin? <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none" }}>Return to User Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
