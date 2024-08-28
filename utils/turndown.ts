import TurndownService from "turndown"

export default function Turndown() {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced"
  })

  // turndownService.keep(["h1", "h2"])
  turndownService.remove(["script", "style"])

  return turndownService
}
