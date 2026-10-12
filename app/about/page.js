import { datasetInfo } from "@/lib/analyzer";
import { STATUS } from "@/components/Badge";

export const metadata = { title: "About and Methodology - ChemCheck" };

const DEFS = [
  ["green", "Generally considered low concern for the intended use, based on the evidence in our dataset."],
  ["yellow", "Potential concerns for certain people or under particular conditions, such as high concentration, leave-on use, sensitive skin, young children or pregnancy."],
  ["red", "Significant concern or a restriction that deserves attention, supported by reliable evidence. A classification can change with the product category."],
  ["grey", "Not enough information. The ingredient is not in our reviewed dataset, or the dataset does not cover it for this product type."],
];

export default function AboutPage() {
  const info = datasetInfo();
  return (
    <div className="page prose-like">
      <h1 className="text-4xl font-bold">About and methodology</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-soft">
        ChemCheck helps people understand what is in everyday products. It is built to be honest about what it does not know.
      </p>

      <section className="mt-10" aria-labelledby="flow">
        <h2 id="flow" className="text-2xl font-bold">How an analysis works</h2>
        <ol className="mt-4 max-w-3xl list-decimal space-y-3 pl-6 text-ink-soft">
          <li><strong className="text-ink">Identification.</strong> Ingredient names come from your typed list, a photo read by OCR in your browser, or a barcode database. You confirm or edit the list before analysis.</li>
          <li><strong className="text-ink">Verification.</strong> Each name is matched against a reviewed dataset by name, alternative names and food additive numbers. If there is no match, the ingredient is grey. Nothing is guessed.</li>
          <li><strong className="text-ink">Assessment.</strong> The classification, concerns and precautions come from the matched dataset entry, which links to its sources. The product category can change the result, for example salt in food versus salt in a cleaner.</li>
          <li><strong className="text-ink">Explanation.</strong> An AI model is optional and only writes a plain-language summary of facts already in the report. It never decides a classification.</li>
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="classes">
        <h2 id="classes" className="text-2xl font-bold">What the colours mean</h2>
        <ul className="mt-4 max-w-3xl space-y-3">
          {DEFS.map(([key, text]) => (
            <li key={key} className={"rounded-2xl p-4 " + STATUS[key].chip}>
              <span className="font-bold">{STATUS[key].label}. </span>{text}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="score">
        <h2 id="score" className="text-2xl font-bold">Why there is no score out of 100</h2>
        <p className="mt-3 max-w-3xl text-ink-soft">
          A single number would look scientific, but no validated method turns an ingredient list without concentrations into a health-risk number. Instead the report shows an overall level, the counts for each colour, and how many ingredients could not be assessed. The level is decided by simple rules: any red ingredient gives &quot;Needs attention&quot;, otherwise any yellow gives &quot;Some cautions&quot;, otherwise the level is low only if at least half of the ingredients could be assessed.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="dataset">
        <h2 id="dataset" className="text-2xl font-bold">The ingredient dataset</h2>
        <p className="mt-3 max-w-3xl text-ink-soft">
          Version {info.version}, written on {info.writtenOn}, with {info.entries} reviewed ingredients. It is a starter set for a college project, not a complete database. Each entry links to the publisher or database where its claims can be checked. Links open the publisher&apos;s database or topic page, so search for the ingredient there to confirm the details. Publication dates are not stored. To grow the dataset, add entries to data/ingredients.json following the existing format, and only add facts you have checked in a source.
        </p>
        <h3 className="mt-6 text-lg font-bold">Source publishers used</h3>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {info.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">{s.publisher}: {s.title}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="india">
        <h2 id="india" className="text-2xl font-bold">Products sold in India</h2>
        <p className="mt-3 max-w-3xl text-ink-soft">
          Food products are regulated by FSSAI, and cosmetics by CDSCO under the Drugs and Cosmetics Act, 1940 and the Cosmetics Rules, 2020. ChemCheck shows this context on every report but does not check a product against Indian limits. When a restriction is noted for the EU or the US, the entry says that Indian status was not verified.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="limits">
        <h2 id="limits" className="text-2xl font-bold">Limitations</h2>
        <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-ink-soft">
          <li>Ingredient presence alone does not establish the actual risk of a product.</li>
          <li>Concentrations are usually not on the label, and risk often depends on them.</li>
          <li>OCR can make mistakes, and barcode databases are community-contributed.</li>
          <li>ChemCheck cannot say a product is completely safe or completely harmful.</li>
          <li>It gives general information and does not diagnose conditions or replace professional advice.</li>
        </ul>
      </section>
    </div>
  );
}
