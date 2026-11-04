const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.argenfood.unlu.edu.ar/Tablas/Grupo/';
const files = [
  "Carnes.xls", "CarnesAG.xls", "Carnes y derivados.xls", "Cereales.xls", "Cereales y derivados.xls",
  "Frutas.xls", "Frutas y derivados.xls", "Grasas.xls", "Grasas y aceites.xls",
  "Huevo.xls", "Huevos y derivados.xls", "Leche.xls", "Leche y derivados.xls",
  "Misc.xls", "Pescados.xls", "PescadosAG.xls", "ProdAz.xls", "Trans.xls", "Trans1.xls", "Vegetales.xls"
];

async function download() {
  for (const f of files) {
    try {
      const response = await axios.get(baseUrl + encodeURIComponent(f), { responseType: 'arraybuffer' });
      fs.writeFileSync(path.join(__dirname, f), response.data);
      console.log(`Downloaded ${f}`);
    } catch (e) {
      console.log(`Error downloading ${f}: ${e.message}`);
    }
  }
}

download();
