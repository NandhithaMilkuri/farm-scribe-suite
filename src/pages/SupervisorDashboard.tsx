import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/storage";
import { ClipboardList, Car, Users, Sprout, MapPin } from "lucide-react";

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const data = getUserData<any>();
  const reports: any[] = data.dailyReports || [];
  const travelEntries: any[] = data.travelBills || [];

  const uniqueDays = new Set(reports.map((r: any) => r.date)).size;
  const totalDistance = travelEntries.reduce((s: number, t: any) => s + ((t.endKm || 0) - (t.startKm || 0)), 0);

  const links = [
    { label: "Daily Reports", icon: <ClipboardList className="h-5 w-5" />, path: "/daily-reports" },
    { label: "Travel & Allowance", icon: <Car className="h-5 w-5" />, path: "/travel-bills" },
    { label: "Farmers", icon: <Users className="h-5 w-5" />, path: "/farmers" },
    { label: "Crop Yield", icon: <Sprout className="h-5 w-5" />, path: "/crop-yield" },
    { label: "Villages", icon: <MapPin className="h-5 w-5" />, path: "/villages" },
    { label: "Attendance", icon: <ClipboardList className="h-5 w-5" />, path: "/attendance" },
  ];

  return (
    <AppLayout title="Supervisor Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashCard title="Days Present" value={uniqueDays} icon={<ClipboardList className="h-5 w-5" />} />
        <DashCard title="Total Distance" value={`${totalDistance.toLocaleString()} km`} icon={<Car className="h-5 w-5" />} />
        <DashCard title="Reports Submitted" value={reports.length} icon={<Sprout className="h-5 w-5" />} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
