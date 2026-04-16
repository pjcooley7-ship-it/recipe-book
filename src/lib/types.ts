export interface Ingredient {
  name: string
  display_us: string
  display_metric: string | null
}

export interface Recipe {
  id: string
  title: string
  source_url: string | null
  source_name: string | null
  prep_time: string | null
  cook_time: string | null
  servings: string | null
  ingredients: Ingredient[]
  instructions: string[]
  created_at: string
}

export type RecipeInsert = Omit<Recipe, 'id' | 'created_at'>
