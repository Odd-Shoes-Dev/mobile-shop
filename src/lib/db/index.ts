import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { deliveryZones, orders, paymentMethods, products, type OrderLine } from "./schema";

export type { OrderLine } from "./schema";
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

/**
 * The only module feature code should import from for database access.
 * Never import "./client" or "./schema" directly outside this folder.
 */

export async function listProducts(): Promise<Product[]> {
  return getDb().select().from(products);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const rows = await getDb().select().from(products).where(eq(products.id, id));
  return rows[0];
}

export async function listDeliveryZones(): Promise<DeliveryZone[]> {
  return getDb().select().from(deliveryZones);
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  return getDb().select().from(paymentMethods);
}

export async function createOrder(input: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  zoneId: string;
  deliveryFeeUgx?: number;
  feeConfirmed: boolean;
  paymentMethodId: string;
  lines: OrderLine[];
  subtotalUgx: number;
  totalUgx: number;
}): Promise<Order> {
  const rows = await getDb().insert(orders).values(input).returning();
  return rows[0];
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const rows = await getDb().select().from(orders).where(eq(orders.id, id));
  return rows[0];
}
