"use client";

import Link from "next/link";
import { ArtIcon, type ArtCategory } from "@/components/ArtIcon";
import { formatUgx } from "@/lib/eri";
import { useCart } from "../context/CartContext";
import { useCatalogue } from "../hooks/useCatalogue";

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, setQty } = useCart();
  const { products } = useCatalogue();

  if (!isOpen) return null;

  const lines = cart.map((l) => ({ ...l, p: products.get(l.id) })).filter((l) => l.p);
  const subtotal = lines.reduce((a, l) => a + (l.p ? (l.p.discountPrice ?? l.p.price) : 0) * l.qty, 0);

  return (
    <>
      <div className="scrim" onClick={closeCart} />
      <div className="drawer" id="cart">
        <div className="drawer__head">
          <h3>Your cart</h3>
          <button className="x" type="button" aria-label="Close cart" onClick={closeCart}>
            &times;
          </button>
        </div>
        <div className="drawer__body">
          {lines.length ? (
            lines.map((l) => {
              const p = l.p!;
              const price = p.discountPrice ?? p.price;
              return (
                <div className="line" key={l.id}>
                  <div className="art">
                    <ArtIcon category={p.category as ArtCategory} seed={p.id} />
                  </div>
                  <div>
                    <b>{p.name}</b>
                    <div>{formatUgx(price)}</div>
                    <div className="row">
                      <span className="qty">
                        <button type="button" aria-label="Fewer" onClick={() => setQty(l.id, l.qty - 1)}>
                          &minus;
                        </button>
                        <span>{l.qty}</span>
                        <button type="button" aria-label="More" onClick={() => setQty(l.id, l.qty + 1)}>
                          +
                        </button>
                      </span>
                      <button className="chip" type="button" onClick={() => removeItem(l.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty">
              <p>
                <b>Your cart is empty.</b>
              </p>
              <Link className="btn btn--sm" href="/quiz" onClick={closeCart}>
                Find my perfect tech
              </Link>
            </div>
          )}
        </div>
        {lines.length > 0 && (
          <div className="drawer__foot">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b>Subtotal</b>
              <span className="price">{formatUgx(subtotal)}</span>
            </div>
            <p className="muted" style={{ margin: 0 }}>
              Delivery is added at checkout.
            </p>
            <Link className="btn" href="/checkout" onClick={closeCart}>
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
