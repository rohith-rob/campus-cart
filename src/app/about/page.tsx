import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Campus Cart',
    description: 'Learn more about Campus Cart, your essential campus delivery service.',
};

export default function AboutPage() {
    return (
        <div className="container animate-fade-in" style={{ padding: '60px 24px', minHeight: '80vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px', textAlign: 'center' }}>
                    About Us
                </h1>

                <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.8' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--foreground)' }}>
                        <strong>Campus Cart</strong> is a campus-focused delivery service designed to provide essential items to college students quickly and conveniently. It helps students access daily necessities such as snacks, stationery, medicines, and emergency items without leaving their hostel or PG accommodation.
                    </p>

                    <p style={{ fontSize: '1.1rem', color: 'var(--foreground)' }}>
                        The platform allows students to place orders through a simple website, and the requested items are delivered directly to their accommodation. Campus Cart operates with the goal of saving students&apos; time, improving convenience, and providing reliable support during both regular and urgent situations.
                    </p>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ fontSize: '4rem' }}>🎓</div>
                        <p style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: '500', fontStyle: 'italic' }}>
                            Campus Cart is built specifically for campus environments, ensuring fast, efficient, and student-friendly delivery services. Our vision is to expand this service to multiple colleges and become a trusted essential delivery solution for student communities.
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Link href="/products" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '14px 36px' }}>
                        Explore Our Catalog
                    </Link>
                </div>
            </div>
        </div>
    );
}
