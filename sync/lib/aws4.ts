/**
 * AWS4-HMAC-SHA256 签名实现
 * 用于字节跳动 ImageX 图片上传服务
 */

// 使用 Web Crypto API 进行 HMAC-SHA256 签名
async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  // 转换为 Uint8Array 然后创建新的 ArrayBuffer
  const keyBytes = key instanceof Uint8Array ? key : new Uint8Array(key)
  const keyBuffer = new Uint8Array(keyBytes).buffer as ArrayBuffer
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
}

// SHA256 哈希
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return arrayBufferToHex(hashBuffer)
}

// ArrayBuffer 转 hex 字符串
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// 格式化日期为 AWS 格式
function formatAmzDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

// 格式化日期为 YYYYMMDD 格式
function formatDateStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

export interface AWS4SignParams {
  method: string
  url: string
  accessKeyId: string
  secretAccessKey: string
  securityToken?: string
  region?: string
  service?: string
  headers?: Record<string, string>
  body?: string
}

export interface AWS4SignResult {
  authorization: string
  amzDate: string
  headers: Record<string, string>
}

/**
 * 生成 AWS4-HMAC-SHA256 签名
 */
export async function signAWS4(params: AWS4SignParams): Promise<AWS4SignResult> {
  const {
    method,
    url,
    accessKeyId,
    secretAccessKey,
    securityToken,
    region = 'cn-north-1',
    service = 'imagex',
    headers = {},
    body = '',
  } = params

  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const queryString = parsedUrl.search.slice(1) // 去掉前导 ?

  const now = new Date()
  const amzDate = formatAmzDate(now)
  const dateStamp = formatDateStamp(now)

  // 规范化查询字符串（按参数名排序）
  const queryParams = new URLSearchParams(queryString)
  const sortedParams = Array.from(queryParams.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  const canonicalQueryString = sortedParams
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  // 构建签名 headers
  const signedHeadersObj: Record<string, string> = {
    'x-amz-date': amzDate,
  }

  if (securityToken) {
    signedHeadersObj['x-amz-security-token'] = securityToken
  }

  // 合并其他 headers
  Object.assign(signedHeadersObj, headers)

  // 签名的 header 名称列表（小写，按字母排序）
  const signedHeaderNames = Object.keys(signedHeadersObj)
    .map(k => k.toLowerCase())
    .sort()
    .join(';')

  // 规范化 headers（小写 key，按字母排序）
  const canonicalHeaders = Object.entries(signedHeadersObj)
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .sort()
    .join('\n') + '\n'

  // 计算 payload 哈希
  const payloadHash = await sha256(body)

  // 构建 Canonical Request
  const canonicalRequest = [
    method.toUpperCase(),
    path || '/',
    canonicalQueryString,
    canonicalHeaders,
    signedHeaderNames,
    payloadHash,
  ].join('\n')

  // 构建 String to Sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const canonicalRequestHash = await sha256(canonicalRequest)

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n')

  // 计算签名密钥
  const kDate = await hmacSha256(
    new TextEncoder().encode('AWS4' + secretAccessKey),
    dateStamp
  )
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')

  // 计算最终签名
  const signatureBuffer = await hmacSha256(kSigning, stringToSign)
  const signature = arrayBufferToHex(signatureBuffer)

  // 构建 Authorization header
  const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`

  // 构建返回的 headers
  const resultHeaders: Record<string, string> = {
    authorization,
    'x-amz-date': amzDate,
  }

  if (securityToken) {
    resultHeaders['x-amz-security-token'] = securityToken
  }

  return {
    authorization,
    amzDate,
    headers: resultHeaders,
  }
}

/**
 * 计算文件的 CRC32 校验值
 */
export function crc32(data: Uint8Array): string {
  let crc = 0xFFFFFFFF
  const table = getCRC32Table()

  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF]
  }

  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0')
}

// CRC32 查找表（懒加载）
let crc32Table: Uint32Array | null = null

function getCRC32Table(): Uint32Array {
  if (crc32Table) return crc32Table

  crc32Table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    crc32Table[i] = c
  }
  return crc32Table
}
