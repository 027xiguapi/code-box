import TurndownService from "@joplin/turndown"

var turndownPluginGfm = require("@joplin/turndown-plugin-gfm")

export default function Turndown() {
  const gfm = turndownPluginGfm.gfm
  const tables = turndownPluginGfm.tables
  const strikethrough = turndownPluginGfm.strikethrough
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced"
  })

  turndownService.use(gfm)
  turndownService.use(tables, strikethrough)

  // turndownService.keep(["h1", "h2"])
  turndownService.remove(["script", "style"])

  return turndownService
}
