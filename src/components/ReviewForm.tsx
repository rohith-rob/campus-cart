"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
    productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, rating, comment })
            });

            if (res.ok) {
                setSuccess(true);
                setRating(0);
                setComment("");
                // Refresh the page to show the new review
                router.refresh();
                setTimeout(() => setSuccess(false), 5000);
            } else {
                const data = await res.json();
                if (res.status === 401) {
                    setError("You must be logged in to post a review.");
                } else {
                    setError(data.error || "Something went wrong.");
                }
            }
        } catch (err) {
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ padding: "32px", textAlign: "center", background: "rgba(74, 222, 128, 0.1)", borderRadius: "12px", border: "1px solid rgba(74, 222, 128, 0.3)" }}>
                <h3 style={{ color: "#4ade80", marginBottom: "8px" }}>Review Submitted!</h3>
                <p style={{ color: "var(--muted)" }}>Thank you for sharing your feedback with the community.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "24px" }}>Write a Review</h3>

            {error && (
                <div style={{ padding: "12px 16px", background: "rgba(255, 0, 0, 0.1)", color: "#ff8080", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem", border: "1px solid rgba(255, 0, 0, 0.2)" }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "var(--muted)", marginBottom: "12px", fontSize: "0.95rem" }}>Overall Rating</label>
                <div style={{ display: "flex", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", transition: "transform 0.2s" }}
                            className="hover-zoom"
                        >
                            <Star
                                size={32}
                                fill={(hover || rating) >= star ? "var(--primary)" : "none"}
                                color={(hover || rating) >= star ? "var(--primary)" : "var(--muted)"}
                                style={{ filter: (hover || rating) >= star ? "drop-shadow(0 0 5px var(--primary-glow))" : "none" }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
                <label htmlFor="comment" style={{ display: "block", color: "var(--muted)", marginBottom: "12px", fontSize: "0.95rem" }}>Your Experience (Optional)</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike? How's the quality?"
                    style={{
                        width: "100%",
                        minHeight: "120px",
                        padding: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "1rem",
                        outline: "none",
                        transition: "border-color 0.2s",
                        resize: "vertical"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: "bold" }}
            >
                {loading ? "Posting Review..." : "Submit Review"}
            </button>
        </form>
    );
}
