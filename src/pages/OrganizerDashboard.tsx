import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { getSharedData } from "@/lib/storage";
import { Users, IndianRupee, ClipboardList, MapPin } from "lucide-react";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const shared = getSharedData<any>();
  const farmers: any[] = shared.farmers || [];
  const payments: any[] = shared.farmerPayments || [];
  const paidCount = payments.filter((p: any) => p.status === "paid").length;

  const links = [
    { label: "Villages", icon: <MapPin className="h-5 w-5" />, path: "/villages" },
    { label: "Farmers", icon: <Users className="h-5 w-5" />, path: "/farmers" },
    { label: "Farmer Payments", icon: <IndianRupee className="h-5 w-5" />, path: "/farmer-payments" },
    { label: "Attendance", icon: <ClipboardList className="h-5 w-5" />, path: "/attendance" },
  ];

  return (
    <AppLayout title="Organizer Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashCard title="Total Farmers" value={farmers.length} icon={<Users className="h-5 w-5" />} />
        <DashCard title="Payments Completed" value={paidCount} icon={<IndianRupee className="h-5 w-5" />} />
        <DashCard title="Pending Payments" value={payments.filter((p: any) => p.status !== "paid").length} icon={<IndianRupee className="h-5 w-5" />} />
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
