import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateRecipe } from '../hooks/useRecipes'
import { convertToMetric, parseQuantity } from '../lib/conversions'
import type { Ingredient } from '../lib/types'

interface Props {
  onCreated: (id: string) => void
  onClose: () => void
}

function parseIngredientLine(line: string): Ingredient {
  // Try to split "3 tbsp unsalted butter" → qty + name
  const match = line.match(/^([\d½⅓¼¾⅔⅛⅜⅝⅞./\s]+(?:tsp|tbsp|cup|cups|oz|lb|lbs|ml|g|kg|fl\s?oz|teaspoon[s]?|tablespoon[s]?|pound[s]?|ounce[s]?))\s+(.+)$/i)
  if (match) {
    const qtyStr = match[1].trim()
    const name = match[2].trim()
    const parsed = parseQuantity(qtyStr)
    if (parsed) {
      const metric = convertToMetric(parsed.amount, parsed.unit)
      return { name, display_us: qtyStr, display_metric: metric }
    }
  }
  // No recognisable quantity — just store as name with no unit
  return { name: line.trim(), display_us: '', display_metric: null }
}

export function CreateRecipeModal({ onCreated, onClose }: Props) {
  const { mutate, isPending } = useCreateRecipe()
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [ingredientsText, setIngredientsText] = useState('')
  const [instructionsText, setInstructionsText] = useState('')

  function handleSubmit() {
    if (!title.trim()) { toast.error('Title is required.'); return }
    if (!ingredientsText.trim()) { toast.error('Add at least one ingredient.'); return }
    if (!instructionsText.trim()) { toast.error('Add at least one instruction step.'); return }

    const ingredients: Ingredient[] = ingredientsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map(parseIngredientLine)

    const instructions = instructionsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    mutate(
      {
        title: title.trim(),
        source_url: sourceUrl.trim() || null,
        source_name: sourceName.trim() || null,
        prep_time: prepTime.trim() || null,
        cook_time: cookTime.trim() || null,
        servings: servings.trim() || null,
        ingredients,
        instructions,
      },
      {
        onSuccess: (recipe) => {
          toast.success(`"${recipe.title}" saved.`)
          onCreated(recipe.id)
        },
        onError: () => toast.error('Could not save recipe.'),
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Title bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <h2 className="font-serif text-xl text-ink">New Recipe</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-lg leading-none bg-transparent border-0 cursor-pointer p-0">&times;</button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <Field label="Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Banana Bread" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Source Name">
              <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="e.g. Grandma's recipe" className={inputCls} />
            </Field>
            <Field label="Source URL">
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Prep Time">
              <input value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15 min" className={inputCls} />
            </Field>
            <Field label="Cook Time">
              <input value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="1 hr" className={inputCls} />
            </Field>
            <Field label="Serves">
              <input value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" className={inputCls} />
            </Field>
          </div>

          <Field label="Ingredients *" hint="One per line. Include amount and unit first, e.g. &quot;3 tbsp butter&quot;">
            <textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={7}
              placeholder={"3 tbsp unsalted butter\n1 cup all-purpose flour\n2 large eggs"}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Instructions *" hint="One step per line">
            <textarea
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              rows={7}
              placeholder={"Preheat oven to 350°F.\nMix dry ingredients in a bowl.\nFold in wet ingredients until just combined."}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-border">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSubmit} disabled={isPending} className="btn-primary disabled:opacity-40">
            {isPending ? 'Saving…' : 'Save Recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-border text-sm font-sans px-3 py-2 outline-none focus:border-gray-400 placeholder-gray-300 text-ink bg-white'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-muted uppercase tracking-widest mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1.5" dangerouslySetInnerHTML={{ __html: hint }} />}
      {children}
    </div>
  )
}
