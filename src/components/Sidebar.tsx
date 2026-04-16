import type { Recipe } from '../lib/types'

interface Props {
  recipes: Recipe[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNewRecipe: () => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ recipes, selectedId, onSelect, onNewRecipe, isOpen, onClose }: Props) {
  return (
    <aside
      className={`
        fixed md:sticky top-0 left-0 z-30 h-screen
        w-72 md:w-64 flex-shrink-0 bg-white border-r border-border
        flex flex-col overflow-y-auto
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-1 text-muted hover:text-ink bg-transparent border-0 cursor-pointer text-xl leading-none"
        aria-label="Close menu"
      >
        &times;
      </button>

      <div className="px-6 pt-8 pb-6">
        <h1 className="font-serif text-xl tracking-tight text-ink mb-1">My Recipes</h1>
        <p className="text-[11px] text-muted uppercase tracking-widest">Personal Collection</p>
      </div>

      <div className="px-6 mb-6">
        <button
          onClick={onNewRecipe}
          className="w-full bg-ink text-white text-sm font-sans py-2.5 px-4 hover:bg-gray-800 transition-colors text-left"
        >
          + New Recipe
        </button>
      </div>

      <div className="px-6 flex-1">
        <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Saved</p>
        {recipes.length === 0 ? (
          <p className="text-sm text-muted italic">No recipes yet.</p>
        ) : (
          <ul>
            {recipes.map((r) => (
              <li key={r.id} className="border-b border-subtle last:border-b-0">
                <button
                  onClick={() => onSelect(r.id)}
                  className={`w-full text-left py-3 text-sm transition-colors ${
                    selectedId === r.id ? 'text-ink font-medium' : 'text-gray-500 hover:text-ink'
                  }`}
                >
                  <span className="block leading-snug">{r.title}</span>
                  {r.source_name && (
                    <span className="block text-[11px] text-muted mt-0.5">{r.source_name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
