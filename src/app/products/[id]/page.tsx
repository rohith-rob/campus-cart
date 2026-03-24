import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewForm from "@/components/ReviewForm";
import { getSession } from "@/lib/session";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await getSession();
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!product) {
        return notFound();
    }

    const averageRating = product.reviews.length > 0
        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
        : null;

    return (
        <div className="container animate-fade-in" style={{ padding: "60px 24px", minHeight: "80vh" }}>
            <Link href="/products" style={{ color: "var(--muted)", marginBottom: "32px", display: "inline-block" }}>
                &larr; Back to Menu
            </Link>

            <div className="glass-card" style={{ display: "flex", gap: "40px", flexWrap: "wrap", padding: "40px" }}>
                {product.imageUrl ? (
                    <div style={{ flex: "1 1 300px", minHeight: "300px", borderRadius: "16px", overflow: "hidden", background: "rgba(255,255,255,0.02)", position: 'relative' }}>
                        <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: "cover" }} 
                        />
                    </div>
                ) : (
                    <div style={{ flex: "1 1 300px", minHeight: "300px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem" }}>
                        {product.category.name === "Snacks" ? '🍟' : product.category.name === "Cool Drinks" ? '🥤' : '📦'}
                    </div>
                )}
                <div style={{ flex: "2 1 400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ color: "var(--primary)", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px", fontWeight: "bold", marginBottom: "8px" }}>
                        {product.category.name}
                    </span>
                    <h1 style={{ fontSize: "3rem", marginBottom: "16px", lineHeight: "1.1" }}>{product.name}</h1>
                    <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginBottom: "32px", lineHeight: "1.6" }}>
                        {product.description || "A premium product carefully selected for your campus needs. Order now for instant delivery to your dorm."}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "auto" }}>
                        <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#fff" }}>₹{product.price}</span>
                        {product.stock > 0 ? (
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                <AddToCartButton
                                    product={{ id: product.id, name: product.name, price: product.price, quantity: 1 }}
                                    styleClass="btn btn-outline"
                                />
                                <Link
                                    href={`/checkout?productId=${product.id}&quantity=1`}
                                    className="btn btn-primary"
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    Buy Now
                                </Link>
                            </div>
                        ) : (
                            <span style={{ padding: "12px 24px", background: "rgba(255,0,0,0.1)", color: "#ff4d4d", borderRadius: "8px", fontWeight: "bold", border: "1px solid rgba(255,0,0,0.3)" }}>
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Details Section */}
            <div className="glass-card" style={{ marginTop: "40px", padding: "40px" }}>
                <h2 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>Product Details</h2>
                <div style={{ color: "var(--muted)", lineHeight: "1.8", fontSize: "1.05rem" }}>
                    <p>
                        {product.description || `This ${product.name} is a high-quality product in our ${product.category.name} collection. It has been carefully selected to meet the needs of our campus community. Order today for quick delivery right to your door.`}
                    </p>
                    <ul style={{ marginTop: "16px", paddingLeft: "20px" }}>
                        <li>Category: {product.category.name}</li>
                        <li>Availability: {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</li>
                        <li>Price: ₹{product.price}</li>
                    </ul>
                </div>
            </div>
            
            {/* Review Submission Section */}
            <div style={{ marginTop: "40px" }}>
                {session ? (
                    <ReviewForm productId={product.id} />
                ) : (
                    <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                        <h3 style={{ marginBottom: "16px" }}>Want to share your thoughts?</h3>
                        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>Please log in to leave a review for this product.</p>
                        <Link href="/login" className="btn btn-primary">Log In to Review</Link>
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="glass-card" style={{ marginTop: "40px", padding: "40px" }}>
                <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Customer Reviews</h2>

                {product.reviews.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                        <p style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No reviews yet</p>
                        <p>Be the first to review this product!</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {averageRating && (
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                                <span style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--primary)", lineHeight: "1" }}>{averageRating}</span>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ color: "var(--warning)", fontSize: "1.2rem", display: "flex", gap: "4px" }}>
                                        {'★'.repeat(Math.round(Number(averageRating)))}{'☆'.repeat(5 - Math.round(Number(averageRating)))}
                                    </div>
                                    <span style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>Based on {product.reviews.length} reviews</span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {product.reviews.map((review) => (
                                <div key={review.id} style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
                                            {review.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{review.user?.name || 'Anonymous User'}</div>
                                            <div style={{ color: "var(--warning)", fontSize: "0.9rem", marginTop: "2px" }}>
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "0.85rem" }}>
                                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: "1.6", marginTop: "12px" }}>{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
