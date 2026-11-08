import { NextResponse } from "next/server";
import {
  createOrder,
  decrementProductStock,
  getProductById,
  listDeliveryZones,
  listPaymentMethods,
  type OrderLine,
} from "@/lib/db";
import { availabilityLabel, effectivePrice } from "@/lib/eri";

interface OrderRequestBody {
  name?: string;
  phone?: string;
  zone?: string;
  address?: string;
  notes?: string;
  payment?: string;
  items?: { id: string; qty: number }[];
}

/** Ported from the prototype's `/api/orders` mock handler — same validation rules. */
export async function POST(request: Request) {
  let body: OrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const errors: string[] = [];

  let zones, paymentMethods;
  try {
    [zones, paymentMethods] = await Promise.all([listDeliveryZones(), listPaymentMethods()]);
  } catch {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const zone = zones.find((z) => z.id === body.zone);
  const pm = paymentMethods.find((m) => m.id === body.payment && m.enabled);

  if (!body.name || String(body.name).trim().length < 2) errors.push("Enter your name.");
  if (!/^[+\d][\d\s-]{7,}$/.test(String(body.phone || ""))) errors.push("Enter a phone number we can reach.");
  if (!zone) errors.push("Choose a delivery option.");
  if (zone && zone.id !== "pickup" && !String(body.address || "").trim()) {
    errors.push("Enter a delivery address or landmark.");
  }
  if (!pm) errors.push("Choose an available payment method.");

  const lines: OrderLine[] = [];
  for (const item of body.items ?? []) {
    const product = await getProductById(item.id);
    if (!product) continue;
    const qty = Math.max(1, Math.min(20, Number(item.qty) || 1));
    if (availabilityLabel(product) === "Out of stock") {
      errors.push(`${product.name} is out of stock.`);
      continue;
    }
    if (product.stock < qty) {
      errors.push(`Only ${product.stock} of ${product.name} available.`);
      continue;
    }
    lines.push({
      id: product.id,
      name: product.name,
      qty,
      unitPrice: effectivePrice(product.priceUgx, product.discountPriceUgx),
      sample: product.sample,
    });
  }
  if (!lines.length) errors.push("Your cart is empty.");

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  const order = await createOrder({
    id: "EO-" + Date.now().toString(36).toUpperCase(),
    customerName: body.name!,
    customerPhone: body.phone!,
    customerAddress: body.address || undefined,
    customerNotes: body.notes || undefined,
    zoneId: zone!.id,
    deliveryFeeUgx: zone!.feeUgx ?? undefined,
    feeConfirmed: zone!.feeUgx !== null,
    paymentMethodId: pm!.id,
    lines,
    subtotalUgx: subtotal,
    totalUgx: subtotal + (zone!.feeUgx ?? 0),
  });

  await Promise.all(lines.map((l) => decrementProductStock(l.id, l.qty)));

  return NextResponse.json(order, { status: 201 });
}
