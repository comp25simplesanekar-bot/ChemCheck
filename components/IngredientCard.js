"use client";

import { useState } from "react";
import Badge, { STATUS } from "@/components/Badge";

function Row({ title, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-sm font-semibold text-brand-900">{title}</dt>
      <dd className="mt-0.5 text-ink-soft">{children}</dd>
    </div>
  );
}

export default function IngredientCard({ item }) {
  const [open, setOpen] = useState(false);
  const s = STATUS[item.classification] || STATUS.grey;
  const matched = item.status === "matched";

  return (
    <li className={"overflow-hidden rounded-2xl border-l-4 border-y border-r border-y-brand-100 border-r-brand-100 bg-white " + s.ring}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>
          <span className="block font-semibold text-ink">{item.name}</span>
          {item.input.toLowerCase() !== item.name.toLowerCase() && (
            <span className="block text-sm text-ink-soft">Listed as: {item.input}</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <Badge status={item.classification} />
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={"transition-transform duration-200 " + (open ? "rotate-180" : "")}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-brand-100 px-4 py-4">
          <p className="text-ink">
            <span className="font-semibold">Why this classification: </span>
            {item.why}
          </p>

          {matched && (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Row title="Common purpose">{item.function}</Row>
              <Row title="Potential health concerns">{item.health}</Row>
              <Row title="Skin or eye irritation">{item.irritation}</Row>
              <Row title="Allergy or sensitivity">{item.allergy}</Row>
              <Row title="Depends on">{item.dependsOn}</Row>
              <Row title="Evidence quality">{item.evidence}</Row>
              <Row title="Recommended precautions">{item.precautions}</Row>
              <Row title="Regulation">
                {item.regulation || "No restriction is recorded for this ingredient in our dataset. Indian status was not verified."}
              </Row>
            </dl>
          )}

          {matched && item.sources.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-brand-900">Where to verify this</p>
              <ul className="mt-1 space-y-1 text-sm">
                {item.sources.map((src) => (
                  <li key={src.url}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">
                      {src.publisher}: {src.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
