import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sample } from '../types';

export const generateSamplePDF = (sample: Sample) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 43, 46); // thriva-navy
  doc.text('THRIVA ANALYTICS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(61, 195, 158); // thriva-mint
  doc.text('OFFICIAL CERTIFICATE OF ANALYSIS', 105, 28, { align: 'center' });
  
  doc.setDrawColor(0, 43, 46, 0.1);
  doc.line(20, 35, 190, 35);
  
  // Client & Sample Info
  doc.setFontSize(12);
  doc.setTextColor(0, 43, 46);
  doc.text('Client Information', 20, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Company: ${sample.clientName || 'N/A'}`, 20, 52);
  doc.text(`Date Prepared: ${new Date().toLocaleDateString()}`, 20, 57);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 43, 46);
  doc.text('Sample Information', 120, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Sample ID: ${sample.sampleId}`, 120, 52);
  doc.text(`Type: ${sample.sampleType}`, 120, 57);
  doc.text(`Status: ${sample.status}`, 120, 62);
  
  // Results Table
  doc.setFontSize(12);
  doc.setTextColor(0, 43, 46);
  doc.text('Detailed Molecular Analysis', 20, 80);
  
  const tableData = [];
  if (sample.elements) {
    if (sample.elements.gold !== undefined) tableData.push(['Gold (Au)', `${sample.elements.gold.toFixed(4)}`, 'g/t', sample.method || 'Fire Assay']);
    if (sample.elements.silver !== undefined) tableData.push(['Silver (Ag)', `${sample.elements.silver.toFixed(3)}`, 'g/t', 'AAS']);
    if (sample.elements.copper !== undefined) tableData.push(['Copper (Cu)', `${sample.elements.copper.toFixed(2)}`, '%', 'Wet Chemistry']);
  }
  
  autoTable(doc, {
    startY: 85,
    head: [['Element', 'Value', 'Unit', 'Assay Method']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 43, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || 120;
  doc.setFontSize(10);
  doc.setTextColor(0, 43, 46);
  doc.text('__________________________', 20, finalY + 25);
  doc.text('Lab Director Authorization', 20, finalY + 32);
  doc.text('Generated on Thriva Cloud Platform', 105, 280, { align: 'center' });
  
  doc.save(`analysis-report-${sample.sampleId}.pdf`);
};

export const generateHistoryPDF = (samples: Sample[], dateRange: { start?: string, end?: string }) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 43, 46);
  doc.text('THRIVA ANALYTICS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(61, 195, 158);
  doc.text('ARCHIVE EXPORT SUMMARY', 105, 28, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Range: ${dateRange.start || 'Start'} to ${dateRange.end || 'Present'}`, 105, 35, { align: 'center' });
  
  const tableData = samples.map(s => [
    s.sampleId,
    s.clientName || 'N/A',
    s.sampleType,
    s.status,
    new Date(s.collectedAt).toLocaleDateString(),
    s.elements?.gold?.toFixed(2) || '-'
  ]);
  
  autoTable(doc, {
    startY: 45,
    head: [['Sample ID', 'Client', 'Type', 'Status', 'Date', 'Au (g/t)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 43, 46] },
    styles: { fontSize: 8 }
  });
  
  doc.save(`thriva-history-${new Date().getTime()}.pdf`);
};
