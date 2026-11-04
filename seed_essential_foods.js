const mongoose = require('mongoose');

// Mock dbConnect and Alimento if needed, or just use the logic
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutripro';

const alimentoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  calorias: { type: Number, required: true },
  proteinas: { type: Number, required: true },
  carbohidratos: { type: Number, required: true },
  grasas: { type: Number, required: true },
  origen: { type: String, default: 'LOCAL' },
  categoria: { type: String, default: 'General' }
});

const Alimento = mongoose.models.Alimento || mongoose.model('Alimento', alimentoSchema);

const foods = [
  { nombre: 'Vacío de Ternera (Crudo)', calorias: 190, proteinas: 21, carbohidratos: 0, grasas: 12, origen: 'LOCAL', categoria: 'Proteínas' },
  { nombre: 'Bife de Chorizo (Crudo)', calorias: 220, proteinas: 20, carbohidratos: 0, grasas: 15, origen: 'LOCAL', categoria: 'Proteínas' },
  { nombre: 'Matambre Vacuno (Crudo)', calorias: 250, proteinas: 18, carbohidratos: 0, grasas: 20, origen: 'LOCAL', categoria: 'Proteínas' },
  { nombre: 'Milanesa de Nalga (Cruda)', calorias: 160, proteinas: 20, carbohidratos: 5, grasas: 6, origen: 'LOCAL', categoria: 'Proteínas' },
  { nombre: 'Pechuga de Pollo (Cruda)', calorias: 110, proteinas: 23, carbohidratos: 0, grasas: 2, origen: 'LOCAL', categoria: 'Proteínas' },
  { nombre: 'Arroz Integral Gaby', calorias: 350, proteinas: 8, carbohidratos: 75, grasas: 2, origen: 'LOCAL', categoria: 'Carbohidratos' },
  { nombre: 'Fideos de sémola Lucchetti', calorias: 360, proteinas: 12, carbohidratos: 74, grasas: 1.5, origen: 'LOCAL', categoria: 'Carbohidratos' },
  { nombre: 'Pan de Molde Integral Bimbo', calorias: 240, proteinas: 9, carbohidratos: 45, grasas: 3, origen: 'LOCAL', categoria: 'Carbohidratos' },
  { nombre: 'Yogur Ser Desnatado', calorias: 45, proteinas: 4, carbohidratos: 6, grasas: 0.1, origen: 'LOCAL', categoria: 'Lácteos' },
  { nombre: 'Queso Casancrem Light', calorias: 115, proteinas: 8, carbohidratos: 5, grasas: 7, origen: 'LOCAL', categoria: 'Lácteos' },
  { nombre: 'Palta / Aguacate Haas', calorias: 160, proteinas: 2, carbohidratos: 9, grasas: 14, origen: 'LOCAL', categoria: 'Grasas' },
  { nombre: 'Aceite de Oliva Extra Virgen', calorias: 884, proteinas: 0, carbohidratos: 0, grasas: 100, origen: 'LOCAL', categoria: 'Grasas' },
];

async function seed() {
  try {
    console.log('--- SEEDING LOCAL FOODS ---');
    await mongoose.connect(MONGO_URI);
    for (const food of foods) {
      await Alimento.findOneAndUpdate(
        { nombre: food.nombre },
        food,
        { upsert: true, new: true }
      );
      console.log(`Updated/Created: ${food.nombre}`);
    }
    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
