// Default options for each category/subcategory
// You can expand this as needed for more granularity


// Subcategory-specific defaults override category defaults
export const CATEGORY_DEFAULTS: Record<string, {
  base?: string;
  milk?: string;
  syrup?: string;
  size?: string;
  temperature?: string;
}> = {
  // Categories
  Coffee: {
    base: "Coffee",
    milk: "Whole Milk",
    syrup: "Vanilla",
    size: "Grande",
    temperature: "Hot",
  },
  Tea: {
    base: "Tea",
    milk: "2% Milk",
    syrup: "Classic",
    size: "Grande",
    temperature: "Hot",
  },
  Refreshers: {
    base: "Refresher",
    milk: "Coconut Milk",
    syrup: "Liquid Cane Sugar",
    size: "Grande",
    temperature: "Iced",
  },
  Frappuccino: {
    base: "Frappuccino",
    milk: "Whole Milk",
    syrup: "Mocha",
    size: "Grande",
    temperature: "Blended",
  },
  "Hot Chocolate": {
    base: "Hot Chocolate",
    milk: "Whole Milk",
    syrup: "Mocha",
    size: "Grande",
    temperature: "Hot",
  },
  // Subcategories
  "Hot Coffee": {
    base: "Coffee",
    milk: "Whole Milk",
    syrup: "Vanilla",
    size: "Grande",
    temperature: "Hot",
  },
  "Cold Coffee": {
    base: "Coffee",
    milk: "Whole Milk",
    syrup: "Classic",
    size: "Grande",
    temperature: "Iced",
  },
  Espresso: {
    base: "Coffee",
    milk: "None",
    syrup: "None",
    size: "Short",
    temperature: "Hot",
  },
  "Brewed Coffee": {
    base: "Coffee",
    milk: "None",
    syrup: "None",
    size: "Grande",
    temperature: "Hot",
  },
  "Hot Tea": {
    base: "Tea",
    milk: "2% Milk",
    syrup: "Classic",
    size: "Grande",
    temperature: "Hot",
  },
  Chai: {
    base: "Tea",
    milk: "Whole Milk",
    syrup: "Chai",
    size: "Grande",
    temperature: "Hot",
  },
  "Green Tea": {
    base: "Tea",
    milk: "None",
    syrup: "None",
    size: "Grande",
    temperature: "Hot",
  },
  Iced: {
    base: "Refresher",
    milk: "Coconut Milk",
    syrup: "Liquid Cane Sugar",
    size: "Grande",
    temperature: "Iced",
  },
  "Coffee Frappuccino": {
    base: "Frappuccino",
    milk: "Whole Milk",
    syrup: "Mocha",
    size: "Grande",
    temperature: "Blended",
  },
  "Creme Frappuccino": {
    base: "Frappuccino",
    milk: "Whole Milk",
    syrup: "Vanilla",
    size: "Grande",
    temperature: "Blended",
  },
  Classic: {
    base: "Hot Chocolate",
    milk: "Whole Milk",
    syrup: "Mocha",
    size: "Grande",
    temperature: "Hot",
  },
  "Blended Protein": {
    base: "Protein",
    milk: "Oat Milk",
    syrup: "None",
    size: "Grande",
    temperature: "Blended",
  },
}

export function getDefaultsForCategory(categoryOrSubcategory: string) {
  return CATEGORY_DEFAULTS[categoryOrSubcategory] || CATEGORY_DEFAULTS[categoryOrSubcategory.replace(/ Frappuccino$/,"")] || {}
}
