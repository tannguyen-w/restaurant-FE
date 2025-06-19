import * as XLSX from 'xlsx';

export const exportToExcel = async (data, fileName, sheetTitle = 'Dữ liệu') => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const colWidths = [];
  if (data.length > 0) {
    Object.keys(data[0]).forEach(key => {
      colWidths.push({ wch: Math.max(key.length, 15) });
    });
    ws['!cols'] = colWidths;
  }
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  
  // Generate an Excel file and trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};