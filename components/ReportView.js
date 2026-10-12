"use client";

import { useState } from "react";
import Link from "next/link";
import Badge, { STATUS, LEVEL_STYLE } from "@/components/Badge";
import IngredientCard from "@/components/IngredientCard";

const SOURCE_TEXT = {
  manual: "Typed or pasted by you. Confidence depends on how closely it matches the printed label.",
  ocr: "Read from a photo using OCR and confirmed or edited by you. OCR can misread small or curved print.",
  barcode: "Loaded from a volunteer-contributed barcode database and confirmed by you. It may be out of date.",
};

function Tile({ label, value, status }) {
  const s = STATUS[status];
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4">
      <div className="flex items-center gap-2">
        {s && <span className={"h-3 w-3 rounded-full " + s.dot} aria-hidden="true"></span>}
        <span className="text-3xl font-bold text-brand-900">{value}</span>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export default function ReportView({ report }) {
  const [filter, setFilter] = useState("all");
  const level = LEVEL_STYLE[report.level] || STATUS.grey;
  const shown = report.items.filter((i) => filter === "all" || i.classification === filter);

  return (
    <div className="space-y-10">
      <section aria-labelledby="product-heading" className="card p-6">
        <h2 id="product-heading" className="text-2xl font-bold">Product information</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-ink-soft">Product</dt>
            <dd className="font-semibold">{report.productName || "Not identified"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Brand</dt>
            <dd className="font-semibold">{report.brand || "Not identified"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Category</dt>
            <dd className="font-semibold">{report.category.label}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Confidence in the ingredient list: </span>
          {SOURCE_TEXT[report.source] || SOURCE_TEXT.manual}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Analysed on {new Date(report.createdAt).toLocaleString()} using dataset version {report.dataset.version} ({report.dataset.entries} reviewed ingredients).
        </p>
      </section>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-2xl font-bold">Overall assessment</h2>
        <div className={"mt-4 rounded-3xl border-2 p-6 " + level.ring + " " + level.chip}>
          <p className="text-sm font-semibold">Overall concern level</p>
          <p className="font-display text-3xl font-bold">{report.levelLabel}</p>
          <p className="mt-2 max-w-2xl text-sm">
            This level summarises the ingredients we could assess. It is not a safety guarantee and it is not a score from a validated health-risk model. {report.assessed} of {report.counts.total} ingredients could be assessed.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Tile label="Ingredients analysed" value={report.counts.total} />
          <Tile label="Low concern" value={report.counts.green} status="green" />
          <Tile label="Need caution" value={report.counts.yellow} status="yellow" />
          <Tile label="Significant concern" value={report.counts.red} status="red" />
          <Tile label="Could not be assessed" value={report.counts.grey} status="grey" />
        </div>
      </section>

      {report.ai && report.ai.status === "ok" && (
        <section aria-labelledby="ai-heading" className="card p-6">
          <h2 id="ai-heading" className="text-xl font-bold">Plain-language summary (AI generated)</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Written by an AI model using only the facts from this report. Check the ingredient details below.
          </p>
          <div className="mt-3 whitespace-pre-line">{report.ai.text}</div>
        </section>
      )}
      {report.ai && report.ai.status === "disabled" && (
        <p className="rounded-2xl bg-nabg p-4 text-sm text-nafg">
          The AI summary was requested but no API key is set on the server. See the setup steps in the README. The ingredient analysis below does not need it.
        </p>
      )}
      {report.ai && report.ai.status === "error" && (
        <p className="rounded-2xl bg-warnbg p-4 text-sm text-warnfg">{report.ai.message}</p>
      )}

      <section aria-labelledby="findings-heading">
        <h2 id="findings-heading" className="text-2xl font-bold">Main findings</h2>
        {report.keyFindings.length === 0 ? (
          <p className="mt-3 text-ink-soft">No ingredient in the assessed list was flagged for caution or significant concern.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {report.keyFindings.map((f) => (
              <li key={f.name} className="rounded-2xl border border-brand-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">{f.name}</span>
                  <Badge status={f.classification} />
                </div>
                <p className="mt-2 text-ink-soft">{f.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ingredients-heading">
        <h2 id="ingredients-heading" className="text-2xl font-bold">Ingredient-by-ingredient analysis</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter ingredients">
          {[
            ["all", "All"],
            ["red", "Significant"],
            ["yellow", "Caution"],
            ["green", "Low concern"],
            ["grey", "Not assessed"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={"rounded-full border px-4 py-1.5 text-sm font-medium transition " + (filter === key ? "border-brand-600 bg-brand-600 text-white" : "border-brand-200 bg-white text-ink-soft hover:bg-brand-50")}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {shown.map((item, i) => (
            <IngredientCard key={item.input + i} item={item} />
          ))}
        </ul>
        {shown.length === 0 && <p className="mt-3 text-ink-soft">No ingredients in this group.</p>}
      </section>

      <section aria-labelledby="guidance-heading" className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 id="guidance-heading" className="text-xl font-bold">Who may need extra care</h2>
          {report.groups.length === 0 ? (
            <p className="mt-3 text-ink-soft">No specific groups were flagged for the assessed ingredients.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
              {report.groups.map((g) => <li key={g}>{g}</li>)}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Practical usage guidance</h2>
          {report.precautions.length === 0 ? (
            <p className="mt-3 text-ink-soft">Follow the directions on the product label.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
              {report.precautions.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="missing-heading" className="card p-6">
        <h2 id="missing-heading" className="text-xl font-bold">Missing information</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
          {report.missingInfo.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </section>

      <section aria-labelledby="regional-heading" className="card p-6">
        <h2 id="regional-heading" className="text-xl font-bold">Regulation in India</h2>
        <p className="mt-3 text-ink-soft">{report.regionalNote}</p>
      </section>

      <section aria-labelledby="reco-heading" className="card p-6">
        <h2 id="reco-heading" className="text-xl font-bold">Recommendations</h2>
        <p className="mt-3 text-ink-soft">
          ChemCheck does not suggest alternative products because it does not hold a verified product and ingredient database. To compare this product with another one under the same criteria, use the comparison tool.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/compare" className="btn-soft">Compare products</Link>
          <Link href="/analyze" className="btn-soft">Analyze another product</Link>
          <button type="button" className="btn-soft" onClick={() => window.print()}>Print this report</button>
        </div>
      </section>
    </div>
  );
}
