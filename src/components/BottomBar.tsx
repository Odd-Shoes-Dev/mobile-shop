import Link from "next/link";

export function BottomBar() {
  return (
    <nav className="bottombar" aria-label="Quick">
      <Link href="/" className="on">
        Home
      </Link>
      <Link href="/shop">Shop</Link>
      <Link href="/compare">Compare</Link>
      <Link href="/quiz">Quiz</Link>
      <button type="button">
        Cart <b>0</b>
      </button>
    </nav>
  );
}
