import type { Metadata } from "next";
import "./globals.css";
import "@/lib/patch-remove-child";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "Brücke • MagdeHack Psychotherapie-Begleitung",
  description: "Digitale Brücke während langer Wartezeiten auf Psychotherapie",
};

const domPatchScript = `
  if (typeof Node !== 'undefined' && Node.prototype) {
    const origRemove = Node.prototype.removeChild;
    Node.prototype.removeChild = function(c) {
      if (c && c.parentNode !== this) {
        return c.parentNode ? c.parentNode.removeChild(c) : c;
      }
      return origRemove.apply(this, arguments);
    };
    const origInsert = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(n, r) {
      if (r && r.parentNode !== this) {
        return r.parentNode ? r.parentNode.insertBefore(n, r) : n;
      }
      return origInsert.apply(this, arguments);
    };
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script dangerouslySetInnerHTML={{ __html: domPatchScript }} />
      </head>
      <body className="min-h-full flex flex-col notranslate" suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
