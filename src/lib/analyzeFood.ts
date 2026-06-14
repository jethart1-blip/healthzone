import type { NutritionInfo } from '../types'

export interface AnalyzeFoodResult {
  name: string
  nutrition: NutritionInfo
}

export async function analyzeFood(
  photoDataUrl?: string,
  description?: string
): Promise<AnalyzeFoodResult> {
  const res = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoDataUrl, description }),
  })

  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.status}`)
  }

  return res.json()
}
