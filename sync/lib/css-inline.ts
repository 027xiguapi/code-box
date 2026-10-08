/**
 * 极简 CSS 内联工具
 *
 * 用途：微信公众号等平台的编辑器不加载外部样式表，
 * 需要把固定样式表内联到元素 style 属性上（等价于 juice.inlineContent 的轻量实现）。
 *
 * 说明：
 * - 依赖 DOM（扩展页面 / Content Script 环境），无 DOM 时原样返回
 * - 按样式表出现顺序追加声明，同名属性后者覆盖前者
 */

interface CssRule {
  selectors: string[]
  declarations: string
}

function parseCss(css: string): CssRule[] {
  const rules: CssRule[] = []
  // 去掉注释
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '')

  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g
  let match: RegExpExecArray | null

  while ((match = ruleRegex.exec(cleaned)) !== null) {
    const selectors = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const declarations = match[2].trim().replace(/\s+/g, ' ')
    if (selectors.length > 0 && declarations) {
      rules.push({ selectors, declarations })
    }
  }

  return rules
}

/**
 * 把样式表内联到 HTML 元素上
 */
export function inlineCss(html: string, css: string): string {
  if (typeof document === 'undefined') {
    return html
  }

  const container = document.createElement('div')
  container.innerHTML = html

  const rules = parseCss(css)

  for (const rule of rules) {
    for (const selector of rule.selectors) {
      let elements: Element[]
      try {
        elements = Array.from(container.querySelectorAll(selector))
      } catch {
        continue
      }

      for (const el of elements) {
        const current = el.getAttribute('style') || ''
        const normalized = current.trim()
        const prefix = normalized
          ? normalized.endsWith(';')
            ? normalized + ' '
            : normalized + '; '
          : ''
        el.setAttribute('style', prefix + rule.declarations)
      }
    }
  }

  return container.innerHTML
}
