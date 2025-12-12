import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmileCare Dental - AI Appointment Assistant",
  description: "Book your dental appointment with our AI receptionist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-dental-gray">
        {children}
      </body>
    </html>
  );
}
