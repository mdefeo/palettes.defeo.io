"use client"

import { useState, useEffect } from "react"
import ColorBar from "./color-bar"
import { Button } from "@/components/ui/button"
import { PlusCircle, Copy, Wand2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateRandomColor, generateColorHarmony, type ColorHarmony } from "@/utils/color-theory"

export default function ColorPalette() {
  const [colors, setColors] = useState<Array<{ hex: string; locked: boolean }>>([])
  const [maxBars] = useState(7)
  const [initialBars] = useState(5)
  const [minBars] = useState(3)
  const [harmonyType, setHarmonyType] = useState<ColorHarmony>("random")
  const [isCopying, setIsCopying] = useState(false)

  // Initialize colors on first render
  useEffect(() => {
    const initialColors = Array(initialBars)
      .fill(null)
      .map(() => ({
        hex: generateRandomColor(),
        locked: false,
      }))
    setColors(initialColors)
  }, [initialBars])

  // Update a specific color
  const updateColor = (index: number, hex: string) => {
    const newColors = [...colors]
    newColors[index].hex = hex
    setColors(newColors)
  }

  // Toggle lock for a specific color
  const toggleLock = (index: number) => {
    const newColors = [...colors]
    newColors[index].locked = !newColors[index].locked
    setColors(newColors)
  }

  // Generate new colors based on color theory
  const regenerateColors = () => {
    if (harmonyType === "random") {
      const newColors = colors.map((color) => ({
        hex: color.locked ? color.hex : generateRandomColor(),
        locked: color.locked,
      }))
      setColors(newColors)
      return
    }

    // Find the first locked color to use as base, or use the first color
    const baseColorIndex = colors.findIndex((color) => color.locked)
    const baseColor = baseColorIndex >= 0 ? colors[baseColorIndex].hex : colors[0].hex

    // Count how many unlocked colors we need to generate
    const unlockedCount = colors.filter((color) => !color.locked).length

    if (unlockedCount === 0) {
      // All colors are locked, nothing to do
      return
    }

    // Generate harmony colors - we generate more than needed to ensure variety
    const harmonyColors = generateColorHarmony(baseColor, harmonyType, unlockedCount + 5)

    // Filter out any colors that are too similar to locked colors
    const filteredHarmonyColors = harmonyColors.filter((newColor) => {
      // Check if this color is too similar to any locked color
      return !colors.some((existingColor) => existingColor.locked && colorDistance(existingColor.hex, newColor) < 20)
    })

    // Apply new colors, keeping locked colors unchanged
    let harmonyIndex = 0
    const newColors = colors.map((color) => {
      if (color.locked) {
        return color
      } else {
        // Use the next available harmony color
        const newColor = filteredHarmonyColors[harmonyIndex % filteredHarmonyColors.length]
        harmonyIndex++
        return { hex: newColor, locked: false }
      }
    })

    setColors(newColors)
  }

  // Calculate color distance (simple Euclidean distance in RGB space)
  const colorDistance = (color1: string, color2: string): number => {
    // Convert hex to RGB
    const r1 = Number.parseInt(color1.slice(1, 3), 16)
    const g1 = Number.parseInt(color1.slice(3, 5), 16)
    const b1 = Number.parseInt(color1.slice(5, 7), 16)

    const r2 = Number.parseInt(color2.slice(1, 3), 16)
    const g2 = Number.parseInt(color2.slice(3, 5), 16)
    const b2 = Number.parseInt(color2.slice(5, 7), 16)

    // Calculate Euclidean distance
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2))
  }

  // Add a new color bar
  const addColorBar = () => {
    if (colors.length < maxBars) {
      // If using color theory, generate a new color that fits the harmony
      if (harmonyType !== "random" && colors.length > 0) {
        // Find the first locked color to use as base, or use the first color
        const baseColorIndex = colors.findIndex((color) => color.locked)
        const baseColor = baseColorIndex >= 0 ? colors[baseColorIndex].hex : colors[0].hex

        // Generate harmony colors for the new length
        const harmonyColors = generateColorHarmony(baseColor, harmonyType, colors.length + 3)

        // Filter out colors that are too similar to existing colors
        const filteredColor =
          harmonyColors.find(
            (newColor) => !colors.some((existingColor) => colorDistance(existingColor.hex, newColor) < 20),
          ) || harmonyColors[colors.length % harmonyColors.length]

        setColors([...colors, { hex: filteredColor, locked: false }])
      } else {
        setColors([...colors, { hex: generateRandomColor(), locked: false }])
      }
    }
  }

  // Remove a specific color bar
  const removeColorBar = (indexToRemove: number) => {
    if (colors.length > minBars) {
      setColors(colors.filter((_, index) => index !== indexToRemove))
    }
  }

  // Generate and copy CSS classes for all colors
  const copyCssClasses = async () => {
    try {
      setIsCopying(true)

      // Generate CSS content
      const cssClasses = colors
        .map((color, index) => {
          return `.color-${index + 1} {\n  background-color: ${color.hex};\n}`
        })
        .join("\n\n")

      // Copy to clipboard
      await navigator.clipboard.writeText(cssClasses)

      toast({
        title: "CSS Copied!",
        description: "CSS classes have been copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error copying CSS:", error)
      toast({
        title: "Copy Failed",
        description: "There was an error copying the CSS",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsCopying(false)
    }
  }

  // Apply color theory to generate a new palette
  const applyColorTheory = () => {
    regenerateColors()

    toast({
      title: `${harmonyType.charAt(0).toUpperCase() + harmonyType.slice(1)} Colors Generated!`,
      description: "Lock a color to use it as the base for future generations",
      duration: 3000,
    })
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-wrap justify-between items-center p-4 bg-gray-100 gap-2">
        <h1 className="text-2xl font-bold">Color Palette Generator</h1>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Select value={harmonyType} onValueChange={(value) => setHarmonyType(value as ColorHarmony)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Color Harmony" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="complementary">Complementary</SelectItem>
                <SelectItem value="analogous">Analogous</SelectItem>
                <SelectItem value="triadic">Triadic</SelectItem>
                <SelectItem value="split-complementary">Split Complementary</SelectItem>
                <SelectItem value="monochromatic">Monochromatic</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={applyColorTheory} className="flex items-center gap-1">
              <Wand2 className="h-4 w-4" />
              Apply
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCssClasses}
              disabled={isCopying}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy CSS
            </Button>

            {/* 
            // Commented out download options that aren't working
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  disabled={isExporting !== null}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={copyCssClasses} disabled={isExporting === 'copy'}>
                  {isExporting === 'copy' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy CSS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadCssFile} disabled={isExporting === 'css'}>
                  {isExporting === 'css' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download CSS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPng} disabled={isExporting === 'png'}>
                  {isExporting === 'png' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Export PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            */}

            <Button
              variant="outline"
              size="sm"
              onClick={addColorBar}
              disabled={colors.length >= maxBars}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add
            </Button>

            <Button variant="default" size="sm" onClick={regenerateColors}>
              Generate New Palette
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {colors.map((color, index) => (
          <ColorBar
            key={index}
            hex={color.hex}
            locked={color.locked}
            canRemove={colors.length > minBars}
            onColorChange={(hex) => updateColor(index, hex)}
            onToggleLock={() => toggleLock(index)}
            onRemove={() => removeColorBar(index)}
            onGenerateNew={() => {
              if (!color.locked) {
                if (harmonyType !== "random" && colors.some((c) => c.locked)) {
                  // Find the first locked color to use as base
                  const baseColorIndex = colors.findIndex((c) => c.locked)
                  const baseColor = colors[baseColorIndex].hex

                  // Generate harmony colors
                  const harmonyColors = generateColorHarmony(baseColor, harmonyType, colors.length + 3)

                  // Find a color that's not too similar to existing colors
                  const filteredColor =
                    harmonyColors.find(
                      (newColor) => !colors.some((existingColor) => colorDistance(existingColor.hex, newColor) < 20),
                    ) || harmonyColors[index % harmonyColors.length]

                  updateColor(index, filteredColor)
                } else {
                  updateColor(index, generateRandomColor())
                }
              }
            }}
          />
        ))}
      </div>
      <Toaster />
    </div>
  )
}

