"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { items, removeFromCart, total } = useCart();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="container animate-fade-in" style={{ padding: "80px 24px", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "16px" }}>Your Cart is Empty</h1>
                <p style={{ color: "var(--muted)", marginBottom: "32px" }}>Looks like you haven't added any products yet.</p>
                <Link href="/products" className="btn btn-primary">Browse Menu</Link>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: "60px 24px" }}>
            <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "32px" }}>Review Cart</h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
                <div style={{ flex: "2 1 500px" }}>
                    {items.map(item => (
                        <div key={item.id} className="glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", marginBottom: "16px", borderRadius: "12px" }}>
                            <div>
                                <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{item.name}</h3>
                                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Qty: {item.quantity}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
                                <button onClick={() => removeFromCart(item.id)} style={{ background: "transparent", color: "#ff8080", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ flex: "1 1 300px" }}>
                    <div className="glass-card" style={{ position: "sticky", top: "100px" }}>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Order Summary</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--muted)" }}>
                            <span>Subtotal</span>
                            <span>₹{total}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--muted)" }}>
                            <span>Delivery Fee</span>
                            <span>₹20</span>
                        </div>
                        <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "1.2rem", fontWeight: "bold" }}>
                            <span>Total</span>
                            <span className="text-gradient">₹{total + 20}</span>
                        </div>

                        <button className="btn btn-primary" style={{ width: "100%", padding: "16px" }} onClick={() => router.push("/checkout")}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
