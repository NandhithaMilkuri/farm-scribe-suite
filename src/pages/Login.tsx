import { useState, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser, type UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import nutrantaLogo from "@/assets/nutranta-logo.png";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

const roleLabels: Record<string, string> = {
  operator: "Operator",
  supervisor: "Supervisor",
  organizer: "Organizer",
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") as UserRole | null;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (parseInt(captchaInput) !== captcha.answer) {
      toast({ title: "CAPTCHA Failed", description: "Please solve the math problem correctly.", variant: "destructive" });
      refreshCaptcha();
      return;
    }
    const result = loginUser(username.trim(), password);
    if (result.success && result.user) {
      if (role && result.user.role !== role) {
        toast({ title: "Access Denied", description: `This account is not registered as ${roleLabels[role] || role}.`, variant: "destructive" });
        refreshCaptcha();
        return;
      }
      navigate(`/${result.user.role}`);
    } else {
      toast({ title: "Login Failed", description: result.error, variant: "destructive" });
      refreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="data-card w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <img src={nutrantaLogo} alt="Nutranta" className="h-12 w-auto" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {role ? `${roleLabels[role]} Login` : "Sign In"}
            </h1>
            <p className="text-xs text-muted-foreground">Nutranta Field Operations</p>
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
          <div>
            <Label>Security Check</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm font-mono-data font-semibold text-center select-none">
                {captcha.question}
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={refreshCaptcha} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Input className="mt-2" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Enter answer" type="number" />
          </div>
          <Button type="submit" className="w-full btn-press gold-gradient text-primary-foreground font-semibold">
            Sign In
          </Button>
        </form>

        <div className="flex justify-between text-sm text-muted-foreground mt-4">
          <Link to="/forgot-password" className="text-primary hover:underline font-medium">Forgot Password?</Link>
          <Link to={`/register${role ? `?role=${role}` : ""}`} className="text-primary hover:underline font-medium">Register</Link>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" /> Change Role
          </Button>
        </div>
      </div>
    </div>
  );
}
