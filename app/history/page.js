"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import { getHistory, deleteReport, clearHistory, setCurrentReport } from "@/lib/storage";

const LEVEL_BADGE = { attention: "red", caution: "yellow", low: "green", limited: "grey", insufficient: "grey" };

export default function HistoryPage() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setList(getHistory());
    setLoaded(true);
  }, []);

  function open(report) {
    setCurrentReport(report);
    router.push("/results");
  }

  function remove(id) {
    deleteReport(id);
    setList(getHistory());
  }

  function removeAll() {
    if (window.confirm("Delete all saved analyses from this browser? This cannot be undone.")) {
      clearHistory();
      setList([]);
    }
  }

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold">Analysis history</h1>
        {list.length > 0 && <button type="button" className="btn-danger" onClick={removeAll}>Delete all history</button>}
      </div>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Reports are saved only in this browser on this device. Uploaded images are never saved. Nothing here is stored on a server.
      </p>

      {loaded && list.length === 0 && (
        <div className="card mt-8 p-8">
          <p className="text-ink-soft">No saved analyses yet. When you analyse a product, its report is saved here.</p>
          <Link href="/analyze" className="btn-primary mt-4">Analyze a product</Link>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {list.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-lg font-semibold">{r.productName || "Untitled product"}{r.brand ? " by " + r.brand : ""}</p>
              <p className="text-sm text-ink-soft">{r.category.label}, {new Date(r.createdAt).toLocaleString()}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Badge status={LEVEL_BADGE[r.level]} />
                <span className="text-sm text-ink-soft">{r.levelLabel}. {r.counts.total} ingredients, {r.counts.grey} not assessed.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-soft" onClick={() => open(r)}>Open</button>
              <button type="button" className="btn-danger" onClick={() => remove(r.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
