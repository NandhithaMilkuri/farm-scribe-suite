import { useState } from "react";
import { Link } from "react-router-dom";
import { getUserByPhone, resetPasswordByPhone, sendOTP, verifyOTP } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import nutrantaLogo from "@/assets/nutranta-logo.png";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "reset">("phone");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
      toast({ title: "Error", description: "Enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    const user = getUserByPhone(phone.trim());
    if (!user) {
      toast({ title: "Error", description: "Phone number not registered.", variant: "destructive" });
      return;
    }
    setSending(true);
    const result = await sendOTP(phone.trim());
    setSending(false);
    if (result.success) {
      setStep("otp");
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${phone}.` });
    } else {
      toast({ title: "SMS Failed", description: result.error || "Could not send OTP. Please try again.", variant: "destructive" });
    }
  };

  const handleVerifyOtp = () => {
    if (!otpInput || otpInput.length !== 6) {
      toast({ title: "Error", description: "Enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    if (verifyOTP(phone.trim(), otpInput)) {
      setStep("reset");
      toast({ title: "OTP Verified" });
    } else {
      toast({ title: "Error", description: "Invalid or expired OTP. Please try again.", variant: "destructive" });
    }
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
        <div className="flex items-center gap-3 mb-6">
          <img src={nutrantaLogo} alt="Nutranta" className="h-12 w-auto" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Reset Password</h1>
            <p className="text-xs text-muted-foreground">Nutranta Field Operations</p>
          </div>
        </div>

        {step === "phone" && (
          <div className="space-y-4">
            <div>
              <Label>Registered Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter 10-digit phone number" type="tel" maxLength={10} />
            </div>
            <Button className="w-full btn-press gold-gradient text-primary-foreground font-semibold" onClick={handleSendOtp} disabled={sending}>
              {sending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : "Send OTP via SMS"}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-primary/10 border border-primary/30 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-foreground">OTP sent to +91 {phone}</p>
                <p className="text-muted-foreground text-xs">Check your SMS messages</p>
              </div>
            </div>
            <div>
              <Label>Enter OTP</Label>
              <Input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="6-digit OTP" maxLength={6} />
            </div>
            <Button className="w-full btn-press gold-gradient text-primary-foreground font-semibold" onClick={handleVerifyOtp}>Verify OTP</Button>
            <Button variant="ghost" className="w-full" onClick={() => { setStep("phone"); setOtpInput(""); }}>Change Number</Button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-primary/10 border border-primary/30 text-sm font-medium text-foreground">
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
            <Button className="w-full btn-press gold-gradient text-primary-foreground font-semibold" onClick={handleReset}>Reset Password</Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/login" className="text-primary hover:underline font-medium">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
