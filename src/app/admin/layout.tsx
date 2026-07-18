import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Gemartopup",
  description: "Admin Dashboard Gemartopup",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
