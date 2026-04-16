interface Props {
  onNewRecipe: () => void
}

export function EmptyState({ onNewRecipe }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center py-32 px-16">
      <div className="text-center max-w-sm">
        <p className="font-serif italic text-4xl text-gray-200 mb-6">No recipe selected</p>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Paste a URL above to import a recipe, or create one manually.
        </p>
        <button onClick={onNewRecipe} className="btn-primary">
          + New Recipe
        </button>
      </div>
    </div>
  )
}
