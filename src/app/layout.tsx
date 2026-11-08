import type { Metadata } from "next";
import { Archivo_Black, Atkinson_Hyperlegible } from "next/font/google";
import { AssistantFab } from "@/components/AssistantFab";
import { BottomBar } from "@/components/BottomBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERISAF TECH SAFARI | Find the right tech, without the guesswork",
  description:
    "Laptops and computer accessories in Uganda. Prices in UGX. Compare, take the quiz, build your setup.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <AssistantFab />
        <BottomBar />
      </body>
    </html>
  );
}
