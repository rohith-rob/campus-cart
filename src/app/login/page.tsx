"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push("/dashboard");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "40px" }}>
                <h1 style={{ textAlign: "center", marginBottom: "8px", fontSize: "2rem" }}>Welcome Back</h1>
                <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: "32px" }}>Sign in to continue</p>

                {error && <div style={{ background: "rgba(255,0,0,0.1)", color: "#ff8080", padding: "12px", borderRadius: "8px", marginBottom: "24px", textAlign: "center", fontSize: "0.9rem" }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--muted)" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontSize: "1rem" }}
                            placeholder="student@college.edu"
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--muted)" }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontSize: "1rem" }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: "12px", padding: "14px" }}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--muted)" }}>
                    Don't have an account? <Link href="/register" style={{ color: "var(--primary)" }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
