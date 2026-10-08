/**
 * 从 HTML 文本中提取脚本里的 JS 对象 / JSON
 *
 * 说明：适配器运行在 Service Worker / 扩展页面中，不能执行页面脚本（CSP 限制），
 * 因此这里使用「定位标记 + 花括号配对」的方式把对象源码抠出来再 JSON.parse。
 */

/**
 * 从源码文本中截取从 startIndex 处的 `{` 开始、与之配对的 `}` 结束的对象源码
 * 会跳过字符串内部的花括号
 */
export function sliceBalancedObject(source: string, startIndex: number): string | null {
  const jsonStart = source.indexOf('{', startIndex)
  if (jsonStart === -1) return null

  let depth = 0
  let inString = false
  let quote = ''
  let escape = false

  for (let i = jsonStart; i < source.length; i++) {
    const ch = source[i]

    if (escape) {
      escape = false
      continue
    }
    if (inString) {
      if (ch === '\\') {
        escape = true
      } else if (ch === quote) {
        inString = false
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = true
      quote = ch
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return source.slice(jsonStart, i + 1)
    }
  }

  return null
}

/**
 * 提取 `window.xxx = {...}` 形式对象的字段（宽松解析，失败返回 null）
 *
 * @param html   页面 HTML 或脚本文本
 * @param marker 形如 `window.mpuser` 的标记
 */
export function extractWindowObject(
  html: string,
  marker: string
): Record<string, unknown> | null {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`${escaped}\\s*=\\s*(?:Object\\.assign\\([^,]*,\\s*)?`, 'g')

  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const raw = sliceBalancedObject(html, match.index + match[0].length)
    if (!raw) continue
    const parsed = tryParseLoose(raw)
    if (parsed) return parsed
  }

  return null
}

/**
 * 提取指定 id 的 script / 元素内容（如一点号 `#__val_`）
 */
export function extractElementById(html: string, id: string): string | null {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 带 id 的任意标签
  const re = new RegExp(
    `<([a-zA-Z][\\w-]*)[^>]*\\bid=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
    'i'
  )
  const match = html.match(re)
  return match ? match[2] : null
}

/**
 * 宽松 JSON 解析：把单引号、无引号键、undefined 等 JS 字面量修正为 JSON
 */
export function tryParseLoose(source: string): Record<string, unknown> | null {
  // 优先直接解析
  try {
    return JSON.parse(source) as Record<string, unknown>
  } catch {
    // ignore
  }

  try {
    const normalized = source
      // 单引号字符串 → 双引号（简单场景）
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner: string) => `"${inner.replace(/"/g, '\\"')}"`)
      // 无引号键 → 加引号
      .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
      // JS 特有值
      .replace(/:\s*undefined/g, ':null')
      .replace(/:\s*NaN/g, ':null')
      // 去尾逗号
      .replace(/,(\s*[}\]])/g, '$1')

    return JSON.parse(normalized) as Record<string, unknown>
  } catch {
    return null
  }
}
