/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable prefer-const */
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PrintServicePage() {
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [fileBase64, setFileBase64] = useState<string>("");

    const [pages, setPages] = useState<number>(1);
    const [copies, setCopies] = useState<number>(1);
    const [colorMode, setColorMode] = useState<"B&W" | "Color">("B&W");

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "CARD">("COD");
    const [transactionId, setTransactionId] = useState("");
    const [cardDetails, setCardDetails] = useState({ name: "", number: "", expiry: "", cvv: "" });
    const [selectedUpiApp, setSelectedUpiApp] = useState("");
    const [qrVersion] = useState(Date.now());

    // Detailed Address States
    const [accommodationType, setAccommodationType] = useState("Hostel"); // "Hostel", "PG"
    const [collegeName, setCollegeName] = useState("");
    const [roomNo, setRoomNo] = useState("");
    const [addressDetails, setAddressDetails] = useState("");
    const [pincode, setPincode] = useState("");
    const [additionalPhone, setAdditionalPhone] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pricing Constants
    const rateBW = 1.50;
    const rateColor = 10.00;

    // Derived State
    const pricePerPage = colorMode === "Color" ? rateColor : rateBW;
    const totalPrice = pages * copies * pricePerPage;

    useEffect(() => {
        // Fetch User Profile to pre-fill address
        fetch("/api/user/profile")
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
                if (data.accommodationType) setAccommodationType(data.accommodationType);
                if (data.phone) setAdditionalPhone(data.phone);
                setLoading(false);
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        handleNewFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        handleNewFile(droppedFile);
    };

    const handleNewFile = (selectedFile: File | undefined) => {
        if (!selectedFile) return;

        // Validation
        if (selectedFile.type !== "application/pdf") {
            setMessage({ type: "error", text: "Please upload a valid PDF file." });
            return;
        }

        // 25MB Limit Check (25 * 1024 * 1024)
        if (selectedFile.size > 25 * 1024 * 1024) {
            setMessage({ type: "error", text: "File is too large. Maximum size is 25MB." });
            return;
        }

        setFile(selectedFile);
        setMessage({ type: "", text: "" });

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setFileBase64(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        if (!file || !fileBase64) {
            setMessage({ type: "error", text: "Please upload a PDF document to proceed." });
            setSubmitting(false);
            return;
        }

        if (!roomNo || !addressDetails || !pincode) {
            setMessage({ type: "error", text: "Please fill in all the required address fields (Room No, Address, Pincode)." });
            setSubmitting(false);
            return;
        }
        if (accommodationType === "Hostel" && !collegeName) {
            setMessage({ type: "error", text: "Please select a college for hostel accommodation." });
            setSubmitting(false);
            return;
        }

        if (paymentMethod === "UPI" && transactionId.trim().length < 6) {
            setMessage({ type: "error", text: "Please secure a valid UPI UTR Transaction ID to proceed." });
            setSubmitting(false);
            return;
        }

        if (paymentMethod === "CARD" && (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
            setMessage({ type: "error", text: "Please complete all secure card details to proceed." });
            setSubmitting(false);
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
        const address = builtAddress;

        try {
            const res = await fetch("/api/print-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileData: fileBase64,
                    fileName: file.name,
                    totalPages: pages,
                    copies,
                    colorMode,
                    pricePerPage,
                    totalPrice,
                    address,
                    paymentMethod,
                    transactionId: paymentMethod === "UPI" ? transactionId : null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.error || "Failed to place print order" });
            } else {
                setMessage({ type: "success", text: "Print Order placed successfully! Redirecting..." });
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        } catch (err) {
            setMessage({ type: "error", text: "Network error occurred while submitting order." });
        } finally {
            if (!message.text.includes("Redirecting")) {
                setSubmitting(false);
            }
        }
    };

    if (loading) return <div className="container" style={{ padding: "80px", textAlign: "center" }}>Initializing Print Service...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: "40px 24px", maxWidth: "900px" }}>

            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 className="text-gradient" style={{ fontSize: "3rem", marginBottom: "16px" }}>PDF Print Service</h1>
                <p style={{ color: "var(--muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                    Upload your assignments or notes, select print settings, and we'll deliver the printed copies directly to your room!
                </p>
            </div>

            {message.text && (
                <div style={{ padding: "16px", borderRadius: "8px", marginBottom: "32px", background: message.type === "error" ? "rgba(255,0,0,0.1)" : "rgba(0,255,100,0.1)", color: message.type === "error" ? "#ff8080" : "#4ade80", border: `1px solid ${message.type === "error" ? "rgba(255,0,0,0.3)" : "rgba(0,255,100,0.3)"}` }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Document Upload Area */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", color: "var(--primary)" }}>1. Document Upload</h3>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                            border: "2px dashed rgba(0,255,204,0.3)",
                            borderRadius: "12px",
                            padding: "40px 20px",
                            textAlign: "center",
                            background: "rgba(0,255,204,0.02)",
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className="hover-glow"
                    >
                        <input
                            type="file"
                            accept="application/pdf"
                            name="pdfDocument"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📄</div>
                        {file ? (
                            <div>
                                <h4 style={{ color: "#fff", margin: "0 0 8px 0" }}>{file.name}</h4>
                                <p style={{ color: "var(--primary)", margin: 0, fontSize: "0.9rem" }}>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to print</p>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{ color: "#fff", margin: "0 0 8px 0" }}>Click to Upload or Drag & Drop</h4>
                                <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>Maximum file size: 25MB (.pdf only)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Print Configuration */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", color: "var(--primary)" }}>2. Print Configuration</h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Total Pages in Document</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="input-field"
                                value={pages}
                                onChange={(e) => setPages(parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Number of Copies</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="input-field"
                                value={copies}
                                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.9rem" }}>Color Mode</label>
                            <select
                                className="input-field"
                                value={colorMode}
                                onChange={(e) => setColorMode(e.target.value as "B&W" | "Color")}
                            >
                                <option value="B&W" style={{ color: "#000" }}>Black & White (₹1.50/page)</option>
                                <option value="Color" style={{ color: "#000" }}>Color (₹10.00/page)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="glass-card" style={{ padding: "32px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", color: "var(--primary)" }}>3. Delivery Destination</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                                    required={accommodationType === "Hostel"}
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Room / Flat No. *</label>
                                <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="e.g. 402 or B-12" required style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Pincode *</label>
                                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 682022" required style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Hostel Block / Address Details *</label>
                            <input type="text" value={addressDetails} onChange={(e) => setAddressDetails(e.target.value)} placeholder={accommodationType === "Hostel" ? "e.g. Sahara Hostel, Block A" : "e.g. Green Valley PG, InfoPark Road"} required style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                        </div>

                        <div>
                            <label style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Additional Phone Number (Optional)</label>
                            <input type="tel" value={additionalPhone} onChange={(e) => setAdditionalPhone(e.target.value)} placeholder="e.g. +91 9876543210" style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                        </div>
                    </div>
                </div>

                {/* Payment Method Selector */}
                <div style={{ padding: "32px", borderTop: "1px solid var(--border)", marginTop: "16px" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", color: "var(--primary)" }}>4. Payment Method</h3>
                    <div className="glass-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid var(--border)", borderRadius: "12px", padding: 0 }}>
                        {/* COD Option */}
                        <label style={{ padding: "20px 24px", display: "flex", flexDirection: "column", cursor: "pointer", borderBottom: "1px solid var(--border)", background: paymentMethod === 'COD' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ accentColor: "var(--primary)", transform: "scale(1.2)" }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: paymentMethod === 'COD' ? 'bold' : 'normal', color: paymentMethod === 'COD' ? 'var(--primary)' : '#fff' }}>Cash on Delivery</h4>
                                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Pay when your document is delivered.</p>
                                </div>
                            </div>
                        </label>

                        {/* UPI Option */}
                        <label style={{ padding: "20px 24px", display: "flex", flexDirection: "column", cursor: "pointer", borderBottom: "1px solid var(--border)", background: paymentMethod === 'UPI' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} style={{ accentColor: "var(--primary)", transform: "scale(1.2)" }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: paymentMethod === 'UPI' ? 'bold' : 'normal', color: paymentMethod === 'UPI' ? 'var(--primary)' : '#fff' }}>UPI Payment</h4>
                                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Google Pay, PhonePe, Paytm, and more.</p>
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
                        <label style={{ padding: "20px 24px", display: "flex", flexDirection: "column", cursor: "pointer", background: paymentMethod === 'CARD' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} style={{ accentColor: "var(--primary)", transform: "scale(1.2)" }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: paymentMethod === 'CARD' ? 'bold' : 'normal', color: paymentMethod === 'CARD' ? 'var(--primary)' : '#fff' }}>Credit / Debit Card</h4>
                                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Securely pay with Visa, Mastercard, or RuPay.</p>
                                </div>
                            </div>
                            {paymentMethod === 'CARD' && (
                                <div style={{ paddingLeft: "36px", marginTop: "20px", animation: "fadeIn 0.3s ease" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
                                        <input type="text" placeholder="Cardholder Name" required={paymentMethod === 'CARD'} value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })} style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none" }} />
                                        <input type="text" placeholder="Card Number (0000 0000 0000 0000)" maxLength={19} required={paymentMethod === 'CARD'} value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontFamily: "monospace" }} />
                                        <div style={{ display: "flex", gap: "16px" }}>
                                            <input type="text" placeholder="MM/YY" maxLength={5} required={paymentMethod === 'CARD'} value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontFamily: "monospace" }} />
                                            <input type="password" placeholder="CVV" maxLength={4} required={paymentMethod === 'CARD'} value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", outline: "none", fontFamily: "monospace" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Order Summary & Placement */}
                <div className="glass-card" style={{ padding: "32px", border: "1px solid rgba(0,255,204,0.3)" }}>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: "24px", color: "#fff" }}>Order Summary</h3>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)" }}>
                        <span>Rate ({colorMode})</span>
                        <span>₹{pricePerPage.toFixed(2)} per page</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)" }}>
                        <span>Math Breakdown</span>
                        <span>{pages} pages × {copies} copies × ₹{pricePerPage.toFixed(2)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ fontSize: "1.2rem", color: "#fff" }}>Total Price</span>
                        <span style={{ fontSize: "2rem", color: "var(--primary)", fontWeight: "bold" }}>₹{totalPrice.toFixed(2)}</span>
                    </div>

                    <p style={{ textAlign: "right", color: "var(--muted)", fontSize: "0.9rem", marginTop: "8px" }}>
                        Payment via: {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod === "UPI" ? "UPI Payment" : "Credit/Debit Card"}
                    </p>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "32px", padding: "16px", fontSize: "1.1rem" }}
                        disabled={submitting}
                    >
                        {submitting ? "Processing Document..." : "Place Print Order"}
                    </button>
                </div>
            </form>
        </div>
    );
}

