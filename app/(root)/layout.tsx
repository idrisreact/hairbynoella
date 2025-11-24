import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen text-gray-400">
      {/* header */}
      <div className="container py-10">{children}</div>
    </main>
  );
}
