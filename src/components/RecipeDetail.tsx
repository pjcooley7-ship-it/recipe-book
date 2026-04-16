import { useState } from 'react'
import { toast } from 'sonner'
import type { Recipe } from '../lib/types'
import { useDeleteRecipe } from '../hooks/useRecipes'

interface Props {
  recipe: Recipe
  onDeleted: () => void
}

export function RecipeDetail({ recipe, onDeleted }: Props) {
  const [metric, setMetric] = useState(false)
  const { mutate: deleteRecipe, isPending: deleting } = useDeleteRecipe()

  function handleDelete() {
    if (!confirm(`Delete "${recipe.title}"?`)) return
    deleteRecipe(recipe.id, {
      onSuccess: () => {
        toast.success('Recipe deleted.')
        onDeleted()
      },
      onError: () => toast.error('Could not delete recipe.'),
    })
  }

  const hasConversions = recipe.ingredients.some((i) => i.display_metric != null)

  return (
    <article className="py-14 px-16 max-w-2xl">
      {/* Header */}
      <header className="mb-10">
        {recipe.source_name && (
          <p className="text-[11px] text-muted uppercase tracking-widest mb-3">
            {recipe.source_name}
            {recipe.source_url && (
              <> &middot; <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{new URL(recipe.source_url).hostname.replace('www.', '')}</a></>
            )}
          </p>
        )}
        <h2 className="font-serif text-4xl leading-tight text-ink mb-6">{recipe.title}</h2>

        {(recipe.prep_time || recipe.cook_time || recipe.servings) && (
          <div className="flex gap-8 py-5 border-t border-b border-border">
            {recipe.prep_time && (
              <div>
                <span className="block text-[10px] text-muted uppercase tracking-widest mb-1">Prep</span>
                <span className="text-sm font-medium">{recipe.prep_time}</span>
              </div>
            )}
            {recipe.cook_time && (
              <div>
                <span className="block text-[10px] text-muted uppercase tracking-widest mb-1">Cook</span>
                <span className="text-sm font-medium">{recipe.cook_time}</span>
              </div>
            )}
            {recipe.servings && (
              <div>
                <span className="block text-[10px] text-muted uppercase tracking-widest mb-1">Serves</span>
                <span className="text-sm font-medium">{recipe.servings}</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Conversion toggle */}
      {hasConversions && (
        <div className="flex items-center gap-3 mb-8">
          <span className={`text-xs ${!metric ? 'text-ink font-medium' : 'text-muted'}`}>US</span>
          <button
            onClick={() => setMetric((m) => !m)}
            aria-label="Toggle unit system"
            className="relative w-10 h-5 rounded-full transition-colors border-0 cursor-pointer focus:outline-none"
            style={{ background: metric ? '#1a1a1a' : '#d1d5db' }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: metric ? '20px' : '2px' }}
            />
          </button>
          <span className={`text-xs ${metric ? 'text-ink font-medium' : 'text-muted'}`}>Metric</span>
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="mb-12">
          <h3 className="font-serif text-xl text-ink mb-5">Ingredients</h3>
          <ul className="divide-y divide-subtle">
            {recipe.ingredients.map((ing, i) => {
              const qty = metric && ing.display_metric ? ing.display_metric : ing.display_us
              const alt = metric ? ing.display_us : ing.display_metric
              return (
                <li key={i} className="flex justify-between items-baseline py-2.5 text-sm">
                  <span className="text-ink">{ing.name}</span>
                  <span className="text-right ml-6 flex-shrink-0">
                    <span className="text-muted">{qty}</span>
                    {alt && alt !== qty && (
                      <span className="text-[11px] text-gray-300 italic ml-1.5">/ {alt}</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Instructions */}
      {recipe.instructions.length > 0 && (
        <section className="mb-12">
          <h3 className="font-serif text-xl text-ink mb-5">Instructions</h3>
          <ol className="space-y-7" style={{ counterReset: 'step' }}>
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-6" style={{ counterIncrement: 'step' }}>
                <span className="font-serif text-3xl text-border leading-tight flex-shrink-0 w-7 text-right">
                  {i + 1}
                </span>
                <p className="text-sm leading-7 text-gray-600 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Delete */}
      <div className="border-t border-subtle pt-8">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-muted hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer p-0 disabled:opacity-40"
        >
          {deleting ? 'Deleting…' : 'Delete recipe'}
        </button>
      </div>
    </article>
  )
}
