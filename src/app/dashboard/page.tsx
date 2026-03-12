/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
 
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
    id: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
    items: any[];
};

type PrintOrder = {
    id: string;
    fileName: string;
    totalPages: number;
    copies: number;
    colorMode: string;
    totalPrice: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
};

export default function UserDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [printOrders, setPrintOrders] = useState<PrintOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch("/api/orders").then(res => res.ok ? res.json() : []),
            fetch("/api/print-orders").then(res => res.ok ? res.json() : [])
        ])
            .then(([orderData, printData]) => {
                setOrders(orderData || []);
                setPrintOrders(printData || []);
                setLoading(false);
            })
            .catch(() => {
                router.push("/login");
            });
    }, [router]);

    if (loading) return <div style={{ padding: "80px", textAlign: "center" }}>Loading your dashboard...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: "60px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                <h1 className="text-gradient" style={{ fontSize: "2.5rem" }}>My Dashboard</h1>
                <button onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/login");
                }} className="btn btn-ghost">Logout</button>
            </div>

            <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Recent Orders</h2>

            {orders.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                    You have no orders yet.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {orders.map(order => (
                        <div key={order.id} className="glass" style={{ padding: "24px", borderRadius: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                                <div>
                                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Order ID</p>
                                    <p style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fff" }}>{order.id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Delivery Status</p>
                                    <p style={{ color: order.status === "DELIVERED" ? "#4ade80" : "var(--primary)", fontWeight: "bold", margin: 0 }}>{order.status}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Payment ({order.paymentMethod})</p>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold",
                                        background: order.paymentStatus === 'Paid' || order.paymentStatus === 'Verified' ? 'rgba(74, 222, 128, 0.1)' : order.paymentStatus === 'Failed' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 204, 0, 0.1)',
                                        color: order.paymentStatus === 'Paid' || order.paymentStatus === 'Verified' ? '#4ade80' : order.paymentStatus === 'Failed' ? '#ff4d4d' : '#ffcc00'
                                    }}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                                {order.items.map((item: any) => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                                        <span>{item.quantity}x {item.product.name}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1rem" }}>
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Print Jobs Section */}
            <h2 style={{ fontSize: "1.5rem", marginBottom: "24px", marginTop: "48px", color: "#fff" }}>Recent Print Jobs</h2>

            {printOrders.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    You have no print orders yet.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {printOrders.map(print => (
                        <div key={print.id} className="glass" style={{ padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,255,204,0.1)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px" }}>
                                <div>
                                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Print ID</p>
                                    <p style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fff" }}>{print.id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Delivery Status</p>
                                    <p style={{ color: print.orderStatus === "Delivered" ? "#4ade80" : "var(--primary)", fontWeight: "bold", margin: 0 }}>{print.orderStatus}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Payment ({print.paymentMethod})</p>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold",
                                        background: print.paymentStatus === 'Paid' || print.paymentStatus === 'Verified' ? 'rgba(74, 222, 128, 0.1)' : print.paymentStatus === 'Failed' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 204, 0, 0.1)',
                                        color: print.paymentStatus === 'Paid' || print.paymentStatus === 'Verified' ? '#4ade80' : print.paymentStatus === 'Failed' ? '#ff4d4d' : '#ffcc00'
                                    }}>
                                        {print.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", color: "#ccc" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                                    <span style={{ fontWeight: "bold", color: "#fff" }}>📄 {print.fileName}</span>
                                    <span>{print.colorMode}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>{print.totalPages} Pages × {print.copies} Copies</p>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1rem" }}>
                                <span>Total Price</span>
                                <span>₹{print.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

