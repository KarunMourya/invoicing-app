"use client";

import { ProtectedRoute } from "@/src/components/protected/ProtectedRoute";
import { Layout } from "@/src/components/protected/Layout";

export default function ProtectedGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
