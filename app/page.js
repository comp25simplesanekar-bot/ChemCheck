import Link from "next/link";
import QuickStart from "@/components/QuickStart";
import Badge, { STATUS } from "@/components/Badge";
import { analyzeIngredients } from "@/lib/analyzer";
import { EXAMPLES } from "@/lib/examples";

export default function HomePage() {
  const reports = EXAMPLES.map((ex) => ({
    ex,
    report: analyzeIngredients({ ingredients: ex.text, categoryId: ex.category, source: "manual" }),
  }));
  const hero = reports[0].report;

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Know What&apos;s Inside. Make Informed Choices.</h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Understand product ingredients and their potential health concerns in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/analyze" className="btn-primary px-8 py-4 text-lg">Analyze Your Product</Link>
              <Link href="/about" className="btn-soft">How it works</Link>
            </div>
          </div>

          <div className="rise card p-5" aria-label="Example analysis of a typical shampoo ingredient list">
            <p className="text-sm text-ink-soft">A real analysis of a typical shampoo ingredient list</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {hero.items.map((item) => {
                const s = STATUS[item.classification];
                return (
                  <li key={item.input} className={"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium " + s.chip}>
                    <span className={"h-2.5 w-2.5 rounded-full " + s.dot} aria-hidden="true"></span>
                    {item.name}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm text-ink-soft">
              Green: low concern. Yellow: caution for some people or conditions. Red: significant concern. Grey: not enough information.
            </p>
          </div>
        </div>
      </section>

      <section className="page" aria-labelledby="start-heading">
        <h2 id="start-heading" className="text-3xl font-bold">Start with a photo or a list</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">Take a clear photo of the ingredient label on the back of the pack, or type the ingredients yourself.</p>
        <div className="mt-6"><QuickStart /></div>
      </section>

      <section className="bg-brand-50" aria-labelledby="examples-heading">
        <div className="page">
          <h2 id="examples-heading" className="text-3xl font-bold">Example reports</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">
            These use typical ingredient lists, not specific brands. The results come from the same engine and dataset your products will use.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {reports.map(({ ex, report }) => (
              <article key={ex.id} className="card flex flex-col p-6">
                <h3 className="text-xl font-bold">{ex.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{report.category.label}</p>
                <div className="mt-3"><Badge status={report.level === "attention" ? "red" : report.level === "caution" ? "yellow" : report.level === "low" ? "green" : "grey"} /></div>
                <p className="mt-3 text-sm font-semibold text-brand-900">{report.levelLabel}</p>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
                  {["green", "yellow", "red", "grey"].map((k) => (
                    <div key={k}>
                      <dt className={"mx-auto h-3 w-3 rounded-full " + STATUS[k].dot}><span className="sr-only">{STATUS[k].label}</span></dt>
                      <dd className="mt-1 text-lg font-bold">{report.counts[k]}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={"/analyze?example=" + ex.id} className="btn-soft mt-auto self-start">Open this example</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-3xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Add the ingredients", "Upload a label photo, scan a barcode, or type the list."],
            ["Check what we read", "Edit the detected list so it matches the pack exactly."],
            ["Compare with reviewed data", "Each ingredient is matched against a reviewed dataset with sources. Unknown ingredients stay grey."],
            ["Read the report", "See cautions, who should take care, and links to check the evidence."],
          ].map(([title, text], i) => (
            <li key={title} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-brand-50" aria-labelledby="limits-heading">
        <div className="page">
          <h2 id="limits-heading" className="text-3xl font-bold">What ingredient analysis cannot tell you</h2>
          <ul className="mt-5 max-w-3xl list-disc space-y-3 pl-5 text-ink-soft">
            <li>Labels rarely show how much of each ingredient is inside, and the amount often decides the risk.</li>
            <li>A chemical-sounding name does not make an ingredient dangerous. Water, vitamin C and salt are all chemicals.</li>
            <li>Our dataset is small. Ingredients we have not reviewed are shown as grey, never guessed.</li>
            <li>OCR can misread a photo. Always check the detected list against the pack.</li>
            <li>ChemCheck gives general information. It does not diagnose conditions or replace a doctor or pharmacist.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
