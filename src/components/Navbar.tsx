"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { items } = useCart();
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const pathname = usePathname();
    const router = useRouter();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const dropdownRef = useRef<HTMLLIElement>(null);

    // Fetch User Profile Picture
    useEffect(() => {
        fetch('/api/user/profile')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setAvatar(data.avatar || null);
                    setUserName(data.name || "");
                }
            })
            .catch(() => { });
    }, [pathname]); // Refresh when navigating, allowing avatar to update after save

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Print Service', path: '/print' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Info', path: '/contact' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoWhite}>Campus</span><span className={styles.logoAccent}>Cart</span>
                </Link>

                {/* Hamburger Mobile Icon */}
                <div
                    className={`${styles.menuToggle} ${isMobileMenuOpen ? styles.isActive : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                </div>

                {/* Main Menu */}
                <ul className={`${styles.navMenu} ${isMobileMenuOpen ? styles.isOpen : ''}`}>
                    {navLinks.map(link => (
                        <li key={link.name} className={styles.navItem}>
                            <Link
                                href={link.path}
                                className={`${styles.navLink} ${pathname === link.path ? styles.active : ''}`}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}

                    <li className={styles.navItem}>
                        <Link href="/cart" className={`${styles.navLink} ${styles.cartLink} ${pathname === '/cart' ? styles.active : ''}`}>
                            Cart
                            <span className={styles.cartBadge}>{count}</span>
                        </Link>
                    </li>

                    {/* Profile Dropdown */}
                    <li className={`${styles.navItem} ${styles.profileDropdown}`} ref={dropdownRef}>
                        <div
                            className={`${styles.profileIcon} ${isDropdownOpen ? styles.active : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                            style={avatar ? {
                                backgroundImage: `url(${avatar})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                color: "transparent"
                            } : {}}
                        >
                            {!avatar && (userName ? userName.charAt(0).toUpperCase() : "👤")}
                        </div>
                        <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.show : ''}`}>
                            <Link href="/profile" className={styles.dropdownItem}>My Profile</Link>
                            <Link href="/dashboard" className={styles.dropdownItem}>My Orders</Link>
                            <button
                                className={`${styles.dropdownItem} ${styles.logout}`}
                                onClick={async () => {
                                    await fetch('/api/auth/logout', { method: 'POST' });
                                    router.push('/login');
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
