"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReportView from "@/components/ReportView";
import { getCurrentReport, deleteReport } from "@/lib/storage";

export default function ResultsPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReport(getCurrentReport());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div className="page"><p className="text-ink-soft">Loading report</p></div>;
  }

  if (!report) {
    return (
      <div className="page">
        <h1 className="text-4xl font-bold">Analysis results</h1>
        <p className="mt-4 max-w-xl text-ink-soft">There is no report to show yet. Analyze a product to see its report here, or open an earlier report from your history.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/analyze" className="btn-primary">Analyze a product</Link>
          <Link href="/history" className="btn-soft">Open history</Link>
        </div>
      </div>
    );
  }

  function remove() {
    if (window.confirm("Delete this report from your history?")) {
      deleteReport(report.id);
      router.push("/history");
    }
  }

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold">Analysis results</h1>
        <button type="button" className="btn-danger" onClick={remove}>Delete this report</button>
      </div>
      <p className="mt-2 mb-8 max-w-2xl text-ink-soft">
        This report is general information. It does not say a product is completely safe or completely harmful, and it does not replace advice from a doctor or pharmacist.
      </p>
      <ReportView report={report} />
    </div>
  );
}
