const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://127.0.0.1:27017/nutripro';

const AlimentoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, index: true },
  categoria: { type: String, required: true },
  kcal: { type: Number, required: true },
  proteinas: { type: Number, required: true },
  grasas: { type: Number, required: true },
  carbohidratos: { type: Number, required: true },
  porcionBaseGramos: { type: Number, default: 100 },
});

const Alimento = mongoose.models.Alimento || mongoose.model('Alimento', AlimentoSchema);

const foods = [
  { nombre: 'Pechuga de Pollo (Cocida)', categoria: 'Proteínas', kcal: 165, proteinas: 31, grasas: 3.6, carbohidratos: 0, porcionBaseGramos: 100 },
  { nombre: 'Carne Vacuna Magra', categoria: 'Proteínas', kcal: 250, proteinas: 26, grasas: 15, carbohidratos: 0, porcionBaseGramos: 100 },
  { nombre: 'Huevo Entero (Unidad)', categoria: 'Proteínas', kcal: 70, proteinas: 6, grasas: 5, carbohidratos: 0.5, porcionBaseGramos: 50 },
  { nombre: 'Arroz Blanco Cocido', categoria: 'Carbohidratos', kcal: 130, proteinas: 2.7, grasas: 0.3, carbohidratos: 28, porcionBaseGramos: 100 },
  { nombre: 'Papa Hervida', categoria: 'Carbohidratos', kcal: 77, proteinas: 2, grasas: 0.1, carbohidratos: 17, porcionBaseGramos: 100 },
  { nombre: 'Avena en Hojuelas', categoria: 'Carbohidratos', kcal: 389, proteinas: 16.9, grasas: 6.9, carbohidratos: 66, porcionBaseGramos: 100 },
  { nombre: 'Palta (Aguacate)', categoria: 'Grasas', kcal: 160, proteinas: 2, grasas: 15, carbohidratos: 8.5, porcionBaseGramos: 100 },
  { nombre: 'Aceite de Oliva', categoria: 'Grasas', kcal: 884, proteinas: 0, grasas: 100, carbohidratos: 0, porcionBaseGramos: 100 },
  { nombre: 'Nueces', categoria: 'Grasas', kcal: 654, proteinas: 15, grasas: 65, carbohidratos: 14, porcionBaseGramos: 100 },
  { nombre: 'Banana (Unidad)', categoria: 'Frutas', kcal: 89, proteinas: 1.1, grasas: 0.3, carbohidratos: 23, porcionBaseGramos: 100 },
  { nombre: 'Manzana (Unidad)', categoria: 'Frutas', kcal: 52, proteinas: 0.3, grasas: 0.2, carbohidratos: 14, porcionBaseGramos: 100 },
  { nombre: 'Brócoli Hervido', categoria: 'Verduras', kcal: 34, proteinas: 2.8, grasas: 0.4, carbohidratos: 7, porcionBaseGramos: 100 },
  { nombre: 'Leche Descremada', categoria: 'Lácteos', kcal: 34, proteinas: 3.4, grasas: 0.1, carbohidratos: 5, porcionBaseGramos: 100 },
  { nombre: 'Yogur Natural', categoria: 'Lácteos', kcal: 59, proteinas: 3.5, grasas: 3.3, carbohidratos: 4.7, porcionBaseGramos: 100 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Conectado a MongoDB para seed...');
    
    // Eliminar previos para no duplicar si es necesario, o solo insertar los que faltan
    // await Alimento.deleteMany({}); 
    
    for (const food of foods) {
      await Alimento.findOneAndUpdate(
        { nombre: food.nombre },
        food,
        { upsert: true, new: true }
      );
    }
    
    console.log('✅ Base de alimentos poblada con éxito.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
}

seed();
