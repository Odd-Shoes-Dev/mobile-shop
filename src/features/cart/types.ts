export interface CartLine {
  id: string;
  qty: number;
}

/** What the cart drawer/checkout need about a line's product, fetched client-side. */
export interface CartProductInfo {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  isSample: boolean;
  availability: "in_stock" | "out_of_stock" | "preorder" | "unknown";
  stock: number;
}
