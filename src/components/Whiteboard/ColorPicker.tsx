import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const colors = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#EC4899", label: "Pink" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#10B981", label: "Emerald" },
  { value: "#F97316", label: "Orange" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#000000", label: "Black" },
];

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-glass backdrop-blur-xl border border-border/50 rounded-2xl shadow-float hover:shadow-float hover:bg-primary/5 transition-smooth"
          title="Choose Color"
        >
          <div className="relative">
            <Palette className="w-5 h-5" />
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Select Color</h4>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  onChange(c.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-10 h-10 rounded-xl transition-smooth hover:scale-110 hover:shadow-md",
                  color === c.value && "ring-2 ring-primary ring-offset-2 scale-105"
                )}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
          <div className="pt-2 border-t">
            <label className="text-xs text-muted-foreground mb-2 block">Custom Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
