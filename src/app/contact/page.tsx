import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | Campus Cart',
    description: 'Get in touch with the Campus Cart team.',
};

export default function ContactPage() {
    return (
        <div className="container animate-fade-in" style={{ padding: '60px 24px', minHeight: '80vh' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '16px', textAlign: 'center' }}>
                    Contact Info
                </h1>
                <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '40px', fontSize: '1.1rem' }}>
                    Have questions or need support? Reach out to us below.
                </p>

                <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            ✉️
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Email</p>
                            <a href="mailto:campuscart@gmail.com" style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                campuscart@gmail.com
                            </a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            📞
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Contact</p>
                            <a href="tel:1234567890" style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                1234567890
                            </a>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E1306C' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Instagram</p>
                            <a href="https://instagram.com/campuscart" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                @campuscart
                            </a>
                        </div>
                    </div>

                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Link href="/" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '12px 32px' }}>
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
