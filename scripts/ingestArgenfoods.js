const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const SCRIPTS_DIR = __dirname;
const DATA_FILE = path.join(__dirname, '../data/argenfoods.json');

const files = [
  "Carnes.xls", "CarnesAG.xls", "Carnes y derivados.xls", "Cereales.xls", "Cereales y derivados.xls",
  "Frutas.xls", "Frutas y derivados.xls", "Grasas.xls", "Grasas y aceites.xls",
  "Huevo.xls", "Huevos y derivados.xls", "Leche.xls", "Leche y derivados.xls",
  "Misc.xls", "Pescados.xls", "PescadosAG.xls", "ProdAz.xls", "Trans.xls", "Trans1.xls", "Vegetales.xls"
];

function cleanNumber(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function processFile(filename) {
  const filePath = path.join(SCRIPTS_DIR, filename);
  if (!fs.existsSync(filePath)) return [];

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let results = [];
  
  data.forEach((row, i) => {
    if (!row || row.length < 5) return;

    let nombre = "";
    let startIndex = -1;
    
    if (typeof row[0] === 'string' && row[0].length > 5 && isNaN(parseFloat(row[0]))) {
        nombre = row[0];
        startIndex = 0;
    } else if (typeof row[1] === 'string' && row[1].length > 5 && isNaN(parseFloat(row[1]))) {
        nombre = row[1];
        startIndex = 1;
    }

    if (!nombre || nombre.toLowerCase().includes('tabla') || nombre.toLowerCase().includes('grupo')) return;

    // Intentar patron A: [Name, Sci, kJ, kcal, Water, Prot, Fat, Carb] (startIndex 0 o 1)
    // kcal está en index + 3 (si start 0) o index + 3 (si start 1?)
    
    let kcal = 0, prot = 0, fat = 0, carb = 0;

    // Estrategia: Buscar la "Kcal" (valor entre 5 y 900) y que los siguientes sean Prot, Fat, Carb
    // En Argenfoods el orden suele ser: Agua, Proteina, Grasa, Carbo o Proteina, Grasa, Agua, Carbo
    
    // Probamos el patrón más común detectado en Carnes/Cereales:
    // [Name, Sci, kJ, kcal, Water/Prot...]
    
    let kIndex = -1;
    for(let j = startIndex + 1; j < startIndex + 6; j++) {
       let val = cleanNumber(row[j]);
       if (val > 10 && val < 950) {
          // Si j-1 era mayor (kJ), j es kcal.
          if (cleanNumber(row[j-1]) > val * 3) {
             kIndex = j;
             break;
          }
       }
    }

    if (kIndex !== -1) {
       kcal = cleanNumber(row[kIndex]);
       // Dependiendo de la tabla, Prot/Fat/Carb están en los siguientes 3-5 lugares
       // Usamos heurística: Prot suele estar después de kcal o agua.
       // En la mayoría de UNLU: kcal(kIndex), Agua(kIndex+1), Prot(kIndex+2), Fat(kIndex+3), Carb(kIndex+4)
       prot = cleanNumber(row[kIndex + 2]);
       fat = cleanNumber(row[kIndex + 3]);
       carb = cleanNumber(row[kIndex + 4]);
       
       // Si prot/fat/carb salieron todos 0, probamos kIndex + 1...
       if (prot === 0 && fat === 0 && carb === 0) {
          prot = cleanNumber(row[kIndex + 1]);
          fat = cleanNumber(row[kIndex + 2]);
          carb = cleanNumber(row[kIndex + 3]);
       }
    } else {
       // Fallback simple si no detectamos kIndex
       return;
    }

    if (kcal === 0) return;

    results.push({
      nombre: nombre.trim(),
      calorias: Math.round(kcal),
      proteinas: prot,
      grasas: fat,
      carbohidratos: carb,
      origen: 'LOCAL',
      categoria: filename.split('.')[0]
    });
  });

  return results;
}

let allAlimentos = [];
files.forEach(f => {
  try {
    const data = processFile(f);
    allAlimentos = allAlimentos.concat(data);
    console.log(`✅ ${f}: ${data.length} alimentos.`);
  } catch (e) {
    console.warn(`⚠️ Error procesando ${f}: ${e.message}`);
  }
});

const uniqueResults = [];
const seen = new Set();
allAlimentos.forEach(item => {
  const key = item.nombre.toLowerCase();
  if (!seen.has(key)) {
    seen.add(key);
    uniqueResults.push(item);
  }
});

fs.writeFileSync(DATA_FILE, JSON.stringify(uniqueResults, null, 2));
console.log(`\n🚀 Ingesta finalizada. ${uniqueResults.length} alimentos guardados.`);
