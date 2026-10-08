"use client";
import { lazy, Suspense } from "react";
// Vite removes this development-only import from the public build.
const LocalAdmin = import.meta.env.DEV ? lazy(() => import("./local-admin")) : null;
export default function AdminPage() {
  return LocalAdmin ? <Suspense fallback={<main>Loading…</main>}><LocalAdmin /></Suspense> : <main><h1>Not found</h1></main>;
}
