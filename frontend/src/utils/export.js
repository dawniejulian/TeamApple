// frontend/src/utils/export.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data ke PDF menggunakan jsPDF
 */
export const exportToPDF = (filename, title, columns, data) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Tambah title
    pdf.setFontSize(16);
    pdf.text(title, pageWidth / 2, 15, { align: 'center' });
    
    // Tambah tanggal
    pdf.setFontSize(10);
    pdf.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 25, { align: 'center' });
    
    // Tambah table
    pdf.autoTable({
      columns: columns,
      body: data,
      startY: 35,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    pdf.APPve(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

/**
 * Export data ke Excel menggunakan xlsx
 */
export const exportToExcel = (filename, sheetName, columns, data) => {
  try {
    // Prepare data dengan headers
    const excelData = [
      columns.map(col => col.header), // Headers
      ...data.map(row => columns.map(col => row[col.dataKey] || ''))
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Set column widths
    worksheet['!cols'] = columns.map(() => ({ wch: 15 }));

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};
