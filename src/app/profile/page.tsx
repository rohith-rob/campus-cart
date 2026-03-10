/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState({
        name: "", email: "", phone: "",
        accommodationType: "", addressDetails: "",
        collegeName: "", course: "", year: "", avatar: ""
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "", newPassword: "", confirmPassword: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetch("/api/user/profile")
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
                // Handle nulls gracefully
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    accommodationType: data.accommodationType || "",
                    addressDetails: data.addressDetails || "",
                    collegeName: data.collegeName || "",
                    course: data.course || "",
                    year: data.year || "",
                    avatar: data.avatar || ""
                });
                setLoading(false);
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure file is an image
        if (!file.type.startsWith('image/')) {
            setMessage({ type: "error", text: "Please select a valid image file (JPG, PNG)." });
            return;
        }

        // 5MB Limit Check
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: "error", text: "Image is too large. Maximum size is 5MB." });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile({ ...profile, avatar: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        // Client-side validations
        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            setSaving(false);
            return;
        }

        if (passwords.newPassword && !passwords.currentPassword) {
            setMessage({ type: "error", text: "Current password is required to set a new password" });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...profile,
                    ...(passwords.newPassword ? {
                        currentPassword: passwords.currentPassword,
                        newPassword: passwords.newPassword
                    } : {})
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.error || "Failed to save profile" });
            } else {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Clear security fields
            }
        } catch {
            setMessage({ type: "error", text: "Network error occurred" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: "80px", textAlign: "center" }}>Loading Profile...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: "40px 24px", maxWidth: "900px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px" }}>
                <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(45deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", color: "#000", fontWeight: "bold", overflow: "hidden", border: "3px solid var(--border)" }}>
                    {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (profile.name.charAt(0).toUpperCase())}
                </div>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "8px", lineHeight: "1.2" }}>My Profile</h1>
                    <label style={{ cursor: "pointer", display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "8px", fontSize: "0.9rem", color: "#fff", transition: "0.2s" }} className="hover-glow">
                        Update Photo
                        <input type="file" accept="image/png, image/jpeg, image/jpg" style={{ display: "none" }} onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            {message.text && (
                <div style={{ padding: "16px", borderRadius: "8px", marginBottom: "32px", background: message.type === "error" ? "rgba(255,0,0,0.1)" : "rgba(0,255,100,0.1)", color: message.type === "error" ? "#ff8080" : "#4ade80", border: `1px solid ${message.type === "error" ? "rgba(255,0,0,0.3)" : "rgba(0,255,100,0.3)"}` }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Section 1: Personal Info */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", color: "var(--primary)" }}>Personal Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Full Name</label>
                            <input required type="text" name="name" className="input-field" value={profile.name} onChange={handleProfileChange} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Email Address</label>
                            <input required type="email" name="email" className="input-field" value={profile.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Phone Number</label>
                            <input type="tel" name="phone" className="input-field" value={profile.phone} onChange={handleProfileChange} placeholder="+91 xxxxxxxxxx" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Delivery Specifics */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", color: "var(--primary)" }}>Delivery Address</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Accommodation Type</label>
                            <select name="accommodationType" className="input-field" value={profile.accommodationType} onChange={handleProfileChange}>
                                <option value="" style={{ color: "#000" }}>Select Type</option>
                                <option value="Hostel" style={{ color: "#000" }}>College Hostel</option>
                                <option value="PG" style={{ color: "#000" }}>Paying Guest (PG)</option>
                                <option value="Apartment" style={{ color: "#000" }}>Private Apartment</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Room Number & Building/Block</label>
                            <input type="text" name="addressDetails" className="input-field" value={profile.addressDetails} onChange={handleProfileChange} placeholder="e.g. Room 402, Block A, Men's Hostel" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Student Info */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", color: "var(--primary)" }}>Student Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>College Name</label>
                            <input type="text" name="collegeName" className="input-field" value={profile.collegeName} onChange={handleProfileChange} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Course / Major</label>
                            <input type="text" name="course" className="input-field" value={profile.course} onChange={handleProfileChange} placeholder="e.g. B.Tech Computer Science" />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Current Year</label>
                            <select name="year" className="input-field" value={profile.year} onChange={handleProfileChange}>
                                <option value="" style={{ color: "#000" }}>Select Year</option>
                                <option value="1st Year" style={{ color: "#000" }}>1st Year</option>
                                <option value="2nd Year" style={{ color: "#000" }}>2nd Year</option>
                                <option value="3rd Year" style={{ color: "#000" }}>3rd Year</option>
                                <option value="4th Year" style={{ color: "#000" }}>4th Year</option>
                                <option value="Masters" style={{ color: "#000" }}>Masters / Postgrad</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 4: Account Security */}
                <div className="glass-card" style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", color: "#ccc" }}>Account Security</h3>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "24px" }}>Leave these fields empty if you do not wish to change your password.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Current Password</label>
                            <input type="password" name="currentPassword" className="input-field" value={passwords.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>New Password</label>
                            <input type="password" name="newPassword" className="input-field" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="••••••••" />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Confirm New Password</label>
                            <input type="password" name="confirmPassword" className="input-field" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" />
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "16px" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => router.push("/dashboard")}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving Changes..." : "Save Profile"}
                    </button>
                </div>

            </form>
        </div>
    );
}
