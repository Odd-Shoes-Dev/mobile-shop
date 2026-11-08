import Link from "next/link";
import { connection } from "next/server";
import { getOrderById } from "@/lib/db";
import { formatUgx } from "@/lib/eri";

export const instant = false;

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : null;
  const order = id ? await getOrderById(id).catch(() => undefined) : undefined;

  if (!order) {
    return (
      <section className="sec">
        <div className="wrap">
          <Link className="btn" href="/">
            Back to the shop
          </Link>
        </div>
      </section>
    );
  }

  const hasSample = order.lines.some((l) => l.sample);
  const waMessage = `Hi ERISAF, I placed order ${order.id} (${order.lines
    .map((l) => `${l.qty} x ${l.name}`)
    .join(", ")}). Total ${formatUgx(order.totalUgx)}${order.feeConfirmed ? "" : " plus delivery"}.`;

  return (
    <section className="sec sec--y">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <h1>ORDER RECEIVED.</h1>
        <p style={{ fontWeight: 700, margin: "14px 0" }}>
          Reference <b>{order.id}</b>. Status: awaiting confirmation. Payment: not yet paid.
        </p>
        <div className="tool">
          <p>
            The team will contact {order.customerName} on {order.customerPhone} to confirm{" "}
            {order.feeConfirmed ? "payment" : "the delivery fee and payment"}.
          </p>
          {hasSample && (
            <p className="notice">This order contains sample catalogue items, so it is a test order.</p>
          )}
          <div className="row">
            <span className="notice">
              WhatsApp number not set yet. Would have sent: &quot;{waMessage}&quot;
            </span>
            <Link className="btn btn--white" href="/">
              Keep exploring
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
