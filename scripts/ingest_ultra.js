const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const scriptsDir = __dirname;
const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.xls'));

function cleanNumber(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(',', '.').replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

let allResults = [];
let seenNames = new Set();

files.forEach(f => {
  const filePath = path.join(scriptsDir, f);
  try {
    const workbook = xlsx.readFile(filePath);
    workbook.SheetNames.forEach(sheetName => {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      data.forEach(row => {
        if (!row || row.length < 3) return;
        
        // El nombre suele estar entre col 0 y 2
        let nombre = "";
        let nIdx = -1;
        for(let i=0; i<3; i++) {
           if (typeof row[i] === 'string' && row[i].trim().length > 4 && isNaN(parseFloat(row[i]))) {
              nombre = row[i].trim();
              nIdx = i;
              break;
           }
        }
        
        if (!nombre || nombre.toLowerCase().includes('tabla') || nombre.toLowerCase().includes('grupo')) return;

        // Buscamos algo que parezca Kcal (un número > 0 en las siguientes 10 columnas)
        let kcal = 0;
        let p = 0, g = 0, c = 0;
        
        // Encontramos el primer bloque de números
        let nums = [];
        for(let j=nIdx+1; j<row.length; j++){
           let val = cleanNumber(row[j]);
           if (val >= 0) nums.push({ val, idx: j });
        }
        
        // Heurística de emergencia:
        // Argenfoods suele tener Kj, Kcal, Agua, Prot, Grasa, Carbo
        // Si hay una pareja donde uno es 4.18 veces el otro, el menor es Kcal.
        for(let i=0; i<nums.length-1; i++) {
           if(nums[i].val > nums[i+1].val * 3 && nums[i+1].val > 5) {
              kcal = nums[i+1].val;
              // Prot, Fat, Carb suelen estar un poco más adelante (saltando Agua)
              // Intentamos mapear por posición relativa a kcal
              // Típico: kcal(i+1), agua(i+2), prot(i+3), grasa(i+4), carbo(i+5)
              p = cleanNumber(row[nums[i+1].idx + 2]);
              g = cleanNumber(row[nums[i+1].idx + 3]);
              c = cleanNumber(row[nums[i+1].idx + 4]);
              break;
           }
        }
        
        if (kcal > 0 && !seenNames.has(nombre.toLowerCase())) {
          seenNames.add(nombre.toLowerCase());
          allResults.push({
            nombre,
            calorias: Math.round(kcal),
            proteinas: p || 0,
            grasas: g || 0,
            carbohidratos: c || 0,
            origen: 'ARGENFOODS',
            categoria: f.split('.')[0]
          });
        }
      });
    });
    console.log(`${f}: ok`);
  } catch (e) {
    console.log(`${f}: error ${e.message}`);
  }
});

fs.writeFileSync(path.join(__dirname, '../data/argenfoods_full.json'), JSON.stringify(allResults, null, 2));
console.log(`TOTAL UNICO: ${allResults.length}`);
