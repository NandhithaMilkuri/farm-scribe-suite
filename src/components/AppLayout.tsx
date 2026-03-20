import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "@/lib/auth";
import { LayoutDashboard, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import nutrantaLogo from "@/assets/nutranta-logo.png";

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    navigate("/login");
    return null;
  }

  const dashboardPath = `/${user.role}`;
  const isOnDashboard = location.pathname === dashboardPath;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleBadgeColor: Record<string, string> = {
    operator: "bg-accent text-accent-foreground",
    supervisor: "bg-primary text-primary-foreground",
    organizer: "bg-accent/80 text-accent-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="nav-bar sticky top-0 z-50">
        <div className="flex items-center gap-3 flex-1">
          <img src={nutrantaLogo} alt="Nutranta" className="h-8 w-auto" />
          {!isOnDashboard && (
            <Button variant="ghost" size="sm" className="btn-press gap-1.5" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button
            variant={isOnDashboard ? "secondary" : "ghost"}
            size="sm"
            className="btn-press gap-1.5"
            onClick={() => navigate(dashboardPath)}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline">/ {title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:inline">{user.fullName}</span>
          <Badge className={roleBadgeColor[user.role]}>{user.role}</Badge>
          <Button variant="ghost" size="sm" className="btn-press gap-1.5" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </nav>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
