"use client";

import Link from "next/link";
import { ArtIcon, type ArtCategory } from "@/components/ArtIcon";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { effectivePrice, formatUgx } from "@/lib/eri";

export interface AssistantCardData {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice: number | null;
  availability: "in_stock" | "out_of_stock" | "preorder" | "unknown";
  why?: string[];
}

/** Ported from the prototype's `assistantCard()`. */
export function AssistantCard({ card, onNavigate }: { card: AssistantCardData; onNavigate: () => void }) {
  const out = card.availability === "out_of_stock";
  const price = effectivePrice(card.price, card.discountPrice);

  return (
    <div className="mini-card">
      <div className="art">
        <ArtIcon category={card.category as ArtCategory} seed={card.id} />
      </div>
      <div>
        <b>{card.name}</b>
        <div className="price">{formatUgx(price)}</div>
        {card.why && card.why.length > 0 && (
          <ul className="why">
            {card.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        <div className="row" style={{ marginTop: 6 }}>
          <Link className="btn btn--sm" href={`/p/${card.id}`} onClick={onNavigate}>
            View
          </Link>
          <AddToCartButton id={card.id} disabled={out} className="chip" />
        </div>
      </div>
    </div>
  );
}
