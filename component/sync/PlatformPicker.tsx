import { ReloadOutlined } from "@ant-design/icons"
import { Avatar, Button, Checkbox, Empty, Space, Tag, Tooltip, Typography } from "antd"

import type { PlatformAuthItem } from "~sync/extension/engine"

const { Text } = Typography

export interface PlatformPickerProps {
  platforms: PlatformAuthItem[]
  selected: string[]
  loading: boolean
  onChange: (selected: string[]) => void
  onRefresh: () => void
}

/**
 * 平台选择面板（按分类分组，展示登录状态）
 */
export default function PlatformPicker({
  platforms,
  selected,
  loading,
  onChange,
  onRefresh
}: PlatformPickerProps) {
  const selectedSet = new Set(selected)

  function toggle(id: string, checked: boolean) {
    const next = new Set(selectedSet)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    onChange(Array.from(next))
  }

  function selectAll(authenticatedOnly: boolean) {
    const next = platforms
      .filter((p) => (authenticatedOnly ? p.isAuthenticated : true))
      .map((p) => p.id)
    onChange(next)
  }

  // 按分类分组
  const groups = new Map<string, PlatformAuthItem[]>()
  for (const platform of platforms) {
    const category = platform.category || "其他"
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push(platform)
  }

  const authenticatedCount = platforms.filter((p) => p.isAuthenticated).length

  return (
    <div>
      <Space wrap style={{ marginBottom: 12 }}>
        <Button size="small" onClick={() => selectAll(true)}>
          选择已登录（{authenticatedCount}）
        </Button>
        <Button size="small" onClick={() => selectAll(false)}>
          全选（{platforms.length}）
        </Button>
        <Button size="small" onClick={() => onChange([])}>
          清空
        </Button>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={onRefresh}>
          刷新登录状态
        </Button>
        <Text type="secondary" style={{ fontSize: 12 }}>
          已选 {selected.length} 个平台
        </Text>
      </Space>

      {platforms.length === 0 ? (
        <Empty description="正在加载平台列表..." />
      ) : (
        Array.from(groups.entries()).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Tag color="green">{category}</Tag>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: 8
              }}>
              {items.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  checked={selectedSet.has(platform.id)}
                  onToggle={(checked) => toggle(platform.id, checked)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function PlatformCard({
  platform,
  checked,
  onToggle
}: {
  platform: PlatformAuthItem
  checked: boolean
  onToggle: (checked: boolean) => void
}) {
  const statusTag = platform.isAuthenticated ? (
    <Tag color="success" style={{ maxWidth: 110, overflow: "hidden" }}>
      {platform.username || "已登录"}
    </Tag>
  ) : (
    <Tag color="default">未登录</Tag>
  )

  return (
    <div
      onClick={() => onToggle(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        border: checked ? "1px solid #52c41a" : "1px solid #f0f0f0",
        borderRadius: 8,
        cursor: "pointer",
        background: checked ? "#f6ffed" : "#fff"
      }}>
      {/* 阻止冒泡，避免点击勾选框时与外层卡片点击重复触发 */}
      <span onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onChange={(e) => onToggle(e.target.checked)} />
      </span>
      <Avatar
        size={22}
        src={platform.icon}
        style={{ backgroundColor: "#f0f0f0", fontSize: 12 }}>
        {platform.name?.[0]}
      </Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Text ellipsis style={{ fontSize: 13 }}>
            {platform.name}
          </Text>
          {platform.experimental && (
            <Tooltip title="半自动同步：打开官方编辑器并自动填充内容，需人工确认发布">
              <Tag color="orange" style={{ marginInlineEnd: 0, fontSize: 10 }}>
                实验
              </Tag>
            </Tooltip>
          )}
        </div>
        <div style={{ marginTop: 2 }}>
          {platform.error && !platform.isAuthenticated ? (
            <Tooltip title={platform.error}>{statusTag}</Tooltip>
          ) : (
            statusTag
          )}
        </div>
      </div>
    </div>
  )
}
