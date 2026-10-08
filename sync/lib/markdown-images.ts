export interface MarkdownImageMatch {
  full: string
  alt: string
  src: string
}

/**
 * 解析 Markdown 图片语法，支持可选标题和括号 URL
 */
export function parseMarkdownImages(markdown: string): MarkdownImageMatch[] {
  const results: MarkdownImageMatch[] = []
  const len = markdown.length
  let i = 0

  const findClosingBracket = (start: number): number => {
    for (let j = start; j < len; j++) {
      const ch = markdown[j]
      if (ch === '\\') {
        j++
        continue
      }
      if (ch === ']') return j
    }
    return -1
  }

  while (i < len) {
    const start = markdown.indexOf('![', i)
    if (start === -1) break

    const altStart = start + 2
    const altEnd = findClosingBracket(altStart)
    if (altEnd === -1 || markdown[altEnd + 1] !== '(') {
      i = altStart
      continue
    }

    let k = altEnd + 2
    while (k < len && /\s/.test(markdown[k])) k++

    let url = ''
    if (markdown[k] === '<') {
      const close = markdown.indexOf('>', k + 1)
      if (close === -1) {
        i = altEnd + 1
        continue
      }
      url = markdown.slice(k + 1, close)
      k = close + 1
    } else {
      const urlStart = k
      let depth = 0
      while (k < len) {
        const ch = markdown[k]
        if (ch === '\\') {
          k += 2
          continue
        }
        if (ch === '(') {
          depth++
        } else if (ch === ')') {
          if (depth === 0) break
          depth--
        } else if (/\s/.test(ch) && depth === 0) {
          break
        }
        k++
      }
      url = markdown.slice(urlStart, k)
    }

    if (!url) {
      i = altEnd + 1
      continue
    }

    while (k < len && /\s/.test(markdown[k])) k++

    if (k < len && (markdown[k] === '"' || markdown[k] === '\'')) {
      const quote = markdown[k]
      k++
      while (k < len) {
        const ch = markdown[k]
        if (ch === '\\') {
          k += 2
          continue
        }
        if (ch === quote) {
          k++
          break
        }
        k++
      }
      while (k < len && /\s/.test(markdown[k])) k++
    } else if (k < len && markdown[k] === '(') {
      k++
      while (k < len) {
        const ch = markdown[k]
        if (ch === '\\') {
          k += 2
          continue
        }
        if (ch === ')') {
          k++
          break
        }
        k++
      }
      while (k < len && /\s/.test(markdown[k])) k++
    }

    if (markdown[k] !== ')') {
      i = altEnd + 1
      continue
    }

    const full = markdown.slice(start, k + 1)
    const alt = markdown.slice(altStart, altEnd)
    results.push({ full, alt, src: url })
    i = k + 1
  }

  return results
}
