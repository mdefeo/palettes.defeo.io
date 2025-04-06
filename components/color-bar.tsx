"use client"

import { useState } from "react"
import { Copy, Lock, Unlock, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ColorPickerModal from "./color-picker-modal"

interface ColorBarProps {
  hex: string
  locked: boolean
  canRemove: boolean
  onColorChange: (hex: string) => void
  onToggleLock: () => void
  onRemove: () => void
  onGenerateNew: () => void
}

export default function ColorBar({
  hex,
  locked,
  canRemove,
  onColorChange,
  onToggleLock,
  onRemove,
  onGenerateNew,
}: ColorBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Handle copying the hex value to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex)
    toast({
      title: "Copied!",
      description: `${hex} has been copied to clipboard`,
      duration: 2000,
    })
  }

  // Handle click on hex value
  const handleHexClick = () => {
    if (!locked) {
      setShowColorPicker(true)
    }
  }

  // Handle color change from picker
  const handleColorChange = (newColor: string) => {
    onColorChange(newColor)
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: hex }}>
      <div className="flex-1"></div>
      <div className="bg-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm cursor-pointer select-none" onClick={handleHexClick}>
            {hex.toUpperCase()}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8" title="Copy hex value">
              <Copy className="h-4 w-4" />
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onToggleLock} className="h-8 w-8">
                    {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{locked ? "Unlock this color" : "Lock this color to use as base for color theory"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              onClick={onGenerateNew}
              className="h-8 w-8"
              disabled={locked}
              title="Generate new color"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8"
              disabled={!canRemove}
              title={canRemove ? "Remove color" : "Minimum 3 colors required"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Toaster />

      {showColorPicker && (
        <ColorPickerModal
          initialColor={hex}
          onClose={() => setShowColorPicker(false)}
          onColorChange={handleColorChange}
        />
      )}
    </div>
  )
}

