export const metadata = { title: "Privacy Policy - ChemCheck" };

const ITEMS = [
  ["What we collect", "ChemCheck does not ask for your name, email or any account. You only provide ingredient text, optional product details, and optionally a photo or barcode."],
  ["Photos you upload", "Photos are read by text recognition inside your own browser. The image is not sent to our server and is not stored. The first time you use the label reader, your browser downloads the recognition engine and English language data from a public content delivery network. We ask for your consent before reading any image."],
  ["Ingredient text", "The text you confirm is sent to this app's server so it can be analysed against the ingredient dataset. The server does not store it."],
  ["Barcode lookups", "If you look up a barcode, the number is sent to this app's server, which asks the open product databases Open Food Facts, Open Beauty Facts and Open Products Facts for that product. The number is not stored by this app."],
  ["AI summaries", "AI summaries are optional and off by default. If you tick the option, the ingredient names and report facts (never your image) are sent to the AI provider configured by the site owner, to write the summary."],
  ["Saved history", "Finished reports are saved only in your browser's local storage on your device. They are not on a server. You can delete one report, or all history, from the Analysis History page, or by clearing your browser data."],
  ["Cookies and tracking", "This app sets no tracking cookies and includes no analytics."],
  ["Not medical advice", "ChemCheck gives general information about ingredients. It does not diagnose medical conditions or replace advice from a doctor, pharmacist or other professional. Ingredient presence alone does not establish the actual risk of a product, and no result guarantees that a product is completely safe or harmful."],
  ["Changes for a real product", "If this project is turned into a public service, this policy must be reviewed and updated to match the hosting, logging and data practices that are actually used."],
];

export default function PrivacyPage() {
  return (
    <div className="page">
      <h1 className="text-4xl font-bold">Privacy policy</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-soft">What happens to the information you give ChemCheck, in plain language.</p>
      <div className="mt-8 max-w-3xl space-y-6">
        {ITEMS.map(([title, text]) => (
          <section key={title}>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-1 text-ink-soft">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
