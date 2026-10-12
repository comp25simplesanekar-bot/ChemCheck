import dataset from "@/data/ingredients.json";
import { normalize, parseIngredientList } from "@/lib/parseIngredients";
import { getCategory, REGIONAL_NOTES } from "@/lib/categories";

const index = new Map();
dataset.ingredients.forEach((entry) => {
  const names = [entry.name, ...entry.aliases];
  names.forEach((name) => {
    const key = normalize(name);
    if (key && !index.has(key)) {
      index.set(key, entry);
    }
  });
});

const LEVEL_LABELS = {
  attention: "Needs attention",
  caution: "Some cautions",
  low: "Low concern among assessed ingredients",
  limited: "Limited information",
  insufficient: "Not enough information",
};

function findEntry(item) {
  for (const candidate of item.candidates) {
    const key = normalize(candidate);
    if (index.has(key)) {
      return index.get(key);
    }
  }
  return null;
}

function buildSources(entry) {
  return entry.sources
    .map((key) => dataset.sources[key])
    .filter(Boolean)
    .map((s) => ({ publisher: s.publisher, title: s.title, url: s.url }));
}

function assessItem(item, category) {
  const entry = findEntry(item);

  if (!entry) {
    return {
      input: item.raw,
      status: "unmatched",
      classification: "grey",
      name: item.raw,
      why: "This ingredient is not in the reviewed ingredient dataset, so it could not be assessed. Absence from the dataset does not mean it is harmful or safe.",
    };
  }

  if (!entry.appliesTo.includes(category.domain)) {
    return {
      input: item.raw,
      status: "not_applicable",
      classification: "grey",
      name: entry.name,
      why: "The dataset covers " + entry.name + " only for " + entry.appliesTo.join(" and ") + " products, so its use in this product category was not assessed.",
    };
  }

  const classification =
    (entry.classByCategory && entry.classByCategory[category.id]) || entry.classification;

  return {
    input: item.raw,
    status: "matched",
    id: entry.id,
    name: entry.name,
    classification,
    function: entry.function,
    why: entry.why,
    health: entry.health,
    irritation: entry.irritation,
    allergy: entry.allergy,
    dependsOn: entry.dependsOn,
    evidence: entry.evidence,
    precautions: entry.precautions,
    groups: entry.groups,
    regulation: entry.regulation,
    sources: buildSources(entry),
  };
}

function unique(list) {
  return Array.from(new Set(list.filter(Boolean)));
}

export function analyzeIngredients({ ingredients, categoryId, productName, brand, source }) {
  const category = getCategory(categoryId);
  if (!category) {
    throw new Error("Unknown category.");
  }

  const parsed = parseIngredientList(ingredients);
  const items = parsed.map((item) => assessItem(item, category));

  const counts = { total: items.length, green: 0, yellow: 0, red: 0, grey: 0 };
  items.forEach((i) => {
    counts[i.classification] += 1;
  });

  const assessed = counts.green + counts.yellow + counts.red;
  const coverage = counts.total === 0 ? 0 : assessed / counts.total;

  let level = "insufficient";
  if (counts.red > 0) level = "attention";
  else if (counts.yellow > 0) level = "caution";
  else if (assessed === 0) level = "insufficient";
  else if (coverage < 0.5) level = "limited";
  else level = "low";

  const flagged = items.filter((i) => i.classification === "red" || i.classification === "yellow");
  const keyFindings = flagged
    .sort((a, b) => (a.classification === "red" ? -1 : 1) - (b.classification === "red" ? -1 : 1))
    .slice(0, 6)
    .map((i) => ({ name: i.name, classification: i.classification, text: i.why }));

  const precautions = unique(flagged.map((i) => i.precautions)).slice(0, 8);
  const groups = unique(flagged.flatMap((i) => i.groups || []));
  const unassessed = items.filter((i) => i.classification === "grey").map((i) => i.input);

  const missingInfo = [
    "The label does not state how much of each ingredient is present, and risk often depends on concentration.",
    "Ingredient presence alone does not establish the actual risk of the finished product.",
  ];
  if (unassessed.length > 0) {
    missingInfo.push(
      unassessed.length + " of " + counts.total + " ingredients could not be assessed: " + unassessed.join(", ") + "."
    );
  }

  return {
    id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    productName: productName || "",
    brand: brand || "",
    category: { id: category.id, label: category.label, domain: category.domain },
    source: source || "manual",
    counts,
    assessed,
    level,
    levelLabel: LEVEL_LABELS[level],
    items,
    keyFindings,
    precautions,
    groups,
    missingInfo,
    regionalNote: REGIONAL_NOTES[category.domain],
    dataset: { version: dataset.datasetVersion, entries: dataset.ingredients.length },
    ai: { status: "not_requested" },
  };
}

export function datasetInfo() {
  return {
    version: dataset.datasetVersion,
    writtenOn: dataset.writtenOn,
    entries: dataset.ingredients.length,
    sources: Object.values(dataset.sources),
  };
}
