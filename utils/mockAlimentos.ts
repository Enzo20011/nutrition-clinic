export interface AlimentoMock {
  id: string;
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export const mockAlimentos: AlimentoMock[] = [
  { id: '1', nombre: 'Pechuga de Pollo', calorias: 165, proteinas: 31, carbohidratos: 0, grasas: 3.6 },
  { id: '2', nombre: 'Arroz Blanco Cocido', calorias: 130, proteinas: 2.7, carbohidratos: 28, grasas: 0.3 },
  { id: '3', nombre: 'Huevo Entero', calorias: 155, proteinas: 13, carbohidratos: 1.1, grasas: 11 },
  { id: '4', nombre: 'Avena en Hojuelas', calorias: 389, proteinas: 16.9, carbohidratos: 66, grasas: 6.9 },
  { id: '5', nombre: 'Manzana Roja', calorias: 52, proteinas: 0.3, carbohidratos: 14, grasas: 0.2 },
  { id: '6', nombre: 'Palta (Aguacate)', calorias: 160, proteinas: 2, carbohidratos: 8.5, grasas: 15 },
  { id: '7', nombre: 'Lentejas Cocidas', calorias: 116, proteinas: 9, carbohidratos: 20, grasas: 0.4 },
  { id: '8', nombre: 'Yogur Griego Natural', calorias: 59, proteinas: 10, carbohidratos: 3.6, grasas: 0.4 },
  { id: '9', nombre: 'Nueces', calorias: 654, proteinas: 15, carbohidratos: 14, grasas: 65 },
  { id: '10', nombre: 'Salmón a la Plancha', calorias: 208, proteinas: 20, carbohidratos: 0, grasas: 13 },
];
