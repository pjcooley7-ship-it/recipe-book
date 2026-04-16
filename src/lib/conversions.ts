// Unit conversion helpers used on the frontend display layer.
// The edge function pre-computes display_us / display_metric for imported recipes.
// For manual recipes, these helpers can generate display_metric from parsed input.

const VOLUME_TO_ML: Record<string, number> = {
  tsp: 4.93,
  teaspoon: 4.93,
  teaspoons: 4.93,
  tbsp: 14.79,
  tablespoon: 14.79,
  tablespoons: 14.79,
  'fl oz': 29.57,
  'fluid ounce': 29.57,
  'fluid ounces': 29.57,
  cup: 240,
  cups: 240,
  pt: 473,
  pint: 473,
  pints: 473,
  qt: 946,
  quart: 946,
  quarts: 946,
  gal: 3785,
  gallon: 3785,
  gallons: 3785,
}

const WEIGHT_TO_G: Record<string, number> = {
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.59,
  lbs: 453.59,
  pound: 453.59,
  pounds: 453.59,
}

function round(n: number, decimals = 1): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals
}

function formatMetricVolume(ml: number): string {
  if (ml >= 1000) return `${round(ml / 1000)} L`
  if (ml < 5) return `${round(ml)} ml`
  return `${Math.round(ml)} ml`
}

function formatMetricWeight(g: number): string {
  if (g >= 1000) return `${round(g / 1000)} kg`
  return `${Math.round(g)} g`
}

export function convertToMetric(amount: number, unit: string): string | null {
  const u = unit.toLowerCase().trim()

  if (u === '°f' || u === 'f') {
    const c = Math.round(((amount - 32) * 5) / 9)
    return `${c}°C`
  }

  const mlFactor = VOLUME_TO_ML[u]
  if (mlFactor != null) return formatMetricVolume(amount * mlFactor)

  const gFactor = WEIGHT_TO_G[u]
  if (gFactor != null) return formatMetricWeight(amount * gFactor)

  return null
}

// Parse a simple quantity string like "2 tbsp", "1½ cups", "3.5 oz"
// Returns { amount, unit } or null if unrecognised
export function parseQuantity(str: string): { amount: number; unit: string } | null {
  // Handle vulgar fractions: ½ ⅓ ¼ ¾ ⅔ ⅛ ⅜ ⅝ ⅞
  const vulgar: Record<string, number> = {
    '½': 0.5, '⅓': 0.333, '¼': 0.25, '¾': 0.75,
    '⅔': 0.667, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  }
  let normalised = str
  for (const [frac, val] of Object.entries(vulgar)) {
    normalised = normalised.replace(frac, ` ${val}`)
  }
  // "1 0.5 cups" → "1.5 cups" for cases like "1½ cups"
  normalised = normalised.replace(/(\d+)\s+(0\.\d+)/, (_, whole, frac) =>
    String(Number(whole) + Number(frac))
  )

  const match = normalised.match(/^([\d./]+)\s*(.+)$/)
  if (!match) return null
  const amount = eval(match[1]) // handles "1/3" style fractions safely
  const unit = match[2].trim()
  return { amount, unit }
}
