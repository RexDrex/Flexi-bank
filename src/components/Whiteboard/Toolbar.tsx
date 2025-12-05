import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MousePointer2, 
  Pencil, 
  Square, 
  Circle, 
  Eraser, 
  Trash2, 
  Undo2 
} from "lucide-react";
import { Tool } from "./Canvas";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  activeTool: Tool;
  onToolClick: (tool: Tool) => void;
  onClear: () => void;
  onUndo: () => void;
}

export const Toolbar = ({ activeTool, onToolClick, onClear, onUndo }: ToolbarProps) => {
  const tools = [
    { id: "select" as Tool, icon: MousePointer2, label: "Select" },
    { id: "pen" as Tool, icon: Pencil, label: "Draw" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="toolbar-glass backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-float flex items-center gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon"
            onClick={() => onToolClick(tool.id)}
            className={cn(
              "relative transition-smooth hover:bg-primary/10 hover:text-primary rounded-xl",
              activeTool === tool.id && "bg-primary/15 text-primary"
            )}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />
            {activeTool === tool.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
            )}
          </Button>
        );
      })}
      
      <Separator orientation="vertical" className="h-8 mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        className="transition-smooth hover:bg-primary/10 hover:text-primary rounded-xl"
        title="Undo"
      >
        <Undo2 className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="transition-smooth hover:bg-destructive/10 hover:text-destructive rounded-xl"
        title="Clear Canvas"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
};
