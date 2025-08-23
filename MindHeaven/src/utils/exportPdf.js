import jsPDF from 'jspdf'

export function exportMoodSummaryPdf(summary, filename = 'mood_summary.pdf') {
  // summary: { title, period, avg, min, max, notes? }
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const x = 48
  let y = 64

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(summary?.title || 'Mood Summary', x, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  y += 28
  doc.text(`Period: ${summary?.period || '-'}`, x, y)
  y += 18
  doc.text(`Average: ${summary?.avg ?? '-'}`, x, y)
  y += 18
  doc.text(`Min: ${summary?.min ?? '-'}`, x, y)
  y += 18
  doc.text(`Max: ${summary?.max ?? '-'}`, x, y)

  if (summary?.notes) {
    y += 24
    doc.text('Notes:', x, y)
    const lines = doc.splitTextToSize(summary.notes, 520)
    y += 16
    doc.text(lines, x, y)
  }

  doc.save(filename)
}
