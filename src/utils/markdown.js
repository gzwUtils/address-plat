const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatInline = (value = '') =>
  value
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

export const renderMarkdown = (source = '') => {
  const normalized = escapeHtml(source).replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  const html = []
  let listItems = []
  let codeLines = []
  let inCodeBlock = false

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.join('')}</ul>`)
      listItems = []
    }
  }

  const flushCode = () => {
    if (codeLines.length) {
      html.push(`<pre><code>${codeLines.join('\n')}</code></pre>`)
      codeLines = []
    }
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd()

    if (line.startsWith('```')) {
      flushList()
      if (inCodeBlock) {
        flushCode()
      }
      inCodeBlock = !inCodeBlock
      return
    }

    if (inCodeBlock) {
      codeLines.push(rawLine)
      return
    }

    if (!line.trim()) {
      flushList()
      return
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      html.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`)
      return
    }

    const quoteMatch = line.match(/^>\s?(.*)$/)
    if (quoteMatch) {
      flushList()
      html.push(`<blockquote>${formatInline(quoteMatch[1])}</blockquote>`)
      return
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/)
    if (listMatch) {
      listItems.push(`<li>${formatInline(listMatch[1])}</li>`)
      return
    }

    flushList()
    html.push(`<p>${formatInline(line)}</p>`)
  })

  flushList()
  flushCode()
  return html.join('')
}

export const extractMarkdownHeadings = (source = '') =>
  source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.match(/^(#{1,6})\s+(.*)$/))
    .filter(Boolean)
    .map((match, index) => ({
      id: `section-${index + 1}`,
      level: match[1].length,
      text: match[2].trim()
    }))

export const stripMarkdown = (source = '') =>
  source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const estimateReadingMinutes = (source = '') => {
  const text = stripMarkdown(source)
  if (!text) {
    return 1
  }
  return Math.max(1, Math.ceil(text.length / 320))
}
