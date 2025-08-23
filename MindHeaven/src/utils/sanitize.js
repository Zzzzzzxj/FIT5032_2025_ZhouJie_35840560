// src/utils/sanitize.js
// 简易白名单：只允许纯文本和极少数可见字符（不会解析 HTML 标签）
export function sanitizeText(input) {
    if (input == null) return ''
    // 去掉控制字符，替换 < > & " '，避免被当成 HTML
    return String(input)
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(/[<>&"']/g, (m) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[m]))
      .trim()
  }
  