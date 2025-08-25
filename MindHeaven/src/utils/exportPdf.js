// src/utils/exportPdf.js
// 依赖：npm i jspdf
import { jsPDF } from 'jspdf'

/**
 * 导出心情总结 PDF
 * @param {Object} data { title, period, avg, min, max, notes }
 * @param {string|null} filename 下载文件名；如果配合 returnBlob 使用，可以传 null
 * @param {Object} opts { returnBlob?: boolean }
 * @returns {Blob|undefined} 当 returnBlob=true 时返回 Blob，否则直接触发下载
 */
export function exportMoodSummaryPdf(data, filename = 'mood_summary.pdf', opts = {}) {
  const doc = new jsPDF()

  const title = data?.title || 'Mood Summary'
  const period = data?.period || '-'
  const avg = data?.avg ?? '-'
  const min = data?.min ?? '-'
  const max = data?.max ?? '-'
  const notes = data?.notes || 'This summary is for self-reflection only and is not medical advice.'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, 20, 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Period: ${period}`, 20, 34)
  doc.text(`Average: ${avg}`, 20, 46)
  doc.text(`Min: ${min}`, 20, 58)
  doc.text(`Max: ${max}`, 20, 70)

  doc.setFontSize(11)
  doc.text('Notes:', 20, 88)
  // 自动换行
  const lines = doc.splitTextToSize(notes, 170)
  doc.text(lines, 20, 98)

  if (opts?.returnBlob) {
    return doc.output('blob')
  }
  doc.save(filename || 'mood_summary.pdf')
}
