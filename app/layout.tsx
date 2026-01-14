import "./globals.css";
import Nav from "@/components/Nav";
import { Providers } from "./providers";

export const metadata = {
  title: "HL Dashboard",
  description: "Hyperliquid trading dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <Providers>
          <div className="container">
            <Nav />
            <div className="spacer" />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
