import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/features/cart/components/CartButton";

const NAV_LINKS = [
  { href: "/mission/game", label: "Game" },
  { href: "/mission/study", label: "Study" },
  { href: "/mission/create", label: "Create" },
  { href: "/mission/work", label: "Work" },
  { href: "/compare", label: "Compare" },
  { href: "/budget", label: "Budget" },
  { href: "/setup/student", label: "Setup" },
  { href: "/quiz", label: "Quiz" },
];

export function Header() {
  return (
    <>
      <div className="infobar">
        <span>Prices in UGX</span>
        <span>Compare before you buy</span>
      </div>
      <div className="sample-bar">
        Demo catalogue: sample products and placeholder art. Not real ERISAF inventory.
      </div>
      <header className="top">
        <Link className="brand" href="/" aria-label="ERISAF Tech Safari home">
          <Image src="/images/brand-logo.jpg" alt="ERISAF Tech Safari" width={158} height={40} priority />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <form className="search" role="search" action="/shop" method="get">
          <label className="sr" htmlFor="q">
            Search products
          </label>
          <input id="q" name="q" type="search" placeholder="Search laptops, mice, bags" autoComplete="off" />
          <button className="btn btn--sm" type="submit">
            Go
          </button>
        </form>
        <CartButton />
      </header>
    </>
  );
}
