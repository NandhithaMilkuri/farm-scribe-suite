import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSharedData } from "@/lib/storage";
import { getMyOperator, getOperatorStaff, createStaffAccount, sendSMS } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Users, Sprout, IndianRupee, MapPin, ClipboardList, Car, Wallet, CalendarOff, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const operatorNs = getMyOperator();

  const staff = getOperatorStaff(operatorNs);
  const supervisors = staff.filter((u) => u.role === "supervisor");
  const organizers = staff.filter((u) => u.role === "organizer");

  const shared = getSharedData<any>();
  const crops: any[] = shared.crops || [];
  let totalYieldValue = 0;
  let pendingPayments = 0;
  crops.forEach((c: any) => {
    totalYieldValue += c.totalValue || 0;
    if (c.status === "pending") pendingPayments++;
  });

  // Staff creation form
  const [showForm, setShowForm] = useState(false);
  const [staffRole, setStaffRole] = useState<"supervisor" | "organizer">("supervisor");
  const [staffName, setStaffName] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  const handleCreateStaff = async () => {
    if (!staffName.trim() || !staffUsername.trim() || !staffPhone.trim() || !staffPassword) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(staffPhone.trim())) {
      toast({ title: "Error", description: "Enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    if (staffPassword.length < 4) {
      toast({ title: "Error", description: "Password must be at least 4 characters.", variant: "destructive" });
      return;
    }
    const result = createStaffAccount(operatorNs, {
      username: staffUsername.trim(),
      password: staffPassword,
      fullName: staffName.trim(),
      phone: staffPhone.trim(),
      role: staffRole,
    });
    if (result.success) {
      toast({ title: `${staffRole === "supervisor" ? "Supervisor" : "Organizer"} Created`, description: `${staffName.trim()} can now login.` });
      // Send SMS with credentials
      sendSMS(staffPhone.trim(), `Welcome to Nutranta! Your ${staffRole} account is ready.\nUsername: ${staffUsername.trim()}\nPassword: ${staffPassword}\nLogin at the app to get started.`);
      setStaffName(""); setStaffUsername(""); setStaffPhone(""); setStaffPassword("");
      setShowForm(false);
      window.location.reload();
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  };

  const links = [
    { label: "Villages & Assign", icon: <MapPin className="h-5 w-5" />, path: "/villages" },
    { label: "My Staff", icon: <Users className="h-5 w-5" />, path: "/supervisors" },
    { label: "Farmers", icon: <Users className="h-5 w-5" />, path: "/farmers" },
    { label: "Crop Yield", icon: <Sprout className="h-5 w-5" />, path: "/crop-yield" },
    { label: "Attendance", icon: <ClipboardList className="h-5 w-5" />, path: "/attendance" },
    { label: "Travel Bills", icon: <Car className="h-5 w-5" />, path: "/travel-bills" },
    { label: "Supervisor Salary", icon: <Wallet className="h-5 w-5" />, path: "/salary" },
    { label: "Leave Approvals", icon: <CalendarOff className="h-5 w-5" />, path: "/leaves" },
  ];

  return (
    <AppLayout title="Operator Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DashCard title="Supervisors" value={supervisors.length} icon={<Users className="h-5 w-5" />} />
        <DashCard title="Organizers" value={organizers.length} icon={<Users className="h-5 w-5" />} />
        <DashCard title="Total Crop Value" value={`₹${totalYieldValue.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5" />} />
        <DashCard title="Pending Approvals" value={pendingPayments} icon={<Sprout className="h-5 w-5" />} />
      </div>

      {/* Staff Management */}
      <div className="data-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Staff Management</h2>
          <Button size="sm" className="btn-press gap-1.5" onClick={() => setShowForm(!showForm)}>
            <UserPlus className="h-4 w-4" /> Add Staff
          </Button>
        </div>

        {showForm && (
          <div className="border border-border rounded-lg p-4 mb-4 space-y-3 bg-secondary/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <Select value={staffRole} onValueChange={(v) => setStaffRole(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Staff full name" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Username</Label>
                <Input value={staffUsername} onChange={(e) => setStaffUsername(e.target.value)} placeholder="Login username" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} placeholder="10-digit number" maxLength={10} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} placeholder="Initial password" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="btn-press gap-1.5" onClick={handleCreateStaff}>
                <UserPlus className="h-4 w-4" /> Create Account
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              SMS with login credentials will be sent to the staff member's phone.
            </p>
          </div>
        )}

        {staff.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Username</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.username} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{s.fullName}</td>
                    <td className="py-2.5 pr-3 font-mono-data">{s.username}</td>
                    <td className="py-2.5 pr-3 font-mono-data">{s.phone}</td>
                    <td className="py-2.5">
                      <Badge variant={s.role === "supervisor" ? "default" : "secondary"} className="capitalize">{s.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {staff.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">No staff created yet. Click "Add Staff" to create supervisor or organizer accounts.</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {links.map((l) => (
          <Button key={l.path} variant="outline" className="h-auto py-4 flex flex-col gap-2 btn-press" onClick={() => navigate(l.path)}>
            <span className="text-primary">{l.icon}</span>
            <span className="text-sm font-medium">{l.label}</span>
          </Button>
        ))}
      </div>
    </AppLayout>
  );
}
