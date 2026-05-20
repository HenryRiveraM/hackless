const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

/**
 * Generar CSV desde array de objetos
 * @param {Array} data - Array con datos a exportar
 * @returns {string} - CSV formateado
 */
function generarCSV(data) {
  if (!data || data.length === 0) {
    return 'Código,Título,Categoría,Severidad,Fecha Resolución,Administrador,Método Resolución,Criticidad Reducida\n';
  }

  try {
    const fields = [
      { label: 'Código', value: 'codigoIncidencia' },
      { label: 'Título', value: 'titulo' },
      { label: 'Categoría', value: 'categoria' },
      { label: 'Severidad', value: 'severidad' },
      { label: 'Fecha Resolución', value: 'fechaResolucion' },
      { label: 'Administrador', value: 'administradorResponsable' },
      { label: 'Método Resolución', value: 'metodoResolucion' },
      { label: 'Criticidad Reducida', value: 'criticidadReducida' }
    ];

    const opts = { fields };
    const parser = new Parser(opts);
    return parser.parse(data);
  } catch (error) {
    console.error('[CSV] Error generando CSV:', error);
    throw new Error('Error al generar CSV: ' + error.message);
  }
}

/**
 * Generar PDF desde array de objetos
 * @param {Array} data - Array con datos a exportar
 * @param {Object} res - Response object para enviar el PDF
 */
function generarPDF(data, res) {
  try {
    const doc = new PDFDocument({ margin: 40 });

    // Pipe a la respuesta HTTP
    doc.pipe(res);

    // Título principal
    doc.fontSize(20).text('Hackless', { align: 'center' });
    doc.fontSize(16).text('Historial de Alertas Resueltas', { align: 'center' });
    doc.moveDown();

    // Subtítulo y fecha
    doc.fontSize(10).text('Reporte exportado desde el panel administrativo', { align: 'center' });
    doc.fontSize(10).text(`Fecha de exportación: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Separador
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Si no hay datos
    if (!data || data.length === 0) {
      doc.fontSize(12).text('No existen alertas resueltas para exportar.');
      doc.end();
      return;
    }

    // Listar cada incidencia
    data.forEach((item, index) => {
      // Evitar overflow de página
      if (doc.y > 700) {
        doc.addPage();
      }

      // Número y código - Título
      doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${item.codigoIncidencia}`, { underline: false });
      doc.fontSize(11).font('Helvetica').text(item.titulo || '-', { width: 470 });
      doc.moveDown(0.3);

      // Detalles
      doc.fontSize(10).text(`Categoría: ${item.categoria || '-'}`, { indent: 20 });
      doc.fontSize(10).text(`Severidad: ${item.severidad || '-'}`, { indent: 20 });
      doc.fontSize(10).text(`Fecha resolución: ${item.fechaResolucion || '-'}`, { indent: 20 });
      doc.fontSize(10).text(`Administrador: ${item.administradorResponsable || '-'}`, { indent: 20 });
      doc.fontSize(10).text(`Método: ${item.metodoResolucion || '-'}`, { indent: 20 });
      doc.fontSize(10).text(`Criticidad reducida: ${item.criticidadReducida ?? 0}%`, { indent: 20 });
      
      doc.moveDown(0.8);
    });

    // Footer
    doc.fontSize(8).text('---', { align: 'center' });
    doc.fontSize(8).text(`Total de registros: ${data.length}`, { align: 'center' });

    // Terminar el documento
    doc.end();
  } catch (error) {
    console.error('[PDF] Error generando PDF:', error);
    throw new Error('Error al generar PDF: ' + error.message);
  }
}

module.exports = {
  generarCSV,
  generarPDF
};
