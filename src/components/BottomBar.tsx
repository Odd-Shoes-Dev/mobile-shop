import Link from "next/link";
import { CartButton } from "@/features/cart/components/CartButton";

export function BottomBar() {
  return (
    <nav className="bottombar" aria-label="Quick">
      <Link href="/" className="on">
        Home
      </Link>
      <Link href="/shop">Shop</Link>
      <Link href="/compare">Compare</Link>
      <Link href="/quiz">Quiz</Link>
      <CartButton variant="bottombar" />
    </nav>
  );
}
