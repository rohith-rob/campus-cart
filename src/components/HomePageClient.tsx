"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Package, Clock, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

type FeaturedProduct = {
    id: string;
    name: string;
    price: number;
    description?: string | null;
    imageUrl?: string | null;
    stock?: number | null;
};

type HomePageClientProps = {
    featuredEssentials: FeaturedProduct[];
};

export default function HomePageClient({ featuredEssentials }: HomePageClientProps) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: MouseEvent<HTMLButtonElement>, product: FeaturedProduct) => {
        e.preventDefault();
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="container" style={{ padding: '0 24px', overflow: 'hidden' }}>

            {/* --- HERO SECTION --- */}
            <section style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
                {/* Background decorative elements */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--primary-glow)', filter: 'blur(100px)', borderRadius: '50%', zIndex: -1, opacity: 0.5 }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'hsla(190, 100%, 65%, 0.2)', filter: 'blur(100px)', borderRadius: '50%', zIndex: -1, opacity: 0.5 }}></div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    style={{ textAlign: 'center', maxWidth: '800px', zIndex: 1 }}
                >
                    <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', border: '1px solid var(--border)', marginBottom: '24px', color: 'var(--primary)' }}>
                        <Sparkles size={16} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>The #1 Campus Delivery App</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                        Your Essentials,<br />
                        <span className="text-gradient">Delivered Instantly.</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} style={{ color: 'var(--muted)', fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                        Skip the late-night store runs. From midnight snacks to project supplies, we deliver right to your hostel or PG room in minutes.
                    </motion.p>

                    <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/products" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px', borderRadius: '12px' }}>
                            <ShoppingBag size={20} />
                            Start Ordering Now
                        </Link>
                        <Link href="#how-it-works" className="btn btn-ghost" style={{ fontSize: '1.1rem', padding: '16px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                            Learn More
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- HOW IT WORKS SECTION --- */}
            <section id="how-it-works" style={{ margin: '100px 0' }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>How it Works</h2>
                        <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Three simple steps to get what you need, when you need it.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                        {[
                            { icon: <ShoppingBag size={32} />, title: "1. Select Items", desc: "Browse our curated catalog of snacks, drinks, and daily student essentials." },
                            { icon: <ShieldCheck size={32} />, title: "2. Secure Payment", desc: "Pay instantly via UPI or choose Cash on Delivery at your convenience." },
                            { icon: <Clock size={32} />, title: "3. Fast Delivery", desc: "Sit back while our student delivery partners bring your order directly to your room." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}
                            >
                                <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-glow)', borderRadius: '16px', color: 'var(--primary)' }}>
                                    {step.icon}
                                </div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>{step.title}</h3>
                                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* --- CATEGORIES SECTION --- */}
            <section style={{ margin: '140px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Explore Categories</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Everything you need for campus life in one place.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                    {[
                        { emoji: '🍟', name: 'Midnight Snacks', path: '/products?category=snacks', color: 'rgba(255, 150, 50, 0.1)' },
                        { emoji: '🥤', name: 'Cool Drinks', path: '/products?category=drinks', color: 'rgba(50, 150, 255, 0.1)' },
                        { emoji: '🧴', name: 'Daily Essentials', path: '/products?category=essentials', color: 'rgba(50, 255, 150, 0.1)' },
                        { emoji: '📓', name: 'Stationery', path: '/products?category=stationery', color: 'rgba(200, 50, 255, 0.1)' }
                    ].map((cat, i) => (
                        <Link href={cat.path} key={i}>
                            <motion.div
                                whileHover={{ scale: 1.03, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: cat.color, zIndex: 0 }}></div>
                                <div style={{ fontSize: '4rem', marginBottom: '16px', zIndex: 1 }}>{cat.emoji}</div>
                                <h3 style={{ margin: 0, zIndex: 1, fontSize: '1.2rem', fontWeight: 600 }}>{cat.name}</h3>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- FEATURED PRODUCTS SECTION --- */}
            <section style={{ margin: '140px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>Trending Essentials</h2>
                                <p style={{ color: 'var(--muted)', margin: 0 }}>Stock up on what everyone&apos;s buying.</p>
                            </div>
                    <Link href="/products?category=Daily Essentials" style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        View Full Catalog <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                    {featuredEssentials.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            style={{ display: "flex", flexDirection: "column", padding: "16px", background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)' }}
                        >
                            <Link href={`/products/${product.id}`} style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                                {product.imageUrl ? (
                                    <div style={{ height: "180px", width: "100%", borderRadius: "16px", marginBottom: "20px", overflow: "hidden", background: "#111", position: 'relative' }}>
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            className="hover-zoom"
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: "180px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                                        📦
                                    </div>
                                )}
                                <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: '#fff' }}>{product.name}</h3>
                                <p style={{ color: "var(--muted)", fontSize: "0.9rem", flex: 1, marginBottom: "20px", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {product.description || "Premium campus product specifically curated for your daily dorm needs."}
                                </p>
                            </Link>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#fff" }}>₹{product.price}</span>
                                {product.stock !== null && product.stock !== undefined && product.stock > 0 ? (
                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        style={{ background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.2s' }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Package size={16} /> Add
                                    </button>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', color: '#ff4d4d', background: 'rgba(255,0,0,0.1)', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>Out of Stock</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- REVIEWS CAROUSEL / SOCIAL PROOF --- */}
            <section style={{ margin: '140px 0 80px', padding: '60px 0', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Loved by Campus.</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>See what 500+ students are saying about Campus Cart.</p>
                </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {[
                        { name: "Rahul S.", sub: "B.Tech Student", text: "Saved me during finals week. Ordered caffeine and snacks at 2 AM and it arrived in 15 mins. Lifesavers!" },
                        { name: "Priya M.", sub: "PG Accomodation", text: "Super clean UI and incredibly fast delivery. It feels like magic having a mini-mart right in my pocket." },
                        { name: "Arjun K.", sub: "M.Sc Student", text: "Fair prices and literally zero hassle. It's the only app I use for hostel supplies now. 10/10." }
                    ].map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative' }}
                        >
                            <div style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#e0e0e0', marginBottom: '24px' }}>&ldquo;{review.text}&rdquo;</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{review.name}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{review.sub}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section style={{ margin: '100px 0', textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Ready to simplify campus life?</h2>
                <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                    Join the rest of the campus and get your first order delivered directly to your door today.
                </p>
                <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px', borderRadius: '12px' }}>
                    Create Free Account
                </Link>
            </section>
        </div>
    );
}
