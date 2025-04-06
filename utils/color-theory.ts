// Convert hex to HSL
export function hexToHSL(hex: string): [number, number, number] {
  // Remove the # if present
  hex = hex.replace(/^#/, "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Generate a random hex color
export function generateRandomColor(): string {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Color theory functions
export type ColorHarmony =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "monochromatic"
  | "random"

export function generateColorHarmony(baseColor: string, harmonyType: ColorHarmony, count = 5): string[] {
  // Convert base color to HSL for easier manipulation
  const [h, s, l] = hexToHSL(baseColor)

  switch (harmonyType) {
    case "complementary":
      return generateComplementaryColors(h, s, l, count)
    case "analogous":
      return generateAnalogousColors(h, s, l, count)
    case "triadic":
      return generateTriadicColors(h, s, l, count)
    case "split-complementary":
      return generateSplitComplementaryColors(h, s, l, count)
    case "monochromatic":
      return generateMonochromaticColors(h, s, l, count)
    case "random":
    default:
      return Array(count)
        .fill(0)
        .map(() => generateRandomColor())
  }
}

// Generate complementary colors (opposite on the color wheel)
function generateComplementaryColors(h: number, s: number, l: number, count: number): string[] {
  const complementary = (h + 180) % 360

  // If we only need 2 colors, return the base and its complement
  if (count === 2) {
    return [hslToHex(h, s, l), hslToHex(complementary, s, l)]
  }

  // For more colors, add variations around the base and complement
  const colors: string[] = []

  // Add the base color
  colors.push(hslToHex(h, s, l))

  // Add variations between the base and complement
  const step = 180 / (count - 1)

  for (let i = 1; i < count; i++) {
    // Vary the hue
    const hue = (h + i * step) % 360

    // Vary saturation and lightness slightly for more variety
    const sat = Math.min(100, Math.max(30, s + (Math.random() * 20 - 10)))
    const light = Math.min(80, Math.max(30, l + (Math.random() * 20 - 10)))

    colors.push(hslToHex(hue, sat, light))
  }

  return colors
}

// Generate analogous colors (adjacent on the color wheel)
function generateAnalogousColors(h: number, s: number, l: number, count: number): string[] {
  const colors: string[] = []
  const range = 60 // Total range in degrees

  // Calculate the step size based on the range and count
  const step = range / (count - 1)

  // Start from the left edge of the range
  const startHue = (h - range / 2 + 360) % 360

  for (let i = 0; i < count; i++) {
    const hue = (startHue + i * step) % 360

    // Vary saturation and lightness slightly for more variety
    const sat = Math.min(100, Math.max(30, s + (Math.random() * 20 - 10)))
    const light = Math.min(80, Math.max(30, l + (Math.random() * 20 - 10)))

    colors.push(hslToHex(hue, sat, light))
  }

  return colors
}

// Generate triadic colors (evenly spaced around the color wheel)
function generateTriadicColors(h: number, s: number, l: number, count: number): string[] {
  const colors: string[] = []

  // If we need exactly 3 colors, use perfect triadic harmony
  if (count === 3) {
    return [hslToHex(h, s, l), hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)]
  }

  // For more colors, distribute them evenly with some variation
  const step = 360 / count

  for (let i = 0; i < count; i++) {
    const hue = (h + i * step) % 360

    // Vary saturation and lightness slightly for more variety
    const sat = Math.min(100, Math.max(30, s + (Math.random() * 20 - 10)))
    const light = Math.min(80, Math.max(30, l + (Math.random() * 20 - 10)))

    colors.push(hslToHex(hue, sat, light))
  }

  return colors
}

// Generate split-complementary colors
function generateSplitComplementaryColors(h: number, s: number, l: number, count: number): string[] {
  const complementary = (h + 180) % 360
  const splitAngle = 30

  // If we need exactly 3 colors, use perfect split-complementary
  if (count === 3) {
    return [
      hslToHex(h, s, l),
      hslToHex((complementary - splitAngle + 360) % 360, s, l),
      hslToHex((complementary + splitAngle) % 360, s, l),
    ]
  }

  // For more colors, distribute them with emphasis on the split complements
  const colors: string[] = []

  // Add the base color
  colors.push(hslToHex(h, s, l))

  // Add the two split complements
  colors.push(hslToHex((complementary - splitAngle + 360) % 360, s, l))
  colors.push(hslToHex((complementary + splitAngle) % 360, s, l))

  // If we need more colors, add variations
  if (count > 3) {
    // Add variations between the base and the split complements
    const remainingCount = count - 3
    const step1 = (180 - splitAngle) / (remainingCount / 2 + 1)
    const step2 = (180 - splitAngle) / (remainingCount / 2 + 1)

    // Add colors between base and first split complement
    for (let i = 1; i <= Math.floor(remainingCount / 2); i++) {
      const hue = (h + i * step1) % 360
      const sat = Math.min(100, Math.max(30, s + (Math.random() * 20 - 10)))
      const light = Math.min(80, Math.max(30, l + (Math.random() * 20 - 10)))
      colors.push(hslToHex(hue, sat, light))
    }

    // Add colors between base and second split complement
    for (let i = 1; i <= Math.ceil(remainingCount / 2); i++) {
      const hue = (h - i * step2 + 360) % 360
      const sat = Math.min(100, Math.max(30, s + (Math.random() * 20 - 10)))
      const light = Math.min(80, Math.max(30, l + (Math.random() * 20 - 10)))
      colors.push(hslToHex(hue, sat, light))
    }
  }

  return colors
}

// Generate monochromatic colors (variations of the same hue)
function generateMonochromaticColors(h: number, s: number, l: number, count: number): string[] {
  const colors: string[] = []

  // Vary lightness for monochromatic scheme
  const lightnessStep = 70 / (count - 1)
  const startLightness = 15

  for (let i = 0; i < count; i++) {
    const lightness = startLightness + i * lightnessStep

    // Vary saturation slightly for more variety
    const sat = Math.min(100, Math.max(30, s + (Math.random() * 10 - 5)))

    colors.push(hslToHex(h, sat, lightness))
  }

  return colors
}

