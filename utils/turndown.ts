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

  turndownService.addRule("fencedCodeBlock", {
    filter: function (node, options) {
      return (
        options.codeBlockStyle === "fenced" &&
        node.nodeName === "PRE" &&
        node.querySelector("code")
      )
    },

    replacement: function (content, node, options) {
      const className = node.querySelector("code").getAttribute("class") || ""
      const language = (className.match(/lang-(\S+)/) ||
        className.match(/language-(\S+)/) || [null, ""])[1]

      return (
        "\n\n" +
        options.fence +
        language +
        "\n" +
        node.querySelector("code").textContent +
        "\n" +
        options.fence +
        "\n\n"
      )
    }
  })

  return turndownService
}
