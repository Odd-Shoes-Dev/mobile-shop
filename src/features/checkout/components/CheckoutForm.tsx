"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/context/CartContext";
import { useCatalogue } from "@/features/cart/hooks/useCatalogue";
import { formatUgx } from "@/lib/eri";
import type { DeliveryZone, PaymentMethod } from "@/lib/db";

export function CheckoutForm({
  zones,
  paymentMethods,
}: {
  zones: DeliveryZone[];
  paymentMethods: PaymentMethod[];
}) {
  const router = useRouter();
  const { cart, clear } = useCart();
  const { products, loading } = useCatalogue();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const firstEnabled = paymentMethods.find((m) => m.enabled);
  const [payment, setPayment] = useState(firstEnabled?.id ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const lines = cart.map((l) => ({ ...l, p: products.get(l.id) })).filter((l) => l.p);
  const subtotal = lines.reduce((a, l) => a + (l.p ? (l.p.discountPrice ?? l.p.price) : 0) * l.qty, 0);
  const zone = zones.find((z) => z.id === zoneId);
  const fee = zone?.feeUgx ?? null;
  const total = subtotal + (fee ?? 0);

  const isPickup = zoneId === "pickup";

  const canSubmit = !loading && lines.length > 0;

  if (!loading && lines.length === 0) {
    return (
      <section className="sec">
        <div className="wrap">
          <div className="empty">
            <h3>Your cart is empty</h3>
            <Link className="btn" href="/shop">
              Browse products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrors([]);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, zone: zoneId, address, notes, payment, items: cart }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "Could not place the order."]);
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/done?id=${encodeURIComponent(data.id)}`);
    } catch {
      setErrors(["Could not reach the server. Your cart is saved. Try again."]);
      setSubmitting(false);
    }
  }

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: "clamp(2rem,7vw,4rem)" }}>CHECKOUT</h1>
        <div className="notice notice--y" style={{ margin: "16px 0" }}>
          <b>No payment is taken on this page.</b> We record your order and the team confirms delivery and
          payment with you. Online mobile money isn&apos;t connected yet.
        </div>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="cName">Full name</label>
            <input id="cName" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cPhone">Phone (WhatsApp if possible)</label>
            <input
              id="cPhone"
              type="tel"
              autoComplete="tel"
              placeholder="+256 7XX XXX XXX"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="cZone">Delivery</label>
            <select id="cZone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}: {z.feeUgx === null ? "fee confirmed by the team" : z.feeUgx === 0 ? "free" : formatUgx(z.feeUgx)}
                </option>
              ))}
            </select>
          </div>
          {!isPickup && (
            <div className="field">
              <label htmlFor="cAddr">Address or landmark</label>
              <input id="cAddr" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label htmlFor="cNotes">Notes (optional)</label>
            <textarea id="cNotes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <fieldset className="field" style={{ border: 0, padding: 0 }}>
            <legend style={{ fontWeight: 700, marginBottom: 6 }}>Payment</legend>
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className="notice"
                style={{ display: "flex", gap: 10, marginBottom: 8, opacity: m.enabled ? 1 : 0.6 }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m.id}
                  disabled={!m.enabled}
                  checked={payment === m.id}
                  onChange={() => setPayment(m.id)}
                />
                <span>
                  <b>{m.label}</b>
                  <br />
                  <small>{m.note}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="tool">
            <h3>Order summary</h3>
            {lines.map((l) => (
              <div className="row" key={l.id} style={{ justifyContent: "space-between" }}>
                <span>
                  {l.qty} x {l.p!.name}
                </span>
                <span>{formatUgx((l.p!.discountPrice ?? l.p!.price) * l.qty)}</span>
              </div>
            ))}
            <hr />
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <b>{formatUgx(subtotal)}</b>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span>Delivery</span>
              <b>{fee === null ? "To be confirmed" : fee === 0 ? "Free" : formatUgx(fee)}</b>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span>Total now</span>
              <b className="price">
                {formatUgx(total)}
                {fee === null ? " + delivery" : ""}
              </b>
            </div>
          </div>

          {errors.length > 0 && (
            <div role="alert" style={{ margin: "12px 0", fontWeight: 700 }}>
              {errors.map((e) => (
                <div key={e}>{e}</div>
              ))}
            </div>
          )}

          <button className="btn" type="submit" disabled={submitting || !canSubmit}>
            Place order
          </button>
        </form>
      </div>
    </section>
  );
}
