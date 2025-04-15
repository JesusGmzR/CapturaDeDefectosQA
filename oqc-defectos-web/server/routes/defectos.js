const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

const DEFECTOS_FILE = "\\\\192.168.1.230\\qa\\B_LG\\2025년_2025 ano\\06. OQC\\REPORTE PARTES NG\\CapturaWebTool.xlsx";

// Helper para manejar el archivo Excel
async function getWorkbook() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(DEFECTOS_FILE);
  } catch (error) {
    // Si el archivo no existe, crear uno nuevo
    workbook.addWorksheet('Defectos');
    await workbook.xlsx.writeFile(DEFECTOS_FILE);
  }
  return workbook;
}

// Registrar nuevo defecto
router.post('/', async (req, res) => {
  try {
    const { fecha, linea, codigo, defecto, ubicacion, area, modelo } = req.body;
    
    const workbook = await getWorkbook();
    const worksheet = workbook.getWorksheet('Defectos') || workbook.addWorksheet('Defectos');
    
    // Agregar encabezados si es la primera fila
    if (worksheet.rowCount === 0) {
      worksheet.addRow(['Fecha', 'Línea', 'Código', 'Defecto', 'Ubicación', 'Área', 'Modelo']);
    }
    
    worksheet.addRow([fecha, linea, codigo, defecto, ubicacion, area, modelo]);
    await workbook.xlsx.writeFile(DEFECTOS_FILE);
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error al guardar defecto:', error);
    res.status(500).json({ error: 'Error al guardar el defecto', details: error.message });
  }
});

// Consultar defectos
router.get('/', async (req, res) => {
  try {
    const { fecha, fechaInicio, fechaFin, linea, codigo, defecto, ubicacion, area } = req.query;
    
    const workbook = await getWorkbook();
    const worksheet = workbook.getWorksheet('Defectos');
    
    if (!worksheet || worksheet.rowCount <= 1) {
      return res.json([]);
    }
    
    const defectos = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Saltar encabezados
        const [fechaRow, lineaRow, codigoRow, defectoRow, ubicacionRow, areaRow, modeloRow] = row.values;
        
        // Aplicar filtros
        const matchesFilters = (
          (!fecha || fechaRow === fecha) &&
          (!fechaInicio || !fechaFin || (fechaRow >= fechaInicio && fechaRow <= fechaFin)) &&
          (!linea || lineaRow === linea) &&
          (!codigo || codigoRow.includes(codigo)) &&
          (!defecto || defectoRow.includes(defecto)) &&
          (!ubicacion || ubicacionRow.includes(ubicacion)) &&
          (!area || areaRow === area);
        
        if (matchesFilters) {
          defectos.push({
            fecha: fechaRow,
            linea: lineaRow,
            codigo: codigoRow,
            defecto: defectoRow,
            ubicacion: ubicacionRow,
            area: areaRow,
            modelo: modeloRow
          });
        }
      }
    });
    
    res.json(defectos);
  } catch (error) {
    console.error('Error al consultar defectos:', error);
    res.status(500).json({ error: 'Error al consultar defectos', details: error.message });
  }
});

module.exports = router;