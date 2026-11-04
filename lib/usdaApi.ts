import translate from 'translate';

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Configurar motor de traducción
translate.engine = 'google';

export interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: any[];
}

export async function searchUSDA(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    // 1. Traducir búsqueda solo si contiene caracteres no-ASCII o es español común
    let translatedQuery = query;
    try {
      translatedQuery = await translate(query, { from: 'es', to: 'en' });
    } catch (e) {
      console.warn('USDA Query translation failed, using original:', query);
    }
    
    // 2. Query optimizada: Solo alimentos de base (SR Legacy, Survey, Foundation) para evitar "cualquier cosa"
    const url = `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(translatedQuery)}&pageSize=8&dataType=Foundation,SR Legacy,Survey (FNDDS)`;
    
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const foods = data.foods || [];

    // 3. Procesamiento en paralelo con traducción condicional
    const processedFoods = await Promise.all(foods.map(async (f: any) => {
      const getNutrient = (id: number) => {
        const nut = f.foodNutrients?.find((n: any) => n.nutrientId === id);
        return nut ? nut.value : 0;
      };

      // Solo traducir si la descripción es larga o compleja, de lo contrario usar original
      let nombreEsp = f.description;
      if (f.description.length > 3) {
        try {
          nombreEsp = await translate(f.description, { from: 'en', to: 'es' });
        } catch (e) {
          console.warn('Item translation failed:', f.description);
        }
      }

      return {
        idExterno: f.fdcId.toString(),
        nombre: nombreEsp.charAt(0).toUpperCase() + nombreEsp.slice(1).toLowerCase(),
        calorias: getNutrient(1008),
        proteinas: getNutrient(1003),
        carbohidratos: getNutrient(1005),
        grasas: getNutrient(1004),
        origen: 'USDA' as const
      };
    }));

    return processedFoods;
  } catch (error) {
    console.error('Error searching USDA:', error);
    return [];
  }
}
