require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración básica
app.use(cors());
app.use(bodyParser.json());

// Ruta para guardar defectos
app.post('/api/guardar-defecto', (req, res) => {
    try {
        const { modelo, parte, defecto, cantidad, inspector } = req.body;
        
        // Ruta al archivo Excel (ajusta según tu entorno)
        const excelPath = process.env.EXCEL_PATH || '\\\\192.168.1.230\\qa\\B_LG\\2025년_2025 ano\\06. OQC\\REPORTE PARTES NG\\CapturaWebTool.xlsx';
        
        // Leer archivo existente o crear uno nuevo
        let workbook;
        if (fs.existsSync(excelPath)) {
            workbook = XLSX.readFile(excelPath);
        } else {
            workbook = XLSX.utils.book_new();
        }

        // Obtener la primera hoja o crear una
        let worksheet;
        const sheetName = workbook.SheetNames.length > 0 ? workbook.SheetNames[0] : 'Defectos';
        
        if (workbook.Sheets[sheetName]) {
            worksheet = workbook.Sheets[sheetName];
        } else {
            worksheet = XLSX.utils.aoa_to_sheet([
                ['Fecha', 'Modelo', 'Parte', 'Defecto', 'Cantidad', 'Inspector']
            ]);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }

        // Agregar nueva fila
        const newRow = [
            new Date().toLocaleString(),
            modelo,
            parte,
            defecto,
            cantidad,
            inspector
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

        // Guardar cambios
        XLSX.writeFile(workbook, excelPath);
        
        res.status(200).json({ success: true, message: 'Defecto registrado correctamente' });
    } catch (error) {
        console.error('Error al guardar defecto:', error);
        res.status(500).json({ success: false, message: 'Error al guardar el defecto' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});