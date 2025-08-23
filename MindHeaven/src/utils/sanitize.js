export function sanitizeText(input) {
    if (input == null) return ''
    return String(input)
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(/[<>&"']/g, (m) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[m]))
      .trim()
  }
  