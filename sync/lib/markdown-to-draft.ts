/**
 * Markdown to Draft.js 转换
 * 用于豆瓣等使用 Draft.js 编辑器的平台
 *
 * 基于 packages/@wechatsync/drivers/tools/mtd.js
 */

// @ts-ignore - markdown-draft-js 没有类型定义
import { markdownToDraft as mdToDraft } from 'markdown-draft-js'
import { Remarkable } from 'remarkable'

/**
 * 图片数据接口 - 豆瓣需要完整的图片信息
 */
export interface DoubanImageData {
  id: string
  url: string
  thumb: string
  width?: number
  height?: number
  file_name?: string
  file_size?: number
}

/**
 * 豆瓣图片 Block 解析器 - 处理 ![]() 格式的图片
 */
const ImageRegexp = /^!\[([^\]]*)]\s*\(([^)"]+)( "([^)"]+)")?\)/

const imageBlockPlugin = (remarkable: Remarkable) => {
  // @ts-ignore - remarkable types incomplete
  remarkable.block.ruler.before('paragraph', 'image', (state: any, startLine: number, endLine: number, silent: boolean) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    if (pos >= max) return false
    if (!state.src) return false
    if (state.src[pos] !== '!') return false

    const match = ImageRegexp.exec(state.src.slice(pos))
    if (!match) return false

    if (!silent) {
      state.tokens.push({
        type: 'image_open',
        src: match[2],
        alt: match[1],
        lines: [startLine, state.line],
        level: state.level
      })
      state.tokens.push({
        type: 'image_close',
        level: state.level
      })
    }

    state.line = startLine + 1
    return true
  })
}

/**
 * 将 Markdown 转换为 Draft.js 格式 (豆瓣专用)
 * @param markdown Markdown 内容
 * @param imageDataMap 图片 URL 到完整数据的映射
 * @returns Draft.js JSON 字符串
 */
export function markdownToDraft(markdown: string, imageDataMap: Map<string, DoubanImageData> = new Map()): string {
  // 保证图片换行
  const processedMarkdown = markdown.split('\n').map(line => {
    const imageBlocks = line.split('![]')
    return imageBlocks.length > 1 ? imageBlocks.join('\n![]') : line
  }).join('\n')

  let keyCounter = 0
  const generateUniqueKey = () => keyCounter++

  const draftState = mdToDraft(processedMarkdown, {
    remarkablePlugins: [imageBlockPlugin],
    blockTypes: {
      image_open: function (item: any) {
        const key = generateUniqueKey()
        const blockEntities: Record<number, any> = {}

        // 解析 ?# 格式获取原始 URL 和 ID
        const sourcePair = item.src ? item.src.split('?#') : ['', '']
        const rawSrc = sourcePair[0]
        const sourceId = sourcePair[1] || ''

        // 从 imageDataMap 获取完整图片数据
        const imgData = imageDataMap.get(item.src) || imageDataMap.get(rawSrc)

        const imageTemplate = imgData ? {
          id: imgData.id,
          src: imgData.url,
          thumb: imgData.thumb,
          url: imgData.url,
          width: imgData.width,
          height: imgData.height,
          file_name: imgData.file_name,
          file_size: imgData.file_size,
        } : {
          id: sourceId,
          src: rawSrc,
          thumb: rawSrc,
          url: rawSrc,
        }

        blockEntities[key] = {
          type: 'IMAGE',
          mutability: 'IMMUTABLE',
          data: imageTemplate,
        }

        return {
          type: 'atomic',
          blockEntities: blockEntities,
          inlineStyleRanges: [],
          entityRanges: [{ offset: 0, length: 1, key: key }],
          text: ' ',
        }
      }
    },
    blockEntities: {
      image: function (item: any) {
        const sourcePair = item.src ? item.src.split('?#') : ['', '']
        const rawSrc = sourcePair[0]
        const sourceId = sourcePair[1] || ''

        // 从 imageDataMap 获取完整图片数据
        const imgData = imageDataMap.get(item.src) || imageDataMap.get(rawSrc)

        if (imgData) {
          return {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: {
              id: imgData.id,
              src: imgData.url,
              thumb: imgData.thumb,
              url: imgData.url,
              width: imgData.width,
              height: imgData.height,
            }
          }
        }

        return {
          type: 'IMAGE',
          mutability: 'IMMUTABLE',
          data: {
            id: sourceId,
            src: rawSrc,
            thumb: rawSrc,
            url: rawSrc,
          }
        }
      }
    }
  })

  // 将 block.blockEntities 合并到顶层 entityMap (参考 mtd.js)
  if (draftState.blocks) {
    for (const block of draftState.blocks) {
      if (block.blockEntities) {
        Object.assign(draftState.entityMap, block.blockEntities)
        delete block.blockEntities
      }
    }
  }

  return JSON.stringify(draftState)
}
