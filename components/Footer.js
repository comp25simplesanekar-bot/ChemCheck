import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ink-soft sm:px-6">
        <p className="max-w-3xl">
          ChemCheck gives general information only. It does not diagnose conditions or replace advice from a doctor,
          pharmacist or other qualified professional. Ingredient presence alone does not establish the actual risk of a product.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/about" className="underline">Methodology</Link>
          <Link href="/privacy" className="underline">Privacy</Link>
          <span>A college project that can grow into a real product.</span>
        </p>
      </div>
    </footer>
  );
}
