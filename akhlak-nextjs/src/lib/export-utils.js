import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pptxgen from 'pptxgenjs';

export function exportToPDF(data, title) {
  const doc = new jsPDF('landscape');
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);
  
  const headers = [['NIP', 'Nama Lengkap', 'Divisi', 'Jabatan', 'Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif', 'Rata-Rata', 'Status']];
  const rows = data.map(row => [
    row.nip,
    row.nama,
    row.divisi,
    row.jabatan,
    row.A ?? '-', row.K1 ?? '-', row.H ?? '-', row.L ?? '-', row.A2 ?? '-', row.K2 ?? '-',
    row.avg ?? '-',
    row.status
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 28,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] }
  });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}

export function exportToPPTX(data, title) {
  const pptx = new pptxgen();
  const slide = pptx.addSlide();
  
  slide.addText(title, { x: 0.5, y: 0.5, fontSize: 18, color: "0F172A", bold: true });
  slide.addText(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { x: 0.5, y: 0.9, fontSize: 10, color: "64748b" });

  const headers = [
    { text: 'NIP', options: { fill: '0F172A', color: 'FFFFFF', bold: true } },
    { text: 'Nama Lengkap', options: { fill: '0F172A', color: 'FFFFFF', bold: true } },
    { text: 'Divisi', options: { fill: '0F172A', color: 'FFFFFF', bold: true } },
    { text: 'Jabatan', options: { fill: '0F172A', color: 'FFFFFF', bold: true } },
    { text: 'Avg Score', options: { fill: '0F172A', color: 'FFFFFF', bold: true } },
    { text: 'Status', options: { fill: '0F172A', color: 'FFFFFF', bold: true } }
  ];
  
  const rows = data.map(row => [
    row.nip, row.nama, row.divisi, row.jabatan, row.avg ? row.avg.toString() : '-', row.status
  ]);
  
  const tableData = [headers, ...rows];

  slide.addTable(tableData, {
    x: 0.5, y: 1.2, w: "90%",
    fill: "FFFFFF", color: "333333", fontSize: 10, border: { pt: 1, color: "CCCCCC" },
    autoPage: true,
    colW: [1.2, 2.5, 1.5, 1.5, 1.0, 1.0]
  });

  pptx.writeFile({ fileName: `${title.replace(/\s+/g, '_').toLowerCase()}.pptx` });
}
