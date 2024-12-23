const cozeUrl = process.env.PLASMO_PUBLIC_COZE_URL
const token = process.env.PLASMO_PUBLIC_COZE_TOKEN
const workflowId = process.env.PLASMO_PUBLIC_COZE_WORKFLOWID
const appId = process.env.PLASMO_PUBLIC_COZE_APPID

export async function getSummary(url: string) {
  const data = {
    workflow_id: workflowId,
    app_id: appId,
    parameters: {
      url: url
    }
  }
  try {
    const res = await fetch(cozeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then((response) => response.json()) // 解析返回的 JSON 数据
    return res
  } catch (error) {
    console.error("Error:", error)
  }
}
