import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { getSharedData, getUserData, setUserData } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Users, IndianRupee, ClipboardList, MapPin, CalendarCheck, CalendarOff } from "lucide-react";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const shared = getSharedData<any>();
  const crops: any[] = shared.crops || [];
  const fundedForPayment = crops.filter((c: any) => c.status === "approved").length;
  const paidCount = crops.filter((c: any) => c.status === "funded").length;
  const totalCommission = crops.filter((c: any) => c.status === "funded").reduce((s: number, c: any) => s + (c.commission || 0), 0);

  const data = getUserData<any>();
  const checkIns: any[] = data.dailyCheckIns || [];
  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = checkIns.some((c: any) => c.date === today);

  const handleCheckIn = () => {
    if (checkedInToday) { toast({ title: "Already checked in today" }); return; }
    const updated = [...checkIns, { id: Date.now().toString(), date: today }];
    setUserData({ dailyCheckIns: updated });
    toast({ title: "Checked in for today!" });
    window.location.reload();
  };

  const links = [
    { label: "Villages", icon: <MapPin className="h-5 w-5" />, path: "/villages" },
    { label: "Farmers", icon: <Users className="h-5 w-5" />, path: "/farmers" },
    { label: "Farmer Payments", icon: <IndianRupee className="h-5 w-5" />, path: "/farmer-payments" },
    { label: "My Attendance", icon: <ClipboardList className="h-5 w-5" />, path: "/attendance" },
    { label: "Apply Leave", icon: <CalendarOff className="h-5 w-5" />, path: "/leaves" },
  ];

  return (
    <AppLayout title="Organizer Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DashCard title="Ready to Pay" value={fundedForPayment} icon={<IndianRupee className="h-5 w-5" />} />
        <DashCard title="Payments Sent" value={paidCount} icon={<IndianRupee className="h-5 w-5" />} />
        <DashCard title="Total Commission" value={`₹${totalCommission.toLocaleString("en-IN")}`} icon={<IndianRupee className="h-5 w-5" />} />
        <DashCard title="Days Present" value={checkIns.length} icon={<CalendarCheck className="h-5 w-5" />} />
      </div>

      {!checkedInToday && (
        <div className="data-card mb-4 flex items-center justify-between">
          <p className="text-sm">You haven't checked in today.</p>
          <Button className="btn-press gap-1.5" onClick={handleCheckIn}><CalendarCheck className="h-4 w-4" /> Check In</Button>
        </div>
      )}
      {checkedInToday && (
        <div className="data-card mb-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-primary font-medium">✓ Checked in for today ({today})</p>
        </div>
      )}

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
