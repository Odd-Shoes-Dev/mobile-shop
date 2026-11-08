"use client";

import { useCart } from "../context/CartContext";

export function CartButton({ variant = "header" }: { variant?: "header" | "bottombar" }) {
  const { totalCount, openCart } = useCart();

  if (variant === "bottombar") {
    return (
      <button type="button" onClick={openCart}>
        Cart <b>{totalCount}</b>
      </button>
    );
  }

  return (
    <button type="button" className="cartbtn" aria-label="Open cart" onClick={openCart}>
      Cart <b>{totalCount}</b>
    </button>
  );
}
