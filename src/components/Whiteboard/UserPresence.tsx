import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  color: string;
}

interface UserPresenceProps {
  users: User[];
}

export const UserPresence = ({ users }: UserPresenceProps) => {
  if (users.length === 0) return null;

  return (
    <div className="toolbar-glass backdrop-blur-xl border border-border/50 rounded-2xl p-3 shadow-float">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Active</span>
        <div className="flex -space-x-2">
          {users.map((user, index) => (
            <Avatar
              key={user.id}
              className={cn(
                "w-8 h-8 border-2 border-white shadow-sm transition-smooth hover:z-10 hover:scale-110",
                index > 0 && "ml-0"
              )}
              style={{ borderColor: user.color }}
            >
              <AvatarFallback 
                className="text-xs font-semibold"
                style={{ backgroundColor: user.color + "20", color: user.color }}
              >
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        {users.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">{users.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
