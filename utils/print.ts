interface PrintOptions {
  globalStyles: boolean
  mediaPrint: boolean
  stylesheet: string | string[] | null
  noPrintSelector: string
  iframe: boolean
  append: string | null
  prepend: string | null
  manuallyCopyFormValues: boolean
  deferred: Promise<void>
  timeout: number
  title: string | null
  doctype: string
}

export class Print {
  private static defaultOptions: PrintOptions = {
    globalStyles: true,
    mediaPrint: false,
    stylesheet: null,
    noPrintSelector: ".no-print",
    iframe: true,
    append: null,
    prepend: null,
    manuallyCopyFormValues: true,
    deferred: Promise.resolve(),
    timeout: 750,
    title: null,
    doctype: "<!doctype html>"
  }

  static print(
    element: HTMLElement,
    options?: Partial<PrintOptions>
  ): Promise<void> {
    const mergedOptions = { ...Print.defaultOptions, ...options }
    const $element = element
    const content = Print.getContentToPrint($element, mergedOptions)

    return mergedOptions.iframe
      ? Print.printContentInIFrame(content, mergedOptions)
      : Print.printContentInNewWindow(content, mergedOptions)
  }

  private static getContentToPrint(
    element: HTMLElement,
    options: PrintOptions
  ): string {
    const clone = element.cloneNode(true) as HTMLElement
    Print.handleStyles(clone, options)
    Print.removeUnwantedElements(clone, options.noPrintSelector)
    Print.handleFormValues(clone, options.manuallyCopyFormValues)
    Print.addExtraContent(clone, options)

    return clone.outerHTML
  }

  private static handleStyles(clone: HTMLElement, options: PrintOptions): void {
    if (options.globalStyles) {
      const styles = document.querySelectorAll("style, link, meta, base, title")
      styles.forEach((style) => clone.appendChild(style.cloneNode(true)))
    } else if (options.mediaPrint) {
      const printStyles = document.querySelectorAll("link[media=print]")
      printStyles.forEach((style) => clone.appendChild(style.cloneNode(true)))
    }

    if (options.stylesheet) {
      const stylesheets = Array.isArray(options.stylesheet)
        ? options.stylesheet
        : [options.stylesheet]
      stylesheets.forEach((sheet) => {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = sheet
        clone.appendChild(link)
      })
    }
  }

  private static removeUnwantedElements(
    clone: HTMLElement,
    selector: string
  ): void {
    const unwanted = clone.querySelectorAll(selector)
    unwanted.forEach((el) => el.remove())
  }

  private static handleFormValues(
    clone: HTMLElement,
    copyValues: boolean
  ): void {
    if (!copyValues) return

    clone
      .querySelectorAll("input, select, textarea")
      .forEach((field: HTMLElement) => {
        if (field instanceof HTMLInputElement) {
          if (field.type === "radio" || field.type === "checkbox") {
            if (field.checked) {
              field.setAttribute("checked", "checked")
            }
          } else {
            field.setAttribute("value", field.value)
          }
        } else if (field instanceof HTMLSelectElement) {
          Array.from(field.options).forEach((option) => {
            if (option.selected) {
              option.setAttribute("selected", "selected")
            }
          })
        } else if (field instanceof HTMLTextAreaElement) {
          field.textContent = field.value
        }
      })
  }

  private static addExtraContent(
    clone: HTMLElement,
    options: PrintOptions
  ): void {
    if (options.title) {
      let title = clone.querySelector("title")
      if (!title) {
        title = document.createElement("title")
        clone.appendChild(title)
      }
      title.textContent = options.title
    }

    if (options.append) {
      const appendElement = document.createElement("div")
      appendElement.innerHTML = options.append
      clone.appendChild(appendElement)
    }

    if (options.prepend) {
      const prependElement = document.createElement("div")
      prependElement.innerHTML = options.prepend
      clone.insertBefore(prependElement, clone.firstChild)
    }
  }

  private static printContentInIFrame(
    content: string,
    options: PrintOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe")
      document.body.appendChild(iframe)
      iframe.style.position = "absolute"
      iframe.style.top = "-9999px"
      iframe.style.left = "-9999px"

      const frameWindow = iframe.contentWindow
      if (!frameWindow) {
        reject(new Error("Unable to get iframe window"))
        return
      }

      const frameDoc = frameWindow.document
      frameDoc.open()
      frameDoc.write(options.doctype + content)
      frameDoc.close()

      frameWindow.onload = () => {
        try {
          frameWindow.focus()
          frameWindow.print()
          document.body.removeChild(iframe)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      setTimeout(() => {
        frameWindow.print()
        document.body.removeChild(iframe)
        resolve()
      }, options.timeout)
    })
  }

  private static printContentInNewWindow(
    content: string,
    options: PrintOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        reject(new Error("Unable to open print window"))
        return
      }

      printWindow.document.open()
      printWindow.document.write(options.doctype + content)
      printWindow.document.close()

      printWindow.onload = () => {
        try {
          printWindow.focus()
          printWindow.print()
          printWindow.close()
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
        resolve()
      }, options.timeout)
    })
  }
}
