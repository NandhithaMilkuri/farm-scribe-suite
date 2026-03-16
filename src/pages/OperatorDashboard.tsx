import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { getAllDataForRole } from "@/lib/storage";
import { getUsers } from "@/lib/auth";
import { Users, Sprout, IndianRupee, MapPin, ClipboardList, Car, Wallet } from "lucide-react";

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const supervisors = getUsers().filter((u) => u.role === "supervisor");
  const allSupervisorData = getAllDataForRole("supervisor");

  // Calculate totals
  let totalYieldValue = 0;
  let pendingPayments = 0;
  const sharedRaw = localStorage.getItem("AFMS_SHARED");
  const shared = sharedRaw ? JSON.parse(sharedRaw) : {};
  const crops: any[] = shared.crops || [];
  crops.forEach((c: any) => {
    totalYieldValue += (c.yield || 0) * (c.price || 0);
    if (c.status !== "approved") pendingPayments++;
  });

  const totalReports = allSupervisorData.reduce((sum, s) => sum + ((s.data as any).dailyReports?.length || 0), 0);

  const links = [
    { label: "Villages", icon: <MapPin className="h-5 w-5" />, path: "/villages" },
    { label: "Supervisors", icon: <Users className="h-5 w-5" />, path: "/supervisors" },
    { label: "Farmers", icon: <Users className="h-5 w-5" />, path: "/farmers" },
    { label: "Crop Yield", icon: <Sprout className="h-5 w-5" />, path: "/crop-yield" },
    { label: "Attendance", icon: <ClipboardList className="h-5 w-5" />, path: "/attendance" },
    { label: "Travel Bills", icon: <Car className="h-5 w-5" />, path: "/travel-bills" },
    { label: "Salary Management", icon: <Wallet className="h-5 w-5" />, path: "/salary" },
  ];

  return (
    <AppLayout title="Operator Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashCard title="Supervisors" value={supervisors.length} icon={<Users className="h-5 w-5" />} />
        <DashCard title="Total Crop Value" value={`₹${totalYieldValue.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5" />} />
        <DashCard title="Pending Approvals" value={pendingPayments} icon={<Sprout className="h-5 w-5" />} />
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
