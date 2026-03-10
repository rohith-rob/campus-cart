import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  // Fetch a subset of essential products directly from the database
  const featuredEssentials = await prisma.product.findMany({
    where: {
      category: {
        name: {
          contains: "Essential"
        }
      }
    },
    take: 8,
    include: {
      category: true
    }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '80px 0 120px' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '20px' }}>
          Your Campus Essentials,<br /> Delivered Instantly.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px' }}>
          Skip the store. From midnight snacks to project supplies, we deliver right to your hostel or PG.
        </p>
        <Link href="/products" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '14px 36px' }}>
          Start Ordering
        </Link>
      </section>

      {/* Categories Section */}
      <section>
        <h2 style={{ fontSize: '2rem', marginBottom: '32px' }}>Explore Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>

          <Link href="/products?category=snacks" className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍟</div>
            <h3 style={{ margin: 0 }}>Midnight Snacks</h3>
          </Link>

          <Link href="/products?category=drinks" className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🥤</div>
            <h3 style={{ margin: 0 }}>Cool Drinks</h3>
          </Link>

          <Link href="/products?category=essentials" className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧴</div>
            <h3 style={{ margin: 0 }}>Daily Essentials</h3>
          </Link>

          <Link href="/products?category=stationery" className="glass-card flex-center hover-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📓</div>
            <h3 style={{ margin: 0 }}>Stationery</h3>
          </Link>

        </div>
      </section>

      {/* Featured Essentials Products Section */}
      <section style={{ marginTop: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Essential Products</h2>
          <Link href="/products?category=Daily Essentials" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {featuredEssentials.map(product => (
            <div key={product.id} className="glass-card hover-glow" style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
              {product.imageUrl ? (
                <div style={{ height: "160px", width: "100%", borderRadius: "12px", marginBottom: "16px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                  <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ height: "160px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                  📦
                </div>
              )}
              <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{product.name}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", flex: 1, marginBottom: "16px" }}>
                {product.description || "Premium campus product."}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--primary)" }}>₹{product.price}</span>
                <Link href={`/products/${product.id}`} className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.85rem", textDecoration: "none" }}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={{ marginTop: '120px', marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Student Reviews & Ratings</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Trusted by hundreds of students across campus. See what they have to say about our fast delivery and essential product catalog.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

          {/* Review 1 */}
          <div className="glass-card hover-glow" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#00ffcc', fontSize: '1.2rem' }}>
                ★★★★★
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>2 days ago</span>
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', flexGrow: 1, color: '#e0e0e0' }}>
              "Campus Cart is an absolute lifesaver! I was studying for finals at 2 AM and ran out of coffee and snacks. They delivered to my hostel block in under 15 minutes. Highly recommend!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <img src="https://source.unsplash.com/100x100/?portrait,student,boy" alt="Rahul S." style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Rahul S.</h4>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>B.Tech Student, Men's Hostel</p>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="glass-card hover-glow" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#00ffcc', fontSize: '1.2rem' }}>
                ★★★★☆
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>1 week ago</span>
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', flexGrow: 1, color: '#e0e0e0' }}>
              "Really convenient for daily essentials like soap and notebooks. The prices are fair and the website is super easy to use on my phone. Wish they had a few more vegan snack options though!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <img src="https://source.unsplash.com/100x100/?portrait,student,girl" alt="Priya M." style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Priya M.</h4>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>BBA Student, PG Accomodation</p>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="glass-card hover-glow" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#00ffcc', fontSize: '1.2rem' }}>
                ★★★★★
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>3 weeks ago</span>
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', flexGrow: 1, color: '#e0e0e0' }}>
              "The best part about Campus Cart is that they actually understand student needs. From stationery for last-minute assignments to instant noodles, they have everything. Best delivery service hands down."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <img src="https://source.unsplash.com/100x100/?portrait,college,guy" alt="Arjun K." style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Arjun K.</h4>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>M.Sc Student, Campus Housing</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
