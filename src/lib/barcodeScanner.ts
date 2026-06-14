export interface BarcodeNutritionResult {
  name: string;
  brand?: string;
  servingSize?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    saturatedFat?: number;
  };
}

export async function lookupBarcode(barcode: string): Promise<BarcodeNutritionResult | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments ?? {};

    return {
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: p.brands,
      servingSize: p.serving_size,
      nutrition: {
        calories: Math.round(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0),
        protein: Math.round((n['proteins_serving'] || n['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((n['carbohydrates_serving'] || n['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((n['fat_serving'] || n['fat_100g'] || 0) * 10) / 10,
        fiber: n['fiber_serving'] || n['fiber_100g'] ? Math.round((n['fiber_serving'] || n['fiber_100g']) * 10) / 10 : undefined,
        sugar: n['sugars_serving'] || n['sugars_100g'] ? Math.round((n['sugars_serving'] || n['sugars_100g']) * 10) / 10 : undefined,
        sodium: n['sodium_serving'] || n['sodium_100g'] ? Math.round((n['sodium_serving'] || n['sodium_100g']) * 1000 * 10) / 10 : undefined,
        saturatedFat: n['saturated-fat_serving'] || n['saturated-fat_100g'] ? Math.round((n['saturated-fat_serving'] || n['saturated-fat_100g']) * 10) / 10 : undefined,
      },
    };
  } catch {
    return null;
  }
}
