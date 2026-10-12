"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze Product" },
  { href: "/compare", label: "Compare Products" },
  { href: "/history", label: "Analysis History" },
  { href: "/about", label: "About and Methodology" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3h6" />
              <path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" />
            </svg>
          </span>
          <span className="font-display text-xl font-bold text-brand-900">ChemCheck</span>
        </Link>

        <button
          type="button"
          className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 lg:hidden"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>

        <nav
          id="main-nav"
          aria-label="Main"
          className={(open ? "flex" : "hidden") + " absolute left-0 right-0 top-full flex-col gap-1 border-b border-brand-100 bg-white p-4 shadow-soft lg:static lg:flex lg:flex-row lg:gap-1 lg:border-0 lg:p-0 lg:shadow-none"}
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={"rounded-full px-3 py-2 text-sm font-medium transition " + (active ? "bg-brand-100 text-brand-900" : "text-ink-soft hover:bg-brand-50 hover:text-brand-900")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
