import type { Metadata } from "next";
import "@/styles/admin.css";

/**
 * The admin shell. A work surface, not a brand surface
 * (docs/design/verkstan.md §2 "Admin"): no site header, no footer, no tints
 * except the state chips, and never indexable.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
