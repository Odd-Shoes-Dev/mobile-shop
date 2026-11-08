"use client";

import { useCart } from "../context/CartContext";

export function AddToCartButton({
  id,
  qty = 1,
  disabled,
  outLabel = "Unavailable",
  className = "btn btn--sm",
}: {
  id: string;
  qty?: number;
  disabled?: boolean;
  outLabel?: string;
  className?: string;
}) {
  const { addItem } = useCart();

  return (
    <button className={className} type="button" disabled={disabled} onClick={() => addItem(id, qty)}>
      {disabled ? outLabel : "Add to cart"}
    </button>
  );
}
