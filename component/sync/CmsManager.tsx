import { DeleteOutlined, PlusOutlined, ApiOutlined } from "@ant-design/icons"
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag
} from "antd"
import { useEffect, useState } from "react"

import {
  CMS_TYPES,
  checkCmsAuth,
  getCmsAccounts,
  removeCmsAccount,
  saveCmsAccount,
  type CmsAccount
} from "~sync/extension/engine"

export interface CmsManagerProps {
  /** 账号列表变化时通知父组件 */
  onChange?: (accounts: CmsAccount[]) => void
}

interface CmsFormValues {
  type: CmsAccount["type"]
  name: string
  url: string
  username: string
  password: string
}

/**
 * 自建站（WordPress / Typecho / MetaWeblog）账号管理
 */
export default function CmsManager({ onChange }: CmsManagerProps) {
  const [accounts, setAccounts] = useState<CmsAccount[]>([])
  const [status, setStatus] = useState<
    Record<string, { checking: boolean; ok?: boolean; error?: string }>
  >({})
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<CmsFormValues>()

  async function refresh() {
    const list = await getCmsAccounts()
    setAccounts(list)
    onChange?.(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleAdd() {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const account = await saveCmsAccount(
        {
          type: values.type,
          name: values.name || `${values.type} 站点`,
          url: values.url.trim(),
          username: values.username
        },
        values.password
      )

      message.success("账号已保存")
      setOpen(false)
      form.resetFields()
      await refresh()

      await check(account)
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) return
      message.error((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function check(account: CmsAccount) {
    setStatus((prev) => ({ ...prev, [account.id]: { checking: true } }))
    const result = await checkCmsAuth(account)
    setStatus((prev) => ({
      ...prev,
      [account.id]: { checking: false, ok: result.isAuthenticated, error: result.error }
    }))
  }

  async function handleRemove(id: string) {
    await removeCmsAccount(id)
    message.success("账号已删除")
    await refresh()
  }

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}>
          添加自建站
        </Button>
        <span style={{ fontSize: 12, color: "#999" }}>
          支持 WordPress、Typecho 及兼容 MetaWeblog 的博客，同步为草稿
        </span>
      </Space>

      {accounts.length > 0 && (
        <Table<CmsAccount>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={accounts}
          columns={[
            { title: "名称", dataIndex: "name", width: 160 },
            {
              title: "类型",
              dataIndex: "type",
              width: 130,
              render: (type: string) =>
                CMS_TYPES.find((t) => t.value === type)?.label || type
            },
            { title: "站点", dataIndex: "url", ellipsis: true },
            { title: "用户名", dataIndex: "username", width: 120 },
            {
              title: "状态",
              width: 120,
              render: (_, account) => {
                const item = status[account.id]
                if (!item || item.checking) return <Tag>未检测</Tag>
                return item.ok ? (
                  <Tag color="success">连接正常</Tag>
                ) : (
                  <Tag color="error" title={item.error}>
                    连接失败
                  </Tag>
                )
              }
            },
            {
              title: "操作",
              width: 140,
              render: (_, account) => (
                <Space>
                  <Button
                    size="small"
                    type="link"
                    icon={<ApiOutlined />}
                    loading={status[account.id]?.checking}
                    onClick={() => check(account)}>
                    测试
                  </Button>
                  <Popconfirm
                    title="删除该账号？"
                    onConfirm={() => handleRemove(account.id)}>
                    <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      )}

      <Modal
        title="添加自建站账号"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleAdd}
        confirmLoading={saving}
        okText="保存并测试">
        <Form form={form} layout="vertical" initialValues={{ type: "wordpress" }}>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: "请选择类型" }]}>
            <Select options={CMS_TYPES} />
          </Form.Item>
          <Form.Item name="name" label="名称">
            <Input placeholder="如：我的博客" />
          </Form.Item>
          <Form.Item
            name="url"
            label="站点地址"
            rules={[{ required: true, message: "请输入站点地址" }]}
            extra="如 https://blog.example.com，无需带结尾斜杠">
            <Input placeholder="https://blog.example.com" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="WordPress / Typecho 登录用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码 / 应用密码"
            rules={[{ required: true, message: "请输入密码" }]}
            extra="WordPress 建议使用「应用密码」，账号密码仅保存在本地浏览器中">
            <Input.Password placeholder="密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
