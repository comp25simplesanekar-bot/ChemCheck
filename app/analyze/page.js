"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { EXAMPLES } from "@/lib/examples";
import { parseIngredientList } from "@/lib/parseIngredients";
import { extractIngredientsFromText } from "@/lib/extractFromOcr";
import { takePending } from "@/lib/pending";
import { saveReport } from "@/lib/storage";
import BarcodeScanner from "@/components/BarcodeScanner";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

export default function AnalyzePage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState("image");
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [text, setText] = useState("");
  const [source, setSource] = useState("manual");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ocrConsent, setOcrConsent] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrMessage, setOcrMessage] = useState(null);
  const [rawText, setRawText] = useState("");

  const [barcode, setBarcode] = useState("");
  const [barcodeBusy, setBarcodeBusy] = useState(false);
  const [barcodeMessage, setBarcodeMessage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [canScan, setCanScan] = useState(false);

  const [useAI, setUseAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ aiEnabled: false, barcodeLookup: false, unreachable: true }));

    setCanScan(typeof window !== "undefined" && "BarcodeDetector" in window);

    const pending = takePending();
    if (pending.file) {
      chooseFile(pending.file);
    } else if (pending.text) {
      setMode("manual");
      setText(pending.text);
    }

    const exampleId = new URLSearchParams(window.location.search).get("example");
    const example = EXAMPLES.find((e) => e.id === exampleId);
    if (example) {
      setMode("manual");
      setText(example.text);
      setCategory(example.category);
      setProductName(example.title + " (example)");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function chooseFile(f) {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError("That file type is not supported. Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("That image is larger than 8 MB. Please choose a smaller photo.");
      return;
    }
    setError("");
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setOcrMessage(null);
    setRawText("");
    setMode("image");
  }

  async function runOcr() {
    if (!file) return;
    setOcrBusy(true);
    setOcrProgress(0);
    setOcrMessage(null);
    setError("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setOcrProgress(Math.round(m.progress * 100));
        },
      });
      let recognized = "";
      try {
        const result = await worker.recognize(file);
        recognized = result.data.text || "";
      } finally {
        await worker.terminate();
      }

      setRawText(recognized);
      const extracted = extractIngredientsFromText(recognized);
      if (extracted.found) {
        setText(extracted.text);
        setSource("ocr");
        setOcrMessage({ kind: "good", text: "We found an ingredient list. Please compare it with your pack and fix any mistakes below." });
      } else if (recognized.trim().length < 15) {
        setOcrMessage({ kind: "warn", text: "We could not read any useful text from this photo. Try a sharper, well-lit photo of the back label." });
      } else {
        setOcrMessage({
          kind: "warn",
          text: "We could not find an ingredient list in this photo. If this shows the front of the product, please upload a photo of the back label where the ingredients are printed. We do not guess ingredients.",
        });
      }
    } catch (e) {
      setOcrMessage({
        kind: "bad",
        text: "The label reader could not start. It needs an internet connection the first time to download its language data. You can still type the ingredients instead.",
      });
    } finally {
      setOcrBusy(false);
    }
  }

  const onDetected = useCallback((code) => {
    setScanning(false);
    setBarcode(code);
    lookupBarcode(code);
  }, []);

  async function lookupBarcode(codeArg) {
    const code = (codeArg || barcode).trim();
    setBarcodeMessage(null);
    if (!/^\d{8,14}$/.test(code)) {
      setBarcodeMessage({ kind: "bad", text: "A barcode has 8 to 14 digits." });
      return;
    }
    setBarcodeBusy(true);
    try {
      const response = await fetch("/api/barcode?code=" + code);
      const data = await response.json();
      if (!response.ok) {
        setBarcodeMessage({ kind: "bad", text: data.error || "The lookup failed." });
      } else if (!data.found) {
        setBarcodeMessage({ kind: "warn", text: "This barcode is not in the open product databases. Please upload the back label or type the ingredients." });
      } else if (!data.ingredients) {
        setProductName(data.productName);
        setBrand(data.brand);
        setBarcodeMessage({ kind: "warn", text: "The product was found in " + data.database + " but it has no ingredient list. Please upload the back label instead." });
      } else {
        setProductName(data.productName);
        setBrand(data.brand);
        setText(data.ingredients);
        setSource("barcode");
        setCategory((c) => c || data.suggestedCategory);
        setBarcodeMessage({ kind: "good", text: "Found in " + data.database + ". " + data.note + " Please confirm the category below." });
      }
    } catch (e) {
      setBarcodeMessage({ kind: "bad", text: "The lookup could not be completed. Check your internet connection." });
    } finally {
      setBarcodeBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!category) {
      setError("Please choose a product category.");
      return;
    }
    if (parseIngredientList(text).length === 0) {
      setError("Please add at least one ingredient before analysing.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ingredients: text,
          category,
          productName,
          brand,
          source: mode === "manual" && source === "manual" ? "manual" : source,
          useAI,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "The analysis failed. Please try again.");
        setSubmitting(false);
        return;
      }
      saveReport(data);
      router.push("/results");
    } catch (err) {
      setError("The analysis service could not be reached. Make sure the app is running and try again.");
      setSubmitting(false);
    }
  }

  const chips = parseIngredientList(text);
  const messageStyle = { good: "bg-okbg text-okfg", warn: "bg-warnbg text-warnfg", bad: "bg-badbg text-badfg" };

  return (
    <div className="page">
      <h1 className="text-4xl font-bold">Analyze a product</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">Add the ingredients in any of three ways, check the list, then analyse.</p>

      <form onSubmit={submit} className="mt-8 space-y-8" noValidate>
        <section className="card p-6" aria-labelledby="step1">
          <h2 id="step1" className="text-xl font-bold">1. Product details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label htmlFor="category" className="font-semibold">Product category (required)</label>
              <select id="category" className="field mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Choose a category</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="pname" className="font-semibold">Product name (optional)</label>
              <input id="pname" className="field mt-1" value={productName} onChange={(e) => setProductName(e.target.value)} maxLength={120} />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="brand" className="font-semibold">Brand (optional)</label>
              <input id="brand" className="field mt-1" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={120} />
            </div>
          </div>
        </section>

        <section className="card p-6" aria-labelledby="step2">
          <h2 id="step2" className="text-xl font-bold">2. Add the ingredients</h2>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Input method">
            {[
              ["image", "Photo of label"],
              ["barcode", "Barcode"],
              ["manual", "Type or paste"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={mode === key}
                onClick={() => setMode(key)}
                className={"rounded-full border px-5 py-2 font-medium transition " + (mode === key ? "border-brand-600 bg-brand-600 text-white" : "border-brand-200 bg-white text-ink-soft hover:bg-brand-50")}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "image" && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-ink-soft">
                Photograph the back of the pack, where the word &quot;Ingredients&quot; is printed. A front-only photo does not show the ingredients.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Choose an image of the ingredient label"
                onChange={(e) => chooseFile(e.target.files[0])}
              />
              <button type="button" className="btn-soft" onClick={() => fileRef.current && fileRef.current.click()}>
                {file ? "Choose a different image" : "Choose image (JPG, PNG or WEBP)"}
              </button>

              {previewUrl && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview of the uploaded label" className="max-h-72 w-full rounded-2xl border border-brand-100 object-contain" />
                  <div>
                    <label className="flex items-start gap-3 text-sm">
                      <input type="checkbox" className="mt-1 h-5 w-5" checked={ocrConsent} onChange={(e) => setOcrConsent(e.target.checked)} />
                      <span>
                        I agree to have this image read by text recognition in my browser. The image stays on my device. It is not uploaded or stored by ChemCheck.
                      </span>
                    </label>
                    <button type="button" className="btn-primary mt-4" disabled={!ocrConsent || ocrBusy} onClick={runOcr}>
                      {ocrBusy ? "Reading label " + ocrProgress + " percent" : "Read the label"}
                    </button>
                    {ocrBusy && (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={ocrProgress} aria-valuemin="0" aria-valuemax="100">
                        <div className="h-full bg-brand-500 transition-all" style={{ width: ocrProgress + "%" }}></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {ocrMessage && <p className={"rounded-2xl p-4 text-sm " + messageStyle[ocrMessage.kind]} role="status">{ocrMessage.text}</p>}

              {rawText && (
                <details className="rounded-2xl border border-brand-100 p-4 text-sm">
                  <summary className="cursor-pointer font-semibold">Show the text we read from the photo</summary>
                  <pre className="mt-3 whitespace-pre-wrap text-ink-soft">{rawText}</pre>
                  <button type="button" className="btn-soft mt-3" onClick={() => { setText(rawText.replace(/\s*\n\s*/g, ", ")); setSource("ocr"); }}>
                    Use this text as a starting point
                  </button>
                </details>
              )}
            </div>
          )}

          {mode === "barcode" && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-ink-soft">
                We look the barcode up in open, volunteer-run product databases (Open Food Facts, Open Beauty Facts and Open Products Facts). Not every product is listed, and entries can be wrong or out of date.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[200px] flex-1">
                  <label htmlFor="barcode" className="sr-only">Barcode number</label>
                  <input id="barcode" inputMode="numeric" className="field" placeholder="Barcode digits, for example 8901234567890" value={barcode} onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ""))} />
                </div>
                <button type="button" className="btn-primary" disabled={barcodeBusy} onClick={() => lookupBarcode()}>
                  {barcodeBusy ? "Looking up" : "Look up"}
                </button>
                {canScan && (
                  <button type="button" className="btn-soft" onClick={() => setScanning(true)}>Scan with camera</button>
                )}
              </div>
              {!canScan && <p className="text-sm text-ink-soft">Camera scanning is not supported in this browser. Type the digits printed under the barcode.</p>}
              {scanning && <BarcodeScanner onDetected={onDetected} onClose={() => setScanning(false)} />}
              {barcodeMessage && <p className={"rounded-2xl p-4 text-sm " + messageStyle[barcodeMessage.kind]} role="status">{barcodeMessage.text}</p>}
            </div>
          )}

          {mode === "manual" && (
            <p className="mt-5 text-sm text-ink-soft">Type or paste the ingredient list into the box below.</p>
          )}
        </section>

        <section className="card p-6" aria-labelledby="step3">
          <h2 id="step3" className="text-xl font-bold">3. Confirm or edit the ingredients</h2>
          <label htmlFor="ingredients" className="mt-3 block text-sm text-ink-soft">
            Separate ingredients with commas. Fix any word the reader got wrong. We never add ingredients you did not enter.
          </label>
          <textarea
            id="ingredients"
            className="field mt-2 h-40"
            placeholder="Aqua, Glycerin, Sodium Laureth Sulfate, Parfum"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="mt-3 text-sm font-semibold text-brand-900" aria-live="polite">
            {chips.length === 0 ? "No ingredients yet." : chips.length + " ingredients detected:"}
          </p>
          {chips.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.raw} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-900">{c.raw}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6" aria-labelledby="step4">
          <h2 id="step4" className="text-xl font-bold">4. Optional AI summary</h2>
          <label className="mt-3 flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5" disabled={!status || !status.aiEnabled} checked={useAI} onChange={(e) => setUseAI(e.target.checked)} />
            <span>
              Add a short plain-language summary written by an AI model. This sends the ingredient names and the report facts (not your image) to the AI provider. The classifications themselves never come from the AI.
            </span>
          </label>
          {status && !status.aiEnabled && (
            <p className="mt-3 rounded-2xl bg-nabg p-4 text-sm text-nafg">
              AI summaries are switched off because no ANTHROPIC_API_KEY is set on the server. Add it to the .env.local file and restart the app to enable this option. Everything else works without it.
            </p>
          )}
        </section>

        {error && <p className="rounded-2xl bg-badbg p-4 text-badfg" role="alert">{error}</p>}

        <div>
          <button type="submit" className="btn-primary px-8 py-4 text-lg" disabled={submitting}>
            {submitting ? "Analysing" : "Analyze ingredients"}
          </button>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            The ingredient text is sent to this app&apos;s server for analysis. The finished report is saved only in this browser, and you can delete it any time from Analysis History.
          </p>
        </div>
      </form>
    </div>
  );
}
