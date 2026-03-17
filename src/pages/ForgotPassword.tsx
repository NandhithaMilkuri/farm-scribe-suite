import { useState } from "react";
import { Link } from "react-router-dom";
import { getUserByPhone, resetPasswordByPhone } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "reset">("phone");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const sendOtp = () => {
    if (!phone.trim() || phone.trim().length < 10) {
      toast({ title: "Error", description: "Enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    const user = getUserByPhone(phone.trim());
    if (!user) {
      toast({ title: "Error", description: "Phone number not registered.", variant: "destructive" });
      return;
    }
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setStep("otp");
    toast({ title: "OTP Sent (Simulated)", description: `Your OTP is: ${otp}` });
  };

  const verifyOtp = () => {
    if (otpInput !== generatedOtp) {
      toast({ title: "Error", description: "Invalid OTP. Please try again.", variant: "destructive" });
      return;
    }
    setStep("reset");
    toast({ title: "OTP Verified" });
  };

  const handleReset = () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    const result = resetPasswordByPhone(phone.trim(), newPassword);
    if (result.success) {
      toast({ title: "Password Reset", description: "You can now login with your new password." });
      setPhone(""); setStep("phone"); setOtpInput(""); setNewPassword(""); setConfirmPassword("");
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="data-card w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Sprout className="h-6 w-6" /></div>
          <h1 className="text-xl font-semibold tracking-tight">Reset Password</h1>
        </div>

        {step === "phone" && (
          <div className="space-y-4">
            <div>
              <Label>Registered Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter 10-digit phone number" type="tel" maxLength={10} />
            </div>
            <Button className="w-full btn-press" onClick={sendOtp}>Send OTP</Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-primary">OTP sent to {phone}</p>
                <p className="text-muted-foreground text-xs">(Simulated — check the toast notification)</p>
              </div>
            </div>
            <div>
              <Label>Enter OTP</Label>
              <Input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="6-digit OTP" maxLength={6} />
            </div>
            <Button className="w-full btn-press" onClick={verifyOtp}>Verify OTP</Button>
            <Button variant="ghost" className="w-full" onClick={() => { setStep("phone"); setOtpInput(""); }}>Change Number</Button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20 text-sm text-primary font-medium">
              ✓ Phone verified. Set your new password.
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 4 characters" />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
            </div>
            <Button className="w-full btn-press" onClick={handleReset}>Reset Password</Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/login" className="text-primary underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
