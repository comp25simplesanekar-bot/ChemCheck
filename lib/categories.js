export const CATEGORIES = [
  { id: "skincare", label: "Skincare products", domain: "cosmetic" },
  { id: "cosmetics", label: "Cosmetics and makeup", domain: "cosmetic" },
  { id: "haircare", label: "Shampoos and hair-care products", domain: "cosmetic" },
  { id: "soap", label: "Soaps and body-care products", domain: "cosmetic" },
  { id: "food", label: "Food and beverages", domain: "food" },
  { id: "cleaning", label: "Household cleaning products", domain: "household" },
  { id: "hygiene", label: "Personal hygiene products", domain: "cosmetic" },
];

export const DOMAIN_LABELS = {
  cosmetic: "cosmetic and personal-care products",
  food: "food and beverages",
  household: "household cleaning products",
};

export const REGIONAL_NOTES = {
  cosmetic:
    "In India, cosmetics are regulated by the Central Drugs Standard Control Organisation (CDSCO) under the Drugs and Cosmetics Act, 1940 and the Cosmetics Rules, 2020, and must follow applicable Bureau of Indian Standards requirements. This tool does not check a product against those rules. Where a restriction is mentioned for an ingredient, it is stated for the region named and Indian status is marked as not verified.",
  food:
    "In India, food additives and labelling are regulated by the Food Safety and Standards Authority of India (FSSAI) under the Food Safety and Standards Act, 2006 and its regulations. This tool does not check a product against FSSAI limits for a specific food type. Where an ingredient has a regional restriction, Indian status is marked as not verified unless stated.",
  household:
    "Household cleaning products are not covered by FSSAI or the CDSCO cosmetics rules. No ingredient-level Indian regulation was checked for this category, so the label and safety instructions on the product remain the main guide.",
};

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
