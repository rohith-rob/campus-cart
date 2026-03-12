 
 
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, total, deliveryFee, finalTotal, clearCart } = useCart();
    const router = useRouter();

    const [address, setAddress] = useState("");
    const [savedAddress, setSavedAddress] = useState("");

    // Detailed Address States
    const [accommodationType, setAccommodationType] = useState("Hostel"); // "Hostel", "PG"
    const [collegeName, setCollegeName] = useState("");
    const [roomNo, setRoomNo] = useState("");
    const [addressDetails, setAddressDetails] = useState("");
    const [pincode, setPincode] = useState("");
    const [additionalPhone, setAdditionalPhone] = useState("");
    const [useCustomDetailedAddress, setUseCustomDetailedAddress] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/user/profile")
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.addressDetails) {
                    const fullAddress = `${data.accommodationType ? data.accommodationType + " - " : ""}${data.addressDetails}`;
                    setSavedAddress(fullAddress);
                    setAddress(fullAddress);
                    setUseCustomDetailedAddress(false); // Default to saved address if it exists
                }
                setProfileLoaded(true);
            })
            .catch(() => setProfileLoaded(true));
    }, []);

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "CARD">("COD");
    const [transactionId, setTransactionId] = useState("");
    const [cardDetails, setCardDetails] = useState({ name: "", number: "", expiry: "", cvv: "" });
    const [selectedUpiApp, setSelectedUpiApp] = useState("");
    const [qrVersion] = useState(Date.now());

    if (items.length === 0) {
        return (
            <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
                <h2>Your cart is empty</h2>
                <Link href="/products" className="btn btn-primary" style={{ marginTop: "16px" }}>Go back</Link>
            </div>
        );
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let finalAddress = address;

        if (useCustomDetailedAddress) {
            if (!roomNo || !addressDetails || !pincode) {
                setError("Please fill in all the required address fields (Room No, Address, Pincode).");
                setLoading(false);
                return;
            }
            if (accommodationType === "Hostel" && !collegeName) {
                setError("Please select a college for hostel accommodation.");
                setLoading(false);
                return;
            }

            let builtAddress = `${accommodationType} - `;
            if (accommodationType === "Hostel") {
                builtAddress += `${collegeName}, `;
            }
            builtAddress += `Room/Flat: ${roomNo}, ${addressDetails}, Pincode: ${pincode}`;
            if (additionalPhone) {
                builtAddress += `, Alt Phone: ${additionalPhone}`;
            }
            finalAddress = builtAddress;
        }

        if (!finalAddress) {
            setError("Please provide a valid delivery address.");
            setLoading(false);
            return;
        }

        if (paymentMethod === "UPI" && transactionId.trim().length < 6) {
            setError("Please secure a valid UPI UTR Transaction ID to proceed.");
            setLoading(false);
            return;
        }

        if (paymentMethod === "CARD" && (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
            setError("Please complete all secure card details to proceed.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    totalAmount: finalTotal,
                    customAddress: finalAddress,
                    paymentMethod,
                    transactionId: paymentMethod === "UPI" ? transactionId : null
                })
            });

            if (res.ok) {
                clearCart();
                router.push("/dashboard");
            } else {
                const data = await res.json();
                if (res.status === 401) {
                    setError("You must be logged in to place an order. Redirecting...");
                    setTimeout(() => router.push("/login"), 2000);
                } else {
                    setError(data.error || "Failed to place order.");
                }
            }
        } catch {
            setError("Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: "60px 24px", maxWidth: "800px" }}>
            <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "32px" }}>Checkout</h1>

            {error && <div style={{ background: "rgba(255,0,0,0.1)", color: "#ff8080", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>{error}</div>}

            <div className="glass-card" style={{ padding: "32px", marginBottom: "32px" }}>
                <h3 style={{ marginBottom: "24px", fontSize: "1.25rem" }}>Delivery Details</h3>
                <form onSubmit={handlePlaceOrder}>
                    <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <label style={{ display: "block", color: "var(--muted)", fontWeight: "bold" }}>Delivery Address</label>
                            {savedAddress && (
                                <button
                                    type="button"
                                    onClick={() => setUseCustomDetailedAddress(!useCustomDetailedAddress)}
                                    style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}
                                    className="hover-glow"
                                >
                                    {useCustomDetailedAddress ? "Use Saved Address" : "Enter New Address"}
                                </button>
                            )}
                        </div>

                        {!useCustomDetailedAddress ? (
                            <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.3)" }}>
                                <p style={{ margin: "0 0 8px 0", fontSize: "1rem", color: "#fff" }}>{savedAddress}</p>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#4ade80" }}>✓ Using saved profile address.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border)" }}>

                                <div style={{ display: "flex", gap: "16px" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff" }}>
                                        <input type="radio" name="accType" value="Hostel" checked={accommodationType === "Hostel"} onChange={() => setAccommodationType("Hostel")} style={{ accentColor: "var(--primary)" }} />
                                        Hostel
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff" }}>
                                        <input type="radio" name="accType" value="PG" checked={accommodationType === "PG"} onChange={() => setAccommodationType("PG")} style={{ accentColor: "var(--primary)" }} />
                                        PG
                                    </label>
                                </div>

                                {accommodationType === "Hostel" && (
                                    <div>
                                        <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Enter your College Name *</label>
                                        <input
                                            type="text"
                                            value={collegeName}
                                            onChange={(e) => setCollegeName(e.target.value)}
                                            placeholder="e.g. CUSAT or Rajagiri"
                                            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }}
                                            required={useCustomDetailedAddress && accommodationType === "Hostel"}
                                        />
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "16px" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Room / Flat No. *</label>
                                        <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="e.g. 402 or B-12" required={useCustomDetailedAddress} style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Pincode *</label>
                                        <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 682022" required={useCustomDetailedAddress} style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Hostel Block / Address Details *</label>
                                    <input type="text" value={addressDetails} onChange={(e) => setAddressDetails(e.target.value)} placeholder={accommodationType === "Hostel" ? "e.g. Sahara Hostel, Block A" : "e.g. Green Valley PG, InfoPark Road"} required={useCustomDetailedAddress} style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                                </div>

                                <div>
                                    <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Additional Phone Number (Optional)</label>
                                    <input type="tel" value={additionalPhone} onChange={(e) => setAdditionalPhone(e.target.value)} placeholder="e.g. +91 9876543210" style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "32px", padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--muted)", fontSize: "0.95rem" }}>
                            <span>Subtotal</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--muted)", borderBottom: "1px solid var(--border)", paddingBottom: "12px", fontSize: "0.95rem" }}>
                            <span>Delivery Fee (20%)</span>
                            <span>₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--muted)" }}>
                            <span>Order Total</span>
                            <span style={{ fontWeight: "bold", color: "#fff", fontSize: "1.1rem" }}>₹{finalTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: "0.9rem" }}>
                            <span>Selected Payment</span>
                            <span>{paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod === "UPI" ? "UPI Payment" : "Credit/Debit Card"}</span>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div style={{ marginBottom: "32px" }}>
                        <h3 style={{ marginBottom: "16px", fontSize: "1.1rem" }}>Payment Method</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                            {/* COD Option */}
                            <label className={`glass-card hover-glow ${paymentMethod === 'COD' ? 'selected' : ''}`} style={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", border: paymentMethod === 'COD' ? "1px solid var(--primary)" : "" }}>
                                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ accentColor: "var(--primary)" }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1rem" }}>💵 Cash on Delivery</h4>
                                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Pay when your order is delivered to your room.</p>
                                </div>
                            </label>

                            {/* UPI Option */}
                            <label className={`glass-card hover-glow ${paymentMethod === 'UPI' ? 'selected' : ''}`} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", cursor: "pointer", border: paymentMethod === 'UPI' ? "1px solid var(--primary)" : "" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} style={{ accentColor: "var(--primary)" }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "1rem" }}>📱 UPI Payment</h4>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Pay instantly via PhonePe, GPay, or Paytm.</p>
                                    </div>
                                </div>
                                {paymentMethod === 'UPI' && (
                                    <div style={{ paddingLeft: "36px", marginTop: "20px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <p style={{ fontSize: "0.95rem", color: "#e0e0e0", margin: "0", fontWeight: "bold" }}>1. Select your UPI App:</p>
                                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                                            {['Google Pay', 'PhonePe', 'Paytm', 'Other App'].map(app => (
                                                <button
                                                    key={app}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setSelectedUpiApp(app); }}
                                                    style={{
                                                        padding: "10px 16px",
                                                        background: selectedUpiApp === app ? "var(--primary)" : "rgba(255,255,255,0.05)",
                                                        borderRadius: "8px",
                                                        color: selectedUpiApp === app ? "#000" : "white",
                                                        border: `1px solid ${selectedUpiApp === app ? "var(--primary)" : "rgba(255,255,255,0.2)"}`,
                                                        cursor: "pointer",
                                                        fontWeight: selectedUpiApp === app ? "bold" : "normal",
                                                        transition: "all 0.2s"
                                                    }}
                                                >
                                                    {app}
                                                </button>
                                            ))}
                                        </div>

                                        {selectedUpiApp && (
                                            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", marginTop: "8px", padding: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.2)", animation: "fadeIn 0.3s ease" }}>
                                                <div style={{ flex: "1 1 150px", maxWidth: "180px", background: "white", padding: "12px", borderRadius: "12px", border: "2px solid var(--primary)" }}>
                                                    <img src={`/images/upi-qr.png?v=${qrVersion}`} alt="UPI QR Code" style={{ width: "100%", height: "auto", display: "block" }} />
                                                </div>
                                                <div style={{ flex: "2 1 200px", display: "flex", flexDirection: "column" }}>
                                                    <p style={{ fontSize: "0.95rem", color: "#e0e0e0", margin: "0 0 16px 0", fontWeight: "bold" }}>2. Scan QR Code using {selectedUpiApp}</p>

                                                    <a href="upi://pay?pa=campuscart@upi&pn=CampusCart&cu=INR" target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", padding: "10px 20px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", textDecoration: "none", fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <span>Open {selectedUpiApp} Directly</span>
                                                    </a>

                                                    <p style={{ fontSize: "0.95rem", color: "#e0e0e0", margin: "0 0 8px 0", fontWeight: "bold" }}>3. Enter the 12-digit UTR Transaction ID:</p>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 312345678901"
                                                        value={transactionId}
                                                        onChange={(e) => setTransactionId(e.target.value)}
                                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontFamily: "monospace", letterSpacing: "1px" }}
                                                        required={paymentMethod === 'UPI'}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </label>

                            {/* Card Option */}
                            <label className={`glass-card hover-glow ${paymentMethod === 'CARD' ? 'selected' : ''}`} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", cursor: "pointer", border: paymentMethod === 'CARD' ? "1px solid var(--primary)" : "" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} style={{ accentColor: "var(--primary)" }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "1rem" }}>💳 Credit / Debit Card</h4>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Securely pay with Visa, Mastercard, or RuPay.</p>
                                    </div>
                                </div>
                                {paymentMethod === 'CARD' && (
                                    <div style={{ paddingLeft: "32px", animation: "fadeIn 0.3s ease", display: "grid", gap: "12px" }}>
                                        <input type="text" placeholder="Cardholder Name" value={cardDetails.name} onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} required={paymentMethod === 'CARD'} />
                                        <input type="text" placeholder="Card Number (0000 0000 0000 0000)" value={cardDetails.number} onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontFamily: "monospace" }} required={paymentMethod === 'CARD'} maxLength={19} />
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })} style={{ width: "50%", padding: "10px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} required={paymentMethod === 'CARD'} maxLength={5} />
                                            <input type="password" placeholder="CVV" value={cardDetails.cvv} onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })} style={{ width: "50%", padding: "10px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} required={paymentMethod === 'CARD'} maxLength={3} />
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}>
                        {loading ? "Processing..." : "Place Order"}
                    </button>
                </form>
            </div>
        </div>
    );
}
