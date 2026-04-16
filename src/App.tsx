import { useState } from 'react'
import { Toaster } from 'sonner'
import { Sidebar } from './components/Sidebar'
import { UrlImport } from './components/UrlImport'
import { RecipeDetail } from './components/RecipeDetail'
import { CreateRecipeModal } from './components/CreateRecipeModal'
import { EmptyState } from './components/EmptyState'
import { useRecipes, useRecipe } from './hooks/useRecipes'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: recipes = [], isLoading: loadingList } = useRecipes()
  const { data: selectedRecipe, isLoading: loadingRecipe } = useRecipe(selectedId)

  function handleCreated(id: string) {
    setSelectedId(id)
    setShowCreate(false)
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />

      <div className="flex min-h-screen bg-paper">
        <Sidebar
          recipes={recipes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNewRecipe={() => setShowCreate(true)}
        />

        <main className="flex-1 min-w-0">
          <div className="pt-14 px-16 max-w-2xl">
            <UrlImport onImported={setSelectedId} />
          </div>

          {loadingList ? (
            <div className="px-16 text-sm text-muted">Loading…</div>
          ) : loadingRecipe && selectedId ? (
            <div className="px-16 text-sm text-muted">Loading recipe…</div>
          ) : selectedRecipe ? (
            <RecipeDetail
              recipe={selectedRecipe}
              onDeleted={() => setSelectedId(null)}
            />
          ) : (
            <EmptyState onNewRecipe={() => setShowCreate(true)} />
          )}
        </main>
      </div>

      {showCreate && (
        <CreateRecipeModal
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  )
}
