import type { NutritionInfo } from '../types'

export interface AnalyzeFoodResult {
  name: string
  nutrition: NutritionInfo
}

export async function analyzeFood(
  photoDataUrl?: string,
  description?: string
): Promise<AnalyzeFoodResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoDataUrl, description }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch {
    const name = description?.trim() || 'Unknown Food';
    return {
      name,
      nutrition: {
        calories: 300,
        protein: 15,
        carbs: 30,
        fat: 12,
        fiber: 3,
        sugar: 5,
        sodium: 400,
        saturatedFat: 3,
        cholesterol: 30,
      },
    };
  }
}
