import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Unit conversion tables ────────────────────────────────────────────────────

const VOLUME_TO_ML: Record<string, number> = {
  tsp: 4.93, teaspoon: 4.93, teaspoons: 4.93,
  tbsp: 14.79, tablespoon: 14.79, tablespoons: 14.79,
  'fl oz': 29.57, 'fluid ounce': 29.57, 'fluid ounces': 29.57,
  cup: 240, cups: 240,
  pint: 473, pints: 473, pt: 473,
  quart: 946, quarts: 946, qt: 946,
  gallon: 3785, gallons: 3785, gal: 3785,
}

const WEIGHT_TO_G: Record<string, number> = {
  oz: 28.35, ounce: 28.35, ounces: 28.35,
  lb: 453.59, lbs: 453.59, pound: 453.59, pounds: 453.59,
}

function round(n: number, d = 1) { return Math.round(n * 10 ** d) / 10 ** d }

function metricVolume(ml: number): string {
  if (ml >= 1000) return `${round(ml / 1000)} L`
  if (ml < 5) return `${round(ml, 2)} ml`
  return `${Math.round(ml)} ml`
}

function metricWeight(g: number): string {
  if (g >= 1000) return `${round(g / 1000)} kg`
  return `${Math.round(g)} g`
}

/** Convert vulgar fractions then evaluate the expression */
function parseAmount(raw: string): number | null {
  const vulgar: Record<string, string> = {
    '½': '0.5', '⅓': '0.333', '¼': '0.25', '¾': '0.75',
    '⅔': '0.667', '⅛': '0.125', '⅜': '0.375', '⅝': '0.625', '⅞': '0.875',
  }
  let s = raw.trim()
  for (const [f, v] of Object.entries(vulgar)) s = s.replace(f, v)
  // handle "1 1/2" → 1.5
  s = s.replace(/(\d+)\s+(\d+)\/(\d+)/, (_, w, n, d) => String(Number(w) + Number(n) / Number(d)))
  // handle "1/2"
  s = s.replace(/(\d+)\/(\d+)/, (_, n, d) => String(Number(n) / Number(d)))
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

interface Ingredient {
  name: string
  display_us: string
  display_metric: string | null
}

/**
 * Try to extract a quantity+unit from the front of an ingredient string.
 * Returns { name, display_us, display_metric }.
 */
function parseIngredient(raw: string): Ingredient {
  // Match: optional number (including fractions/vulgar), optional unit word, then the rest
  const unitPattern = [
    'tablespoons?', 'teaspoons?', 'tbsp', 'tsp',
    'fl\\.?\\s?oz', 'fluid ounces?',
    'cups?', 'pints?', 'pt', 'quarts?', 'qt', 'gallons?', 'gal',
    'pounds?', 'lbs?', 'ounces?', '\\boz\\b',
    'grams?', '\\bg\\b', 'kilograms?', 'kg', 'ml', 'milliliters?', 'liters?', '\\bL\\b',
  ].join('|')

  const qtyUnitRe = new RegExp(
    `^([½⅓¼¾⅔⅛⅜⅝⅞\\d ./]+)\\s*(${unitPattern})\\s+(.+)$`,
    'i'
  )
  const qtyOnlyRe = /^([½⅓¼¾⅔⅛⅜⅝⅞\d ./]+)\s+(.+)$/

  let m = raw.match(qtyUnitRe)
  if (m) {
    const amtStr = m[1].trim()
    const unit = m[2].trim().toLowerCase().replace(/\.$/, '')
    const name = m[3].trim()
    const amt = parseAmount(amtStr)
    const display_us = `${amtStr} ${m[2].trim()}`

    let display_metric: string | null = null
    if (amt != null) {
      if (unit === '°f' || unit === 'f') {
        display_metric = `${Math.round(((amt - 32) * 5) / 9)}°C`
      } else {
        const mlFactor = VOLUME_TO_ML[unit]
        if (mlFactor) display_metric = metricVolume(amt * mlFactor)
        else {
          const gFactor = WEIGHT_TO_G[unit]
          if (gFactor) display_metric = metricWeight(amt * gFactor)
        }
      }
    }
    return { name, display_us, display_metric }
  }

  // Has a leading number but no recognised unit — still split off quantity
  m = raw.match(qtyOnlyRe)
  if (m) {
    const amtStr = m[1].trim()
    const name = m[2].trim()
    return { name, display_us: amtStr, display_metric: null }
  }

  // No quantity at all
  return { name: raw.trim(), display_us: '', display_metric: null }
}

// ── ISO 8601 duration parser ──────────────────────────────────────────────────

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return iso
  const h = parseInt(m[1] ?? '0')
  const min = parseInt(m[2] ?? '0')
  const parts: string[] = []
  if (h) parts.push(`${h}h`)
  if (min) parts.push(`${min} min`)
  return parts.join(' ') || iso
}

// ── schema.org/Recipe parser ──────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
function extractFromSchema(schema: any) {
  const name: string = schema.name ?? ''
  const rawIngredients: string[] = schema.recipeIngredient ?? []
  const rawInstructions = schema.recipeInstructions ?? []

  // instructions can be a string, string[], or HowToStep[]
  const instructions: string[] = []
  if (typeof rawInstructions === 'string') {
    instructions.push(...rawInstructions.split(/\n+/).map((s: string) => s.trim()).filter(Boolean))
  } else if (Array.isArray(rawInstructions)) {
    for (const step of rawInstructions) {
      if (typeof step === 'string') instructions.push(step.trim())
      else if (step.text) instructions.push(step.text.trim())
      else if (step.name) instructions.push(step.name.trim())
    }
  }

  const prepTime = schema.prepTime ? parseDuration(schema.prepTime) : null
  const cookTime = schema.cookTime ? parseDuration(schema.cookTime) : null
  const servings: string | null =
    schema.recipeYield
      ? Array.isArray(schema.recipeYield)
        ? String(schema.recipeYield[0])
        : String(schema.recipeYield)
      : null

  const ingredients = rawIngredients.map(parseIngredient)

  return { name, ingredients, instructions, prepTime, cookTime, servings }
}

// ── HTML fallback: find any ld+json block with @type: Recipe ─────────────────

function findRecipeSchema(html: string) {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const json = JSON.parse(m[1])
      const candidates = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json]
      for (const c of candidates) {
        if (c['@type'] === 'Recipe' || (Array.isArray(c['@type']) && c['@type'].includes('Recipe'))) {
          return c
        }
      }
    } catch { /* skip malformed */ }
  }
  return null
}

// ── HTML fallback: heuristic scraping ────────────────────────────────────────

function scrapeHeuristic(html: string, hostname: string) {
  // Strip tags helper
  const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  // Try to grab the page <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const name = titleMatch ? strip(titleMatch[1]).replace(/\s*[|\-–—].*$/, '').trim() : hostname

  // Ingredients: look for common class names
  const ingRe = /class="[^"]*(?:ingredient)[^"]*"[^>]*>([^<]+)/gi
  const rawIngs: string[] = []
  let im: RegExpExecArray | null
  while ((im = ingRe.exec(html)) !== null) rawIngs.push(strip(im[1]))

  // Instructions: look for common class names
  const instRe = /class="[^"]*(?:instruction|direction|step)[^"]*"[^>]*>([\s\S]*?)<\/(?:li|p|div)/gi
  const rawInsts: string[] = []
  let sm: RegExpExecArray | null
  while ((sm = instRe.exec(html)) !== null) {
    const text = strip(sm[1])
    if (text.length > 10) rawInsts.push(text)
  }

  if (rawIngs.length === 0 && rawInsts.length === 0) {
    return null // can't extract anything useful
  }

  return {
    name,
    ingredients: rawIngs.map(parseIngredient),
    instructions: rawInsts,
    prepTime: null,
    cookTime: null,
    servings: null,
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, '')

    // Fetch the page
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Could not fetch page (${res.status})` }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const html = await res.text()

    // 1. Try schema.org JSON-LD
    const schema = findRecipeSchema(html)
    let extracted = schema ? extractFromSchema(schema) : null

    // 2. Fall back to heuristic scraping
    if (!extracted || extracted.ingredients.length === 0) {
      extracted = scrapeHeuristic(html, hostname)
    }

    if (!extracted) {
      return new Response(JSON.stringify({ error: 'Could not find recipe content on that page.' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Save to DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title: extracted.name || hostname,
        source_url: url,
        source_name: hostname,
        prep_time: extracted.prepTime,
        cook_time: extracted.cookTime,
        servings: extracted.servings,
        ingredients: extracted.ingredients,
        instructions: extracted.instructions,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
