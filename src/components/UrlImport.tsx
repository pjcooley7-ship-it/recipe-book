import { useState } from 'react'
import { toast } from 'sonner'
import { useImportRecipe } from '../hooks/useImportRecipe'

interface Props {
  onImported: (id: string) => void
}

export function UrlImport({ onImported }: Props) {
  const [url, setUrl] = useState('')
  const { mutate, isPending } = useImportRecipe()

  function handleImport() {
    const trimmed = url.trim()
    if (!trimmed) return
    try {
      new URL(trimmed)
    } catch {
      toast.error('Please enter a valid URL.')
      return
    }
    mutate(trimmed, {
      onSuccess: (recipe) => {
        toast.success(`"${recipe.title}" imported.`)
        setUrl('')
        onImported(recipe.id)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Import failed.')
      },
    })
  }

  return (
    <div className="flex items-end border-b-2 border-ink mb-14">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleImport()}
        placeholder="Paste a recipe URL to import..."
        disabled={isPending}
        className="flex-1 border-0 bg-transparent font-sans text-sm py-3 outline-none placeholder-gray-300 text-ink disabled:opacity-50"
      />
      <button
        onClick={handleImport}
        disabled={isPending || !url.trim()}
        className="bg-transparent border-0 text-sm font-sans font-medium text-ink py-3 pl-4 hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {isPending ? 'Importing…' : 'Import'}
      </button>
    </div>
  )
}
