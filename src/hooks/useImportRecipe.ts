import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Recipe } from '../lib/types'

export function useImportRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (url: string): Promise<Recipe> => {
      const { data, error } = await supabase.functions.invoke('parse-recipe', {
        body: { url },
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      return data as Recipe
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}
