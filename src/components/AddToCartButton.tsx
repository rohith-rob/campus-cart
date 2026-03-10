"use client";
import { useCart, CartItem } from "@/context/CartContext";
import { useState } from "react";

export default function AddToCartButton({ product, styleClass = "btn btn-primary" }: { product: CartItem, styleClass?: string }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    return (
        <button
            className={styleClass}
            onClick={(e) => {
                e.preventDefault();
                addToCart(product);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
            }}
            disabled={added}
        >
            {added ? "Added!" : "Add to Cart"}
        </button>
    );
}
