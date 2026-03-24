/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products'

    // Combined State
    const [allOrders, setAllOrders] = useState<any[]>([]);

    // Product State
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', categoryName: '', description: '', imageUrl: '' });

    // Settings State
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrUploading, setQrUploading] = useState(false);
    const [qrVersion, setQrVersion] = useState(Date.now());

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'overview') {
                const [ordersRes, printsRes] = await Promise.all([
                    fetch("/api/admin/orders"),
                    fetch("/api/admin/print-jobs")
                ]);

                if (!ordersRes.ok || !printsRes.ok) throw new Error("Unauthorized");

                const ordersData = await ordersRes.json();
                const printsData = await printsRes.json();

                const combined = [
                    ...ordersData.map((o: any) => ({ ...o, _type: 'PRODUCT', _date: new Date(o.createdAt).getTime() })),
                    ...printsData.map((p: any) => ({ ...p, _type: 'PRINT', _date: new Date(p.createdAt).getTime() }))
                ].sort((a, b) => b._date - a._date);

                setAllOrders(combined);
            } else if (activeTab === 'products') {
                const [pRes, cRes] = await Promise.all([
                    fetch("/api/admin/products"),
                    fetch("/api/admin/categories")
                ]);
                if (!pRes.ok || !cRes.ok) throw new Error("Unauthorized");
                setProducts(await pRes.json());
                setCategories(await cRes.json());
            }
        } catch {
            router.push("/admin/login");
        }
    };

    const updateStatus = async (item: any, statusType: 'delivery' | 'payment', newValue: string) => {
        const endpoint = item._type === 'PRODUCT' ? "/api/admin/orders" : "/api/admin/print-jobs";
        const payload: any = item._type === 'PRODUCT' ? { orderId: item.id } : { id: item.id };

        if (statusType === 'delivery') {
            payload.status = newValue; // PRODUCT
            if (item._type === 'PRINT') {
                payload.status = newValue; // API expecting 'status' for PRINT as well
            }
        } else {
            payload.paymentStatus = newValue;
        }

        const res = await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setAllOrders(prev => prev.map(o => {
                if (o.id === item.id && o._type === item._type) {
                    if (statusType === 'delivery') {
                        return { ...o, [item._type === 'PRODUCT' ? 'status' : 'orderStatus']: newValue };
                    } else {
                        return { ...o, paymentStatus: newValue };
                    }
                }
                return o;
            }));
        }
    };

    const downloadPdf = (base64String: string, fileName: string) => {
        const a = document.createElement("a");
        a.href = base64String;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Product Management
    const saveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
        const method = editingProduct ? "PUT" : "POST";
        const payload = editingProduct || newProduct;

        // Ensure numbers
        const formattedPayload = {
            ...payload,
            price: Number(payload.price),
            stock: Number(payload.stock || 0)
        };

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formattedPayload)
        });

        if (res.ok) {
            setNewProduct({ name: '', price: '', stock: '', categoryName: '', description: '', imageUrl: '' });
            setEditingProduct(null);
            fetchData();
        } else {
            alert("Failed to save product.");
        }
        setIsSubmitting(false);
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) setProducts(products.filter(p => p.id !== id));
    };

    // Compute Dashboard Stats
    const totalOrdersCount = allOrders.length;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newOrdersToday = allOrders.filter(o => o._date >= todayStart.getTime()).length;

    const pendingOrders = allOrders.filter(o => {
        const status = o._type === 'PRODUCT' ? o.status : o.orderStatus;
        return ['ORDERED', 'PACKED', 'Uploaded', 'Printing', 'Ready'].includes(status);
    }).length;

    const deliveredOrders = allOrders.filter(o => {
        const status = o._type === 'PRODUCT' ? o.status : o.orderStatus;
        return status === 'DELIVERED' || status === 'Delivered';
    }).length;

    const outForDeliveryOrders = allOrders.filter(o => {
        const status = o._type === 'PRODUCT' ? o.status : o.orderStatus;
        return status === 'OUT_FOR_DELIVERY' || status === 'Out for Delivery';
    }).length;


    return (
        <div className="container animate-fade-in" style={{ padding: "60px 24px", maxWidth: "1400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h1 className="text-gradient" style={{ fontSize: "2.5rem" }}>Admin Workspace</h1>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "16px", background: "rgba(0,0,0,0.3)", padding: "6px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <button
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('overview')}
                        style={{ padding: "8px 24px", borderRadius: "8px" }}
                    >
                        Order Dashboard
                    </button>
                    <button
                        className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('products')}
                        style={{ padding: "8px 24px", borderRadius: "8px" }}
                    >
                        Product Management
                    </button>
                    <button
                        className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('settings')}
                        style={{ padding: "8px 24px", borderRadius: "8px" }}
                    >
                        Settings
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); }}
                        style={{ padding: "8px 24px", borderRadius: "8px", color: "#ff4d4d" }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div className="glass-card" style={{ padding: "24px", borderTop: "4px solid var(--primary)" }}>
                            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "8px" }}>Total Lifetime Orders</p>
                            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{totalOrdersCount}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: "24px", borderTop: "4px solid #4ade80" }}>
                            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "8px" }}>New Today</p>
                            <h2 style={{ fontSize: "2.5rem", margin: 0, color: "#4ade80" }}>{newOrdersToday}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: "24px", borderTop: "4px solid #ffcc00" }}>
                            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "8px" }}>In Processing / Pending</p>
                            <h2 style={{ fontSize: "2.5rem", margin: 0, color: "#ffcc00" }}>{pendingOrders}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: "24px", borderTop: "4px solid #a78bfa" }}>
                            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "8px" }}>Out for Delivery</p>
                            <h2 style={{ fontSize: "2.5rem", margin: 0, color: "#a78bfa" }}>{outForDeliveryOrders}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: "24px", borderTop: "4px solid #60a5fa" }}>
                            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "8px" }}>Successfully Delivered</p>
                            <h2 style={{ fontSize: "2.5rem", margin: 0, color: "#60a5fa" }}>{deliveredOrders}</h2>
                        </div>
                    </div>

                    {/* Unified Orders Table */}
                    <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
                            <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Unified Master Queue</h3>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid var(--border)" }}>
                                        <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: "normal" }}>Order Id</th>
                                        <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: "normal" }}>Customer / Contact</th>
                                        <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: "normal" }}>Type & Amount</th>
                                        <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: "normal" }}>Payment Verification</th>
                                        <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: "normal" }}>Delivery Pipeline</th>
                                        <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: "normal" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrders.map(item => {
                                        const isProduct = item._type === 'PRODUCT';
                                        const deliveryStatus = isProduct ? item.status : item.orderStatus;
                                        const paymentStatusColor = item.paymentStatus === 'Paid' || item.paymentStatus === 'Verified' ? "#4ade80" : item.paymentStatus === 'Failed' ? "#ff8080" : "#ffcc00";

                                        return (
                                            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }} className="hover-row">
                                                <td style={{ padding: "20px 24px", fontFamily: "monospace", color: "#e0e0e0" }}>{item.id.slice(-8).toUpperCase()}</td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div style={{ fontWeight: "bold" }}>{item.user?.name || "Unknown"}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>{item.user?.phone || "No Phone"}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{isProduct ? item.deliveryLocation : item.address}</div>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                                                        <div style={{ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", background: isProduct ? "rgba(0, 255, 204, 0.1)" : "rgba(167, 139, 250, 0.1)", color: isProduct ? "var(--primary)" : "#a78bfa" }}>
                                                            {isProduct ? "STORE ORDER" : "PDF PRINT"}
                                                        </div>
                                                        {item.isUrgent && (
                                                            <div style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", background: "rgba(255, 77, 77, 0.1)", color: "#ff4d4d", fontWeight: "bold", border: "1px solid rgba(255, 77, 77, 0.3)" }}>
                                                                URGENT
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>₹{Number(isProduct ? item.totalAmount : item.totalPrice).toFixed(2)}</div>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div style={{ marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted)" }}>Method: <strong style={{ color: "#fff" }}>{item.paymentMethod}</strong></div>
                                                    {item.paymentMethod === 'UPI' && item.transactionId && (
                                                        <div style={{ fontSize: "0.8rem", color: "#00ffcc", margin: "2px 0 6px 0", fontFamily: "monospace" }}>UTR: {item.transactionId}</div>
                                                    )}
                                                    <select
                                                        value={item.paymentStatus}
                                                        onChange={(e) => updateStatus(item, 'payment', e.target.value)}
                                                        style={{ padding: "6px", borderRadius: "6px", background: "rgba(0,0,0,0.5)", color: paymentStatusColor, border: `1px solid ${paymentStatusColor}40`, outline: "none", fontSize: "0.85rem" }}
                                                    >
                                                        <option value="Pending" style={{ color: "#fff" }}>Pending</option>
                                                        <option value="Submitted" style={{ color: "#fff" }}>Submitted</option>
                                                        <option value="Verified" style={{ color: "#fff" }}>Verified</option>
                                                        <option value="Paid" style={{ color: "#fff" }}>Paid</option>
                                                        <option value="Paid on Delivery" style={{ color: "#fff" }}>Paid on Del.</option>
                                                        <option value="Failed" style={{ color: "#fff" }}>Failed</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <select
                                                        value={deliveryStatus}
                                                        onChange={(e) => updateStatus(item, 'delivery', e.target.value)}
                                                        style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid var(--border)", outline: "none", width: "160px" }}
                                                    >
                                                        {isProduct ? (
                                                            <>
                                                                <option value="ORDERED">ORDERED</option>
                                                                <option value="PACKED">PACKED</option>
                                                                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                                                <option value="DELIVERED">DELIVERED</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="Uploaded">Uploaded</option>
                                                                <option value="Printing">Printing</option>
                                                                <option value="Ready">Ready</option>
                                                                <option value="Out for Delivery">Out for Delivery</option>
                                                                <option value="Delivered">Delivered</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    {isProduct ? (
                                                        <div style={{ fontSize: "0.8rem", color: "var(--muted)", maxWidth: "150px" }}>
                                                            {item.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(', ')}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => downloadPdf(item.fileData, item.fileName)}
                                                            className="btn btn-ghost"
                                                            style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#00ffcc", border: "1px solid rgba(0,255,204,0.3)" }}
                                                        >
                                                            ↓ PDF
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {allOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>No orders found in the database.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "start" }}>

                    {/* Add/Edit Product Form */}
                    <div className="glass-card" style={{ padding: "32px", position: "sticky", top: "100px" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "24px" }}>{editingProduct ? "Edit Product Details" : "Publish New Product"}</h2>

                        <form onSubmit={saveProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Product Name</label>
                                <input required type="text" className="input-field" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>

                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Price (₹)</label>
                                    <input required type="number" step="0.01" className="input-field" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Inventory Stock</label>
                                    <input required type="number" className="input-field" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Category (Select or Type New)</label>
                                <input 
                                    required 
                                    type="text" 
                                    list="category-suggestions"
                                    className="input-field" 
                                    placeholder="e.g. Stationery"
                                    value={editingProduct ? editingProduct.categoryName : newProduct.categoryName} 
                                    onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, categoryName: e.target.value }) : setNewProduct({ ...newProduct, categoryName: e.target.value })} 
                                />
                                <datalist id="category-suggestions">
                                    {categories.map(c => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Description</label>
                                <textarea className="input-field" rows={3} value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Image Href URL</label>
                                <input type="text" className="input-field" value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl} onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, imageUrl: e.target.value }) : setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1, padding: "12px" }}>
                                    {isSubmitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product')}
                                </button>
                                {editingProduct && (
                                    <button type="button" className="btn btn-ghost" onClick={() => setEditingProduct(null)} style={{ border: "1px solid var(--border)" }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Product Master Grid */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Active Store Catalog</h2>
                            <span style={{ background: "rgba(0,255,204,0.1)", color: "var(--primary)", padding: "4px 12px", borderRadius: "16px", fontSize: "0.9rem" }}>{products.length} Items</span>
                        </div>

                        {products.length === 0 && <p style={{ color: 'var(--muted)' }}>No products found in catalog.</p>}

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                            {products.map(product => (
                                <div key={product.id} className="glass-card" style={{ padding: "20px", position: "relative" }}>
                                    <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => setEditingProduct({ ...product, categoryName: product.category?.name || '', stock: product.stock?.toString() || '0' })}
                                            style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem", padding: "4px" }}
                                            className="hover-glow"
                                        >
                                            ✎ Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: "0.8rem", padding: "4px" }}
                                            className="hover-glow"
                                        >
                                            ✗ Del
                                        </button>
                                    </div>

                                    {product.imageUrl && <div style={{ width: "100%", height: "120px", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
                                        <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>}

                                    <h3 style={{ fontSize: "1.1rem", margin: "0 0 4px 0" }}>{product.name}</h3>
                                    <p style={{ color: "var(--muted)", margin: "0 0 12px 0", fontSize: "0.85rem" }}>{product.category?.name || "Uncategorized"}</p>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#fff" }}>₹{product.price}</span>
                                        <span style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "4px", background: product.stock > 0 ? "rgba(74, 222, 128, 0.1)" : "rgba(255,0,0,0.1)", color: product.stock > 0 ? "#4ade80" : "#ff4d4d" }}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "800px" }}>
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>App Settings</h2>
                        <p style={{ color: "var(--muted)", marginBottom: "32px" }}>Manage global configuration such as your UPI QR Code.</p>

                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--primary)" }}>UPI Payment QR Code</h3>

                            <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
                                <div style={{ width: "200px", height: "200px", background: "#fff", padding: "12px", borderRadius: "12px", border: "2px dashed var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <img src={`/images/upi-qr.png?v=${qrVersion}`} alt="Current QR" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                </div>
                                <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.9rem", color: "var(--muted)", marginBottom: "8px" }}>Select New Image</label>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                                            style={{ color: "#fff", width: "100%" }}
                                            className="input-field"
                                            key={qrVersion} // Reset input after success
                                        />
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: "1.5" }}>Upload a clear, square image containing your UPI QR code. The server will save it directly, and it will instantly update across all checkout pages.</p>
                                    <button
                                        className="btn btn-primary"
                                        style={{ alignSelf: "flex-start", padding: "10px 20px" }}
                                        disabled={!qrFile || qrUploading}
                                        onClick={async () => {
                                            if (!qrFile) return;
                                            setQrUploading(true);
                                            const formData = new FormData();
                                            formData.append("file", qrFile);
                                            const res = await fetch("/api/admin/settings/qr", { method: "POST", body: formData });
                                            if (res.ok) {
                                                setQrVersion(Date.now());
                                                setQrFile(null);
                                                alert("QR Code updated successfully! Changes are live immediately.");
                                            } else {
                                                alert("Failed to update QR code.");
                                            }
                                            setQrUploading(false);
                                        }}
                                    >
                                        {qrUploading ? "Uploading..." : "Publish New QR"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
