import { connection } from "next/server";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { listDeliveryZones, listPaymentMethods } from "@/lib/db";

export const instant = false;

export default async function CheckoutPage() {
  // Live delivery zones / payment methods — must not be baked into the build.
  await connection();

  let dbError: string | null = null;
  let zones: Awaited<ReturnType<typeof listDeliveryZones>> = [];
  let paymentMethods: Awaited<ReturnType<typeof listPaymentMethods>> = [];
  try {
    [zones, paymentMethods] = await Promise.all([listDeliveryZones(), listPaymentMethods()]);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Could not load checkout options.";
  }

  if (dbError) {
    return (
      <section className="sec">
        <div className="wrap notice">
          <p>
            <b>Database not connected yet.</b>
          </p>
          <p className="muted">
            Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations to check
            out for real.
          </p>
        </div>
      </section>
    );
  }

  return <CheckoutForm zones={zones} paymentMethods={paymentMethods} />;
}
