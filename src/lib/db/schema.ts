import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Hand-maintained to match neon-database/migrations/*.sql.
 * There is no migration generator wired to this file — if you change a
 * table here, write the matching .sql migration yourself and run it
 * against Neon, then update this schema to match.
 */

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  priceUgx: integer("price_ugx").notNull(),
  discountPriceUgx: integer("discount_price_ugx"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
  metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull().default({}),
  condition: text("condition").notNull().default("New"),
  warranty: text("warranty"),
  stock: integer("stock").notNull().default(0),
  availability: text("availability").notNull().default("in_stock"),
  compatibleAccessories: jsonb("compatible_accessories").$type<string[]>().notNull().default([]),
  useCases: jsonb("use_cases").$type<string[]>().notNull().default([]),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  sample: boolean("sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deliveryZones = pgTable("delivery_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  feeUgx: integer("fee_ugx"),
});

export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  note: text("note"),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("new"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  customerNotes: text("customer_notes"),
  zoneId: text("zone_id").notNull(),
  deliveryFeeUgx: integer("delivery_fee_ugx"),
  feeConfirmed: boolean("fee_confirmed").notNull().default(false),
  paymentMethodId: text("payment_method_id").notNull(),
  lines: jsonb("lines").$type<OrderLine[]>().notNull(),
  subtotalUgx: integer("subtotal_ugx").notNull(),
  totalUgx: integer("total_ugx").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderLine = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  sample: boolean;
};
