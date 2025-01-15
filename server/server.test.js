import { jest } from "@jest/globals"
import request from "supertest"

import app from "./server.js"
import WechatSender from "./WechatSender.js"

jest.mock("./WechatSender.js")

describe("Express App", () => {
  beforeEach(() => {
    WechatSender.mockClear()
  })

  test("POST /api/send-article", async () => {
    const mockSend = jest.fn().mockResolvedValue("mock_article_id")
    WechatSender.mockImplementation(() => ({
      send: mockSend
    }))

    const response = await request(app).post("/api/send-article").send({
      title: "Test Title",
      subTitle: "Test Subtitle",
      content: "Test Content"
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      success: true,
      articleId: "mock_article_id"
    })
    expect(mockSend).toHaveBeenCalledWith({
      title: "Test Title",
      subTitle: "Test Subtitle",
      content: "Test Content"
    })
  })

  test("POST /api/submit-article", async () => {
    const mockGetAccessToken = jest.fn().mockResolvedValue("mock_access_token")
    const mockAddDraft = jest.fn().mockResolvedValue("mock_media_id")
    WechatSender.mockImplementation(() => ({
      getAccessToken: mockGetAccessToken,
      addDraft: mockAddDraft
    }))

    const response = await request(app).post("/api/submit-article").send({
      title: "Test Title",
      subTitle: "Test Subtitle",
      content: "Test Content"
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      success: true,
      mediaId: "mock_media_id"
    })
    expect(mockGetAccessToken).toHaveBeenCalled()
    expect(mockAddDraft).toHaveBeenCalledWith("mock_access_token", {
      title: "Test Title",
      subTitle: "Test Subtitle",
      content: "Test Content"
    })
  })
})
