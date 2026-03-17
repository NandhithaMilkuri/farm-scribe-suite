import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { getSharedData, getAllDataForRole } from "@/lib/storage";
import { getUsers, getMyOperator, getVillageAssignments } from "@/lib/auth";
import { Users, Sprout, IndianRupee, MapPin, ClipboardList, Car, Wallet, CalendarOff } from "lucide-react";

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const operatorNs = getMyOperator();

  // Only show users assigned to THIS operator
  const assignments = getVillageAssignments(operatorNs);
  const assignedSupUsernames = new Set(assignments.flatMap((a) => a.supervisors));
  const assignedOrgUsernames = new Set(assignments.flatMap((a) => a.organizers));
  const supervisors = getUsers().filter((u) => u.role === "supervisor" && assignedSupUsernames.has(u.username));
  const organizers = getUsers().filter((u) => u.role === "organizer" && assignedOrgUsernames.has(u.username));

  const shared = getSharedData<any>();
  const crops: any[] = shared.crops || [];
  let totalYieldValue = 0;
  let pendingPayments = 0;
  crops.forEach((c: any) => {
    totalYieldValue += c.totalValue || 0;
    if (c.status === "pending") pendingPayments++;
  });

  const links = [
    { label: "Villages & Assign", icon: <MapPin className="h-5 w-5" />, path: "/villages" },
    { label: "Supervisors", icon: <Users className="h-5 w-5" />, path: "/supervisors" },
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
