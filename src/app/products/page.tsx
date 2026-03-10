"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    description: string | null;
    imageUrl: string | null;
    category: { name: string };
};

function ProductList() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get("category");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const url = categoryFilter ? `/api/products?category=${categoryFilter}` : "/api/products";
            const res = await fetch(url);
            if (res.ok) {
                setProducts(await res.json());
            }
            setLoading(false);
        };
        fetchProducts();
    }, [categoryFilter]);

    if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Loading products...</div>;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginTop: "32px" }}>
            {products.map(product => (
                <div key={product.id} className="glass-card" style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
                    {product.imageUrl ? (
                        <div style={{ height: "160px", width: "100%", borderRadius: "12px", marginBottom: "16px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    ) : (
                        <div style={{ height: "160px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                            {product.category.name === "Snacks" ? '🍟' : product.category.name === "Cool Drinks" ? '🥤' : '📦'}
                        </div>
                    )}
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{product.name}</h3>
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem", flex: 1, marginBottom: "16px" }}>
                        {product.description || "Premium campus product."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--primary)" }}>₹{product.price}</span>
                            {product.stock <= 0 && <span style={{ fontSize: "0.8rem", color: "#ff4d4d", fontWeight: "bold", marginTop: "4px" }}>Out of Stock</span>}
                        </div>
                        <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => window.location.href = `/products/${product.id}`}>View</button>
                    </div>
                </div>
            ))}
            {products.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--muted)" }}>
                    No products found in this category.
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <div className="container animate-fade-in" style={{ padding: "40px 24px" }}>
            <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Our Menu</h1>
            <p style={{ color: "var(--muted)", marginBottom: "32px" }}>Select from our premium hand-picked assortment.</p>

            <div style={{ display: "flex", gap: "12px", marginBottom: "32px", overflowX: "auto", paddingBottom: "8px", whiteSpace: "nowrap" }}>
                <a href="/products" className="btn btn-ghost">All</a>
                <a href="/products?category=Snacks" className="btn btn-ghost">Snacks</a>
                <a href="/products?category=Cool Drinks" className="btn btn-ghost">Cool Drinks</a>
                <a href="/products?category=Instant Food" className="btn btn-ghost">Instant Food</a>
                <a href="/products?category=Stationery" className="btn btn-ghost">Stationery</a>
                <a href="/products?category=Personal Care" className="btn btn-ghost">Personal Care</a>
                <a href="/products?category=Girls Essentials" className="btn btn-ghost">Girls Essentials</a>
                <a href="/products?category=Boys Essentials" className="btn btn-ghost">Boys Essentials</a>
                <a href="/products?category=Daily Essentials" className="btn btn-ghost">Daily Essentials</a>
                <a href="/products?category=Student Utilities" className="btn btn-ghost">Student Utilities</a>
            </div>

            <Suspense fallback={<div>Loading menu...</div>}>
                <ProductList />
            </Suspense>
        </div>
    );
}
