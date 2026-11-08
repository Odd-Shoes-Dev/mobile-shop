"use client";

import { useRouter } from "next/navigation";

export function ComparePicker({
  products,
  ids,
}: {
  products: { id: string; name: string }[];
  ids: string[];
}) {
  const router = useRouter();

  function setSlot(index: number, value: string) {
    const next = [...ids];
    if (value) next[index] = value;
    else next.splice(index, 1);
    const cleaned = next.filter(Boolean);
    router.push(cleaned.length ? `/compare?ids=${cleaned.join(",")}` : "/compare");
  }

  return (
    <div className="row" style={{ margin: "20px 0" }}>
      {[0, 1, 2].map((i) => (
        <select
          key={i}
          className="sel"
          aria-label={`Product ${i + 1}`}
          style={{ flex: 1, minWidth: 180 }}
          value={ids[i] ?? ""}
          onChange={(e) => setSlot(i, e.target.value)}
        >
          <option value="">{i < 2 ? "Choose a product" : "Add a third (optional)"}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
