// Function to download a file
export function downloadFile(content: string, fileName: string, contentType: string) {
  try {
    console.log("Downloading file:", fileName, "Content type:", contentType)

    // Create a blob with the content
    const blob = new Blob([content], { type: contentType })

    // Create a download URL
    const url = URL.createObjectURL(blob)
    console.log("Created blob URL:", url)

    // Create a link element
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.style.display = "none"

    // Add to document, click, and remove
    document.body.appendChild(link)
    console.log("Triggering download...")
    link.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log("Download cleanup complete")
    }, 100)

    return true
  } catch (error) {
    console.error("Error in downloadFile:", error)
    return false
  }
}

// Function to generate CSS content
export function generateCssContent(colors: Array<{ hex: string; locked: boolean }>) {
  const cssHeader = "/* Color Palette Generated on " + new Date().toLocaleString() + " */\n\n"

  const cssClasses = colors
    .map((color, index) => {
      return `.color-${index + 1} {\n  background-color: ${color.hex};\n}`
    })
    .join("\n\n")

  return cssHeader + cssClasses
}

// Function to export palette as PNG
export function exportPaletteAsPng(colors: Array<{ hex: string; locked: boolean }>, fileName = "color-palette.png") {
  try {
    console.log("Starting PNG export...")

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      console.error("Could not get canvas context")
      return false
    }

    // Set canvas dimensions
    const width = 800
    const height = 400
    canvas.width = width
    canvas.height = height

    // Calculate the width of each color bar
    const barWidth = width / colors.length

    // Draw background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, height)

    // Draw title
    ctx.fillStyle = "#000000"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Color Palette", width / 2, 40)

    // Draw each color bar
    colors.forEach((color, index) => {
      // Draw color bar
      ctx.fillStyle = color.hex
      ctx.fillRect(index * barWidth + 10, 60, barWidth - 20, height - 140)

      // Draw border around the color
      ctx.strokeStyle = "#CCCCCC"
      ctx.lineWidth = 1
      ctx.strokeRect(index * barWidth + 10, 60, barWidth - 20, height - 140)

      // Draw the hex value below
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(index * barWidth + 10, height - 70, barWidth - 20, 40)

      ctx.strokeStyle = "#CCCCCC"
      ctx.strokeRect(index * barWidth + 10, height - 70, barWidth - 20, 40)

      ctx.fillStyle = "#000000"
      ctx.font = "16px monospace"
      ctx.textAlign = "center"
      ctx.fillText(color.hex.toUpperCase(), index * barWidth + barWidth / 2, height - 45)

      // Draw color number
      ctx.fillStyle = "#666666"
      ctx.font = "14px Arial"
      ctx.fillText(`Color ${index + 1}`, index * barWidth + barWidth / 2, height - 20)
    })

    // Add timestamp
    ctx.fillStyle = "#999999"
    ctx.font = "12px Arial"
    ctx.textAlign = "right"
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, width - 20, height - 10)

    // Convert canvas to data URL
    console.log("Converting canvas to PNG...")
    const dataUrl = canvas.toDataURL("image/png")
    console.log("Data URL created, length:", dataUrl.length)

    // Create a link element for download
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = fileName
    link.style.display = "none"

    // Add to document, click, and remove
    document.body.appendChild(link)
    console.log("Triggering PNG download...")
    link.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      console.log("PNG download cleanup complete")
    }, 100)

    return true
  } catch (error) {
    console.error("Error in exportPaletteAsPng:", error)
    return false
  }
}

// Alternative download method using Blob URLs directly
export function downloadBlob(blob: Blob, fileName: string) {
  try {
    console.log("Downloading blob as:", fileName)

    // Create a URL for the blob
    const url = URL.createObjectURL(blob)
    console.log("Created blob URL:", url)

    // Create a link element
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.style.display = "none"

    // Add to document, click, and remove
    document.body.appendChild(link)
    console.log("Triggering blob download...")
    link.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log("Blob download cleanup complete")
    }, 100)

    return true
  } catch (error) {
    console.error("Error in downloadBlob:", error)
    return false
  }
}

