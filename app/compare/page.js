"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { getHistory } from "@/lib/storage";
import Badge, { STATUS } from "@/components/Badge";

const LEVEL_BADGE = { attention: "red", caution: "yellow", low: "green", limited: "grey", insufficient: "grey" };

function Side({ title, value, onChange, history }) {
  const idBase = title.replace(/\s/g, "-").toLowerCase();
  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {history.length > 0 && (
        <div className="mt-3">
          <label htmlFor={idBase + "-hist"} className="text-sm font-semibold">Load from history</label>
          <select
            id={idBase + "-hist"}
            className="field mt-1"
            value=""
            onChange={(e) => {
              const r = history.find((h) => h.id === e.target.value);
              if (r) {
                onChange({
                  name: r.productName,
                  category: r.category.id,
                  text: r.items.map((i) => i.input).join(", "),
                });
              }
            }}
          >
            <option value="">Choose a saved analysis</option>
            {history.map((h) => (
              <option key={h.id} value={h.id}>{(h.productName || "Untitled") + " - " + new Date(h.createdAt).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
      )}
      <label htmlFor={idBase + "-name"} className="mt-4 block text-sm font-semibold">Product name (optional)</label>
      <input id={idBase + "-name"} className="field mt-1" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      <label htmlFor={idBase + "-cat"} className="mt-4 block text-sm font-semibold">Category</label>
      <select id={idBase + "-cat"} className="field mt-1" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
        <option value="">Choose a category</option>
        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <label htmlFor={idBase + "-text"} className="mt-4 block text-sm font-semibold">Ingredients</label>
      <textarea id={idBase + "-text"} className="field mt-1 h-36" value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })} placeholder="Aqua, Glycerin, Parfum" />
    </div>
  );
}

async function run(side) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ingredients: side.text, category: side.category, productName: side.name, source: "manual" }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The analysis failed.");
  return data;
}

function flagged(report) {
  return report.items.filter((i) => i.classification === "red" || i.classification === "yellow");
}

export default function ComparePage() {
  const empty = { name: "", category: "", text: "" };
  const [a, setA] = useState(empty);
  const [b, setB] = useState(empty);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => setHistory(getHistory()), []);

  async function compare() {
    setError("");
    setResult(null);
    if (!a.category || !b.category) {
      setError("Please choose a category for both products.");
      return;
    }
    setBusy(true);
    try {
      const [ra, rb] = await Promise.all([run(a), run(b)]);
      setResult({ ra, rb });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  let shared = [];
  let onlyA = [];
  let onlyB = [];
  if (result) {
    const namesA = new Set(result.ra.items.map((i) => i.name));
    const namesB = new Set(result.rb.items.map((i) => i.name));
    shared = [...namesA].filter((n) => namesB.has(n));
    onlyA = [...namesA].filter((n) => !namesB.has(n));
    onlyB = [...namesB].filter((n) => !namesA.has(n));
  }

  return (
    <div className="page">
      <h1 className="text-4xl font-bold">Compare products</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Both products are checked with the same dataset and the same rules. Enter two ingredient lists, or load saved analyses.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Side title="Product A" value={a} onChange={setA} history={history} />
        <Side title="Product B" value={b} onChange={setB} history={history} />
      </div>

      {error && <p className="mt-6 rounded-2xl bg-badbg p-4 text-badfg" role="alert">{error}</p>}

      <button type="button" className="btn-primary mt-6 px-8 py-4 text-lg" disabled={busy} onClick={compare}>
        {busy ? "Comparing" : "Compare products"}
      </button>

      {result && (
        <section className="mt-10" aria-labelledby="cmp-heading">
          <h2 id="cmp-heading" className="text-2xl font-bold">Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-brand-100 text-left">
              <thead className="bg-brand-50">
                <tr>
                  <th className="p-3">Measure</th>
                  <th className="p-3">{a.name || "Product A"}</th>
                  <th className="p-3">{b.name || "Product B"}</th>
                </tr>
              </thead>
              <tbody>
                <tr><th className="border-t border-brand-100 p-3 font-medium">Overall level</th>
                  <td className="border-t border-brand-100 p-3"><Badge status={LEVEL_BADGE[result.ra.level]} /> <span className="block text-sm text-ink-soft">{result.ra.levelLabel}</span></td>
                  <td className="border-t border-brand-100 p-3"><Badge status={LEVEL_BADGE[result.rb.level]} /> <span className="block text-sm text-ink-soft">{result.rb.levelLabel}</span></td></tr>
                {[["Ingredients analysed", "total"], ["Low concern", "green"], ["Need caution", "yellow"], ["Significant concern", "red"], ["Could not be assessed", "grey"]].map(([label, key]) => (
                  <tr key={key}>
                    <th className="border-t border-brand-100 p-3 font-medium">{label}</th>
                    <td className="border-t border-brand-100 p-3">{result.ra.counts[key]}</td>
                    <td className="border-t border-brand-100 p-3">{result.rb.counts[key]}</td>
                  </tr>
                ))}
                <tr><th className="border-t border-brand-100 p-3 font-medium">Flagged ingredients</th>
                  <td className="border-t border-brand-100 p-3 text-sm">{flagged(result.ra).map((i) => i.name).join(", ") || "None"}</td>
                  <td className="border-t border-brand-100 p-3 text-sm">{flagged(result.rb).map((i) => i.name).join(", ") || "None"}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="card p-5"><h3 className="font-bold">Only in A</h3><p className="mt-2 text-sm text-ink-soft">{onlyA.join(", ") || "None"}</p></div>
            <div className="card p-5"><h3 className="font-bold">In both</h3><p className="mt-2 text-sm text-ink-soft">{shared.join(", ") || "None"}</p></div>
            <div className="card p-5"><h3 className="font-bold">Only in B</h3><p className="mt-2 text-sm text-ink-soft">{onlyB.join(", ") || "None"}</p></div>
          </div>

          <p className="mt-6 rounded-2xl bg-nabg p-4 text-sm text-nafg">
            Read this carefully: fewer flagged ingredients does not mean a product is better or safer. Check how many ingredients could not be assessed for each product, because unassessed ingredients hide information. Concentrations are unknown for both products.
          </p>
        </section>
      )}
    </div>
  );
}
