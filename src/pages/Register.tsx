import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, type UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !phone.trim() || !password || !role) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (phone.trim().length !== 10 || !/^\d{10}$/.test(phone.trim())) {
      toast({ title: "Validation Error", description: "Enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    if (password.length < 4) {
      toast({ title: "Validation Error", description: "Password must be at least 4 characters.", variant: "destructive" });
      return;
    }
    const result = registerUser({ username: username.trim(), password, role: role as UserRole, fullName: fullName.trim(), phone: phone.trim() });
    if (result.success) {
      toast({ title: "Registration Successful", description: "Please login." });
      navigate("/login");
    } else {
      toast({ title: "Registration Failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="data-card w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Sprout className="h-6 w-6" /></div>
          <h1 className="text-xl font-semibold tracking-tight">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose username" />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit phone number" type="tel" maxLength={10} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 4 characters" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full btn-press">Register</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already registered? <Link to="/login" className="text-primary underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
