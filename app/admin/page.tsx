"use client";
import { AdminThemeProvider } from "@/components/admin-theme";
import { lazy, Suspense } from "react";
const Admin = import.meta.env.DEV ? lazy(() => import("./local-admin")) : lazy(() => import("./remote-admin"));
export default function AdminPage() {
  return <AdminThemeProvider><Suspense fallback={<main>Loading administration…</main>}><Admin /></Suspense></AdminThemeProvider>;
}
