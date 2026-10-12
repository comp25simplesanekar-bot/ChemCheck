"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setPending } from "@/lib/pending";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default function QuickStart() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleFile(file) {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    setPending({ file });
    router.push("/analyze");
  }

  function handleText() {
    if (text.trim().length < 3) {
      setError("Type or paste at least one ingredient first.");
      return;
    }
    setPending({ text });
    router.push("/analyze");
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div
        className={"card flex flex-col items-center justify-center p-8 text-center transition " + (dragging ? "border-brand-500 bg-brand-50" : "")}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgb(40, 134, 84)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          <path d="M12 4v11" />
          <path d="M7 9l5-5 5 5" />
        </svg>
        <h3 className="mt-3 text-xl font-bold">Upload a label photo</h3>
        <p className="mt-1 text-sm text-ink-soft">Drop an image of the ingredient label here. JPG, PNG or WEBP.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Choose an image of the ingredient label"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <button type="button" className="btn-primary mt-5" onClick={() => inputRef.current && inputRef.current.click()}>
          Choose image
        </button>
      </div>

      <div className="card p-8">
        <h3 className="text-xl font-bold">Or type the ingredients</h3>
        <label htmlFor="quick-text" className="mt-1 block text-sm text-ink-soft">
          Copy the list from the pack, separated by commas.
        </label>
        <textarea
          id="quick-text"
          className="field mt-3 h-28 resize-none"
          placeholder="Aqua, Glycerin, Sodium Laureth Sulfate"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
        />
        <button type="button" className="btn-primary mt-4" onClick={handleText}>Continue</button>
      </div>

      {error && <p className="text-sm text-badfg md:col-span-2" role="alert">{error}</p>}
    </div>
  );
}
