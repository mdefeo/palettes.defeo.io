"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColorPickerModalProps {
  initialColor: string
  onClose: () => void
  onColorChange: (color: string) => void
}

export default function ColorPickerModal({ initialColor, onClose, onColorChange }: ColorPickerModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [color, setColor] = useState(initialColor)
  const modalRef = useRef<HTMLDivElement>(null)
  const colorAreaRef = useRef<HTMLDivElement>(null)
  const colorSliderRef = useRef<HTMLDivElement>(null)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 })
  const [sliderPosition, setSliderPosition] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Center the modal immediately when it mounts
  useEffect(() => {
    const centerModal = () => {
      if (modalRef.current && typeof window !== "undefined") {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const modalWidth = modalRef.current.offsetWidth
        const modalHeight = modalRef.current.offsetHeight

        setPosition({
          x: Math.max(0, (viewportWidth - modalWidth) / 2),
          y: Math.max(0, (viewportHeight - modalHeight) / 2),
        })
        setIsInitialized(true)
      }
    }

    // Center immediately and also after a short delay to ensure dimensions are correct
    centerModal()

    // Use requestAnimationFrame to ensure the DOM has been painted
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(centerModal)
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [])

  // Initialize color values
  useEffect(() => {
    if (!isInitialized) return

    // Parse initial color to set HSL values
    if (initialColor.startsWith("#")) {
      const r = Number.parseInt(initialColor.slice(1, 3), 16) / 255
      const g = Number.parseInt(initialColor.slice(3, 5), 16) / 255
      const b = Number.parseInt(initialColor.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const l = (max + min) / 2

      let h = 0
      let s = 0

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

      setHue(h)
      setSaturation(s * 100)
      setLightness(l * 100)

      // Set initial picker position
      if (colorAreaRef.current) {
        const width = colorAreaRef.current.offsetWidth
        const height = colorAreaRef.current.offsetHeight
        setPickerPosition({
          x: s * width,
          y: (1 - l) * height,
        })
      }

      // Set initial slider position
      if (colorSliderRef.current) {
        const height = colorSliderRef.current.offsetHeight
        setSliderPosition((h / 360) * height)
      }
    }
  }, [initialColor, isInitialized, colorAreaRef.current, colorSliderRef.current])

  // Handle dragging the modal
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".modal-header")) {
      setIsDragging(true)
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle color area click/drag
  const handleColorAreaClick = (e: React.MouseEvent) => {
    if (colorAreaRef.current) {
      const rect = colorAreaRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

      setPickerPosition({ x, y })

      // Calculate saturation and lightness
      const s = (x / rect.width) * 100
      const l = (1 - y / rect.height) * 100

      setSaturation(s)
      setLightness(l)

      // Update color
      updateColor(hue, s, l)
    }
  }

  // Handle color slider click/drag
  const handleColorSliderClick = (e: React.MouseEvent) => {
    if (colorSliderRef.current) {
      const rect = colorSliderRef.current.getBoundingClientRect()
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

      setSliderPosition(y)

      // Calculate hue
      const h = (y / rect.height) * 360

      setHue(h)

      // Update color
      updateColor(h, saturation, lightness)
    }
  }

  // Update the updateColor function to immediately pass color changes to the parent
  const updateColor = (h: number, s: number, l: number) => {
    // Convert HSL to HEX
    const hslToRgb = (h: number, s: number, l: number) => {
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

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
    }

    const [r, g, b] = hslToRgb(h, s, l)
    const toHex = (x: number) => {
      const hex = x.toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    setColor(hex)
    onColorChange(hex) // Apply color change immediately
  }

  // Update the handleHexChange function to apply changes immediately
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (!value.startsWith("#")) {
      value = "#" + value
    }
    setColor(value)

    // Only update if it's a valid hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      onColorChange(value)
    }
  }

  // Generate random color
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let randomColor = "#"
    for (let i = 0; i < 6; i++) {
      randomColor += letters[Math.floor(Math.random() * 16)]
    }
    setColor(randomColor)
    onColorChange(randomColor)
  }

  // Update the color area click/drag handler to support dragging
  const handleColorAreaMouseDown = (e: React.MouseEvent) => {
    handleColorAreaClick(e)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (colorAreaRef.current) {
        const rect = colorAreaRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width))
        const y = Math.max(0, Math.min(moveEvent.clientY - rect.top, rect.height))

        setPickerPosition({ x, y })

        // Calculate saturation and lightness
        const s = (x / rect.width) * 100
        const l = (1 - y / rect.height) * 100

        setSaturation(s)
        setLightness(l)

        // Update color
        updateColor(hue, s, l)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Update the color slider click/drag handler to support dragging
  const handleColorSliderMouseDown = (e: React.MouseEvent) => {
    handleColorSliderClick(e)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (colorSliderRef.current) {
        const rect = colorSliderRef.current.getBoundingClientRect()
        const y = Math.max(0, Math.min(moveEvent.clientY - rect.top, rect.height))

        setSliderPosition(y)

        // Calculate hue
        const h = (y / rect.height) * 360

        setHue(h)

        // Update color
        updateColor(h, saturation, lightness)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-[320px] absolute"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "auto",
          opacity: isInitialized ? 1 : 0,
          transition: "opacity 0.1s ease-in-out",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="modal-header flex items-center justify-between p-3 cursor-grab border-b">
          <h3 className="text-base font-medium">Color Picker</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="flex gap-3">
            {/* Color area */}
            <div
              ref={colorAreaRef}
              className="relative w-full h-[220px] rounded-lg cursor-crosshair"
              style={{
                background: `linear-gradient(to bottom, rgba(255,255,255,0), #000), 
                             linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
              }}
              onClick={handleColorAreaClick}
              onMouseDown={handleColorAreaMouseDown}
            >
              {/* Color picker handle */}
              <div
                className="absolute w-5 h-5 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md"
                style={{
                  left: pickerPosition.x,
                  top: pickerPosition.y,
                  backgroundColor: color,
                }}
              ></div>
            </div>

            {/* Hue slider */}
            <div
              ref={colorSliderRef}
              className="relative w-6 h-[220px] rounded-lg cursor-pointer"
              style={{
                background: `linear-gradient(to bottom, 
                  #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
              }}
              onClick={handleColorSliderClick}
              onMouseDown={handleColorSliderMouseDown}
            >
              {/* Slider handle */}
              <div
                className="absolute w-6 h-2 left-0 -translate-y-1/2 border border-white"
                style={{ top: sliderPosition }}
              ></div>
            </div>
          </div>

          <div className="mt-3 flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={color}
                onChange={handleHexChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <Button size="sm" variant="outline" onClick={generateRandomColor}>
              Random
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

