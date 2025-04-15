const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

const MODELOS_FILE = "\\\\192.168.1.230\\qa\\B_LG\\WebTools\\standar\\NoPart_Model.xlsx";

router.get('/', async (req, res) => {
  try {
    const { codigo } = req.query;
    
    if (!codigo || codigo.length < 9) {
      return res.json({ modelo: '' });
    }
    
    const codigoBusqueda = codigo.substring(0, 9);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(MODELOS_FILE);
    const worksheet = workbook.getWorksheet(3); // Hoja 3
    
    let modelo = '';
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const [codigoRef, modeloRef] = row.values;
      if (codigoRef === codigoBusqueda) {
        modelo = modeloRef;
        return false; // Detener iteración
      }
    });
    
    res.json({ modelo });
  } catch (error) {
    console.error('Error al buscar modelo:', error);
    res.status(500).json({ error: 'Error al buscar modelo', details: error.message });
  }
});

module.exports = router;