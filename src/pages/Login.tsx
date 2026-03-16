import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, seedDemoUsers } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useState(() => { seedDemoUsers(); });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const result = loginUser(username.trim(), password);
    if (result.success && result.user) {
      navigate(`/${result.user.role}`);
    } else {
      toast({ title: "Login Failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="data-card w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Sprout className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Field Operations</h1>
            <p className="text-xs text-muted-foreground">Agriculture Management System</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <Button type="submit" className="w-full btn-press">Sign In</Button>
        </form>
        <div className="flex justify-between text-sm text-muted-foreground mt-4">
          <Link to="/forgot-password" className="text-primary underline">Forgot Password?</Link>
          <Link to="/register" className="text-primary underline">Register</Link>
        </div>
        <div className="mt-4 p-3 rounded-md bg-secondary text-xs text-muted-foreground">
          <p className="font-medium mb-1">Demo Accounts (password: pass123)</p>
          <p>nandhitha / arun (operator) · ramesh / suresh (supervisor) · priya / kavitha (organizer)</p>
        </div>
      </div>
    </div>
  );
}
