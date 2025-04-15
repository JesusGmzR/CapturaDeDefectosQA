const { createApp } = Vue;

createApp({
  data() {
    return {
      nuevoDefecto: {
        fecha: new Date().toISOString().substr(0, 10),
        linea: '',
        codigo: '',
        defecto: '',
        otroDefecto: '',
        ubicacion: '',
        area: '',
        modelo: ''
      },
      defectosHoy: [],
      lineas: ['M1', 'M2', 'M3', 'M4', 'DP1', 'DP2', 'DP3', 'Harness'],
      defectosComunes: [
        'Rayado', 'Golpe', 'Falta de pintura', 
        'Deformación', 'Suciedad', 'Mal ensamblaje'
      ],
      areas: ['SMD', 'IMD', 'Ensamble', 'Mantenimiento', 'Micom'],
      filtros: {
        fechaInicio: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().substr(0, 10),
        fechaFin: new Date().toISOString().substr(0, 10),
        linea: '',
        codigo: '',
        defecto: '',
        ubicacion: '',
        area: ''
      },
      resultadosConsulta: [],
      estadisticas: {
        visible: false,
        total: 0,
        defectosComunes: {}
      },
      mensajeModal: {
        titulo: '',
        mensaje: '',
        tipo: 'exito'
      }
    }
  },
  mounted() {
    this.actualizarFecha();
    setInterval(this.actualizarFecha, 60000);
    this.cargarDefectosHoy();
  },
  methods: {
    actualizarFecha() {
      const ahora = new Date();
      document.getElementById('fecha-actual').textContent = 
        `Actualizado: ${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
    },
    formatFecha(fechaStr) {
      if (!fechaStr) return '';
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-ES');
    },
    async buscarModelo() {
      try {
        if (!this.nuevoDefecto.codigo || this.nuevoDefecto.codigo.length < 9) {
          this.nuevoDefecto.modelo = '';
          return;
        }
        
        const response = await axios.get('/api/modelo', {
          params: { codigo: this.nuevoDefecto.codigo.substring(0, 9) }
        });
        
        this.nuevoDefecto.modelo = response.data.modelo || '';
      } catch (error) {
        console.error('Error al buscar modelo:', error);
        this.nuevoDefecto.modelo = '';
      }
    },
    async cargarDefectosHoy() {
      try {
        const hoy = new Date().toISOString().substr(0, 10);
        const response = await axios.get('/api/defectos', { params: { fecha: hoy } });
        this.defectosHoy = response.data;
      } catch (error) {
        this.mostrarMensaje('Error', 'No se pudieron cargar los defectos de hoy', 'error');
        console.error('Error al cargar defectos:', error);
      }
    },
    // Reemplaza tu función de guardar con esto:
async function guardarDatos() {
    const modelo = document.getElementById('modelo').value;
    const parte = document.getElementById('parte').value;
    const defecto = document.getElementById('defecto').value;
    const cantidad = document.getElementById('cantidad').value;
    const inspector = document.getElementById('inspector').value;

    try {
        const response = await fetch('http://localhost:3001/api/guardar-defecto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                modelo,
                parte,
                defecto,
                cantidad,
                inspector
            }),
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Defecto registrado correctamente');
            // Limpiar formulario
            document.getElementById('defectosForm').reset();
        } else {
            alert('Error al guardar: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// Asignar la nueva función al botón
document.getElementById('guardarBtn').addEventListener('click', guardarDatos);

        // Enviar al servidor
        const response = await axios.post('/api/defectos', defectoData);
        
        if (response.data.success) {
          this.mostrarMensaje('Éxito', 'Defecto registrado correctamente', 'exito');
          this.cargarDefectosHoy();
          this.limpiarFormulario();
        }
      } catch (error) {
        this.mostrarError(error);
      }
    },
    validarCampos() {
      const camposRequeridos = [
        { campo: 'linea', mensaje: 'La línea es requerida' },
        { campo: 'codigo', mensaje: 'El código es requerido' },
        { campo: 'defecto', mensaje: 'El defecto es requerido' },
        { campo: 'ubicacion', mensaje: 'La ubicación es requerida' },
        { campo: 'area', mensaje: 'El área es requerida' }
      ];

      for (const { campo, mensaje } of camposRequeridos) {
        if (!this.nuevoDefecto[campo]) {
          this.mostrarMensaje('Validación', mensaje, 'error');
          return false;
        }
      }

      if (this.nuevoDefecto.defecto === 'OTRO' && !this.nuevoDefecto.otroDefecto.trim()) {
        this.mostrarMensaje('Validación', 'Debe especificar el defecto', 'error');
        return false;
      }

      return true;
    },
    limpiarFormulario() {
      this.nuevoDefecto.linea = '';
      this.nuevoDefecto.codigo = '';
      this.nuevoDefecto.defecto = '';
      this.nuevoDefecto.otroDefecto = '';
      this.nuevoDefecto.ubicacion = '';
      this.nuevoDefecto.area = '';
      this.nuevoDefecto.modelo = '';
      
      // Enfocar el primer campo
      document.getElementById('linea').focus();
    },
    async buscarDefectos() {
      try {
        // Validar fechas
        if (new Date(this.filtros.fechaInicio) > new Date(this.filtros.fechaFin)) {
          this.mostrarMensaje('Validación', 'La fecha de inicio no puede ser mayor a la fecha fin', 'error');
          return;
        }

        // Realizar búsqueda
        const response = await axios.get('/api/defectos', { params: this.filtros });
        this.resultadosConsulta = response.data;
        
        // Calcular estadísticas
        this.calcularEstadisticas(response.data);
      } catch (error) {
        this.mostrarError(error);
      }
    },
    calcularEstadisticas(defectos) {
      this.estadisticas.total = defectos.length;
      
      // Contar defectos comunes
      const conteoDefectos = {};
      defectos.forEach(d => {
        conteoDefectos[d.defecto] = (conteoDefectos[d.defecto] || 0) + 1;
      });
      
      // Ordenar y tomar los 3 más comunes
      const defectosOrdenados = Object.entries(conteoDefectos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .reduce((obj, [key, val]) => {
          obj[key] = val;
          return obj;
        }, {});
      
      this.estadisticas.defectosComunes = defectosOrdenados;
      this.estadisticas.visible = defectos.length > 0;
    },
    exportarExcel() {
      if (this.resultadosConsulta.length === 0) {
        this.mostrarMensaje('Advertencia', 'No hay datos para exportar', 'error');
        return;
      }
      
      // Crear CSV
      let csv = 'Fecha,Línea,Código,Defecto,Ubicación,Área,Modelo\n';
      this.resultadosConsulta.forEach(d => {
        csv += `${this.formatFecha(d.fecha)},${d.linea},${d.codigo},"${d.defecto.replace(/"/g, '""')}",${d.ubicacion},${d.area},${d.modelo}\n`;
      });
      
      // Descargar archivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `defectos_${new Date().toISOString().substr(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    mostrarMensaje(titulo, mensaje, tipo = 'exito') {
      this.mensajeModal.titulo = titulo;
      this.mensajeModal.mensaje = mensaje;
      this.mensajeModal.tipo = tipo;
      
      const modal = new bootstrap.Modal(document.getElementById('mensajeModal'));
      modal.show();
    },
    mostrarError(error) {
      let mensaje = 'Error al procesar la solicitud';
      if (error.response) {
        mensaje = error.response.data.error || 
                 error.response.data.message || 
                 `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        mensaje = 'No se recibió respuesta del servidor';
      } else {
        mensaje = error.message;
      }
      
      this.mostrarMensaje('Error', mensaje, 'error');
      console.error('Error completo:', error);
    }
  }
}).mount('#app');
