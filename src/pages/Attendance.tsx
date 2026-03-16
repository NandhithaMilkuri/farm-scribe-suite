import AppLayout from "@/components/AppLayout";
import { getAllDataForRole } from "@/lib/storage";
import { getUsers } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";

export default function Attendance() {
  const supervisors = getUsers().filter((u) => u.role === "supervisor");
  const allSupervisorData = getAllDataForRole("supervisor");
  const totalWorkingDays = 26; // assumed monthly

  const attendanceData = supervisors.map((sup) => {
    const userData = allSupervisorData.find((d) => d.username === sup.username);
    const reports: any[] = (userData?.data as any)?.dailyReports || [];
    const uniqueDays = new Set(reports.map((r: any) => r.date)).size;
    return { name: sup.fullName, username: sup.username, totalDays: totalWorkingDays, present: uniqueDays };
  });

  return (
    <AppLayout title="Attendance">
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Total Working Days</th>
              <th className="py-2 pr-4">Days Present</th>
              <th className="py-2 pr-4 min-w-[120px]">Progress</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((a) => (
              <tr key={a.username} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium">{a.name}</td>
                <td className="py-3 pr-4 font-mono-data">{a.totalDays}</td>
                <td className="py-3 pr-4 font-mono-data">{a.present}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Progress value={(a.present / a.totalDays) * 100} className="h-2 flex-1" />
                    <span className="font-mono-data text-xs">{Math.round((a.present / a.totalDays) * 100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {attendanceData.length === 0 && <tr><td colSpan={4} className="py-4 text-muted-foreground">No supervisors found.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
