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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: recipes = [], isLoading: loadingList } = useRecipes()
  const { data: selectedRecipe, isLoading: loadingRecipe } = useRecipe(selectedId)

  function handleSelect(id: string) {
    setSelectedId(id)
    setSidebarOpen(false) // close drawer on mobile after selecting
  }

  function handleCreated(id: string) {
    setSelectedId(id)
    setShowCreate(false)
    setSidebarOpen(false)
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />

      <div className="flex min-h-screen bg-paper">
        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border flex items-center px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-ink bg-transparent border-0 cursor-pointer"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect y="3" width="20" height="1.5" fill="currentColor"/>
              <rect y="9.25" width="20" height="1.5" fill="currentColor"/>
              <rect y="15.5" width="20" height="1.5" fill="currentColor"/>
            </svg>
          </button>
          <span className="flex-1 text-center font-serif text-base text-ink">My Recipes</span>
          <button
            onClick={() => setShowCreate(true)}
            className="p-2 -mr-2 text-ink bg-transparent border-0 cursor-pointer text-xl leading-none"
            aria-label="New recipe"
          >
            +
          </button>
        </div>

        {/* Sidebar — drawer on mobile, sticky on desktop */}
        <Sidebar
          recipes={recipes}
          selectedId={selectedId}
          onSelect={handleSelect}
          onNewRecipe={() => { setShowCreate(true); setSidebarOpen(false) }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-20 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 pt-14 md:pt-0">
          <div className="pt-8 md:pt-14 px-5 md:px-16 max-w-2xl">
            <UrlImport onImported={handleSelect} />
          </div>

          {loadingList ? (
            <div className="px-5 md:px-16 text-sm text-muted">Loading…</div>
          ) : loadingRecipe && selectedId ? (
            <div className="px-5 md:px-16 text-sm text-muted">Loading recipe…</div>
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
