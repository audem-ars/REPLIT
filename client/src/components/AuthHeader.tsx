import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserCircle, LogOut, Settings, Code } from 'lucide-react';

export default function AuthHeader() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Handle login
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  // Handle logout
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <span className="animate-pulse">Loading...</span>
      </Button>
    );
  }
  
  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Button onClick={handleLogin} variant="outline" size="sm">
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
    );
  }
  
  // Show user dropdown if authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 rounded-full" size="icon">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ''} alt={user?.username || 'User'} />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.username}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserCircle className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Code className="mr-2 h-4 w-4" />
          My Projects
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}