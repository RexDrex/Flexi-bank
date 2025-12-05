import { Button } from "@/components/ui/button";
import { Share2, Download, Menu } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  onExport: () => void;
  onShare: () => void;
  onMenuClick: () => void;
}

export const Header = ({ onExport, onShare, onMenuClick }: HeaderProps) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-xl font-bold text-white">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Collaborative Whiteboard</h1>
              <p className="text-xs text-muted-foreground">Real-time collaboration space</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onShare}
            className="toolbar-glass backdrop-blur-xl border border-border/50 shadow-soft hover:shadow-float transition-smooth"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onExport}
            className="toolbar-glass backdrop-blur-xl border border-border/50 shadow-soft hover:shadow-float transition-smooth"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onMenuClick}
            className="toolbar-glass backdrop-blur-xl border border-border/50 shadow-soft hover:shadow-float transition-smooth"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
