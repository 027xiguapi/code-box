import { CheckCircleTwoTone, CloseCircleTwoTone, LinkOutlined } from "@ant-design/icons"
import { Progress, Spin, Tag, Tooltip, Typography } from "antd"

import type { SyncDetailProgress } from "~sync/extension/engine"
import type { SyncResult } from "~sync/types"

const { Text } = Typography

export interface SyncProgressProps {
  /** 正在同步的平台数（用于计算整体进度） */
  total: number
  progress: Record<string, SyncDetailProgress>
  results: SyncResult[]
  platformNames: Record<string, string>
}

/**
 * 同步进度与结果
 */
export default function SyncProgress({
  total,
  progress,
  results,
  platformNames
}: SyncProgressProps) {
  const finished = results.length
  const percent = total > 0 ? Math.round((finished / total) * 100) : 0

  const platformIds = Object.keys(progress)

  return (
    <div>
      <Progress percent={percent} status={percent === 100 ? "success" : "active"} />

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {platformIds.map((platformId) => {
          const item = progress[platformId]
          const name = platformNames[platformId] || item.platformName || platformId

          return (
            <div
              key={platformId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                padding: "4px 0",
                borderBottom: "1px solid #fafafa"
              }}>
              <StageIcon stage={item.stage} />
              <span style={{ width: 130 }}>{name}</span>
              <StageText stage={item.stage} imageProgress={item.imageProgress} />
              {item.result?.message && (
                <Tooltip title={item.result.message}>
                  <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                    {item.result.message.slice(0, 40)}
                  </Text>
                </Tooltip>
              )}
              {item.stage === "completed" && item.result?.postUrl && (
                <a
                  href={item.result.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12 }}>
                  <LinkOutlined /> 打开
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StageIcon({ stage }: { stage: SyncDetailProgress["stage"] }) {
  if (stage === "completed") {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />
  }
  if (stage === "failed") {
    return <CloseCircleTwoTone twoToneColor="#ff4d4f" />
  }
  return <Spin size="small" />
}

function StageText({
  stage,
  imageProgress
}: {
  stage: SyncDetailProgress["stage"]
  imageProgress?: { current: number; total: number }
}) {
  switch (stage) {
    case "starting":
      return <Tag>准备中</Tag>
    case "uploading_images":
      return (
        <Tag color="blue">
          上传图片 {imageProgress ? `${imageProgress.current}/${imageProgress.total}` : ""}
        </Tag>
      )
    case "saving":
      return <Tag color="processing">保存中</Tag>
    case "completed":
      return <Tag color="success">已完成</Tag>
    case "failed":
      return <Tag color="error">失败</Tag>
    default:
      return null
  }
}
