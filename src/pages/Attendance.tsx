import AppLayout from "@/components/AppLayout";
import { getAllDataForRole } from "@/lib/storage";
import { getUsers, getCurrentUser } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";

export default function Attendance() {
  const user = getCurrentUser();
  const totalWorkingDays = 26;

  // Supervisor sees only own attendance
  // Organizer sees only organizer attendance
  // Operator sees all supervisor + organizer attendance
  const role = user?.role;

  const getAttendanceData = () => {
    if (role === "supervisor") {
      // Show only own attendance
      const myData = getAllDataForRole("supervisor").find((d) => d.username === user?.username);
      const reports: any[] = (myData?.data as any)?.dailyReports || [];
      const uniqueDays = new Set(reports.map((r: any) => r.date)).size;
      return [{ name: user?.fullName || "", username: user?.username || "", present: uniqueDays, role: "Supervisor" }];
    }

    if (role === "organizer") {
      // Show only own attendance
      const myData = getAllDataForRole("organizer").find((d) => d.username === user?.username);
      const checkIns: any[] = (myData?.data as any)?.dailyCheckIns || [];
      const uniqueDays = new Set(checkIns.map((r: any) => r.date)).size;
      return [{ name: user?.fullName || "", username: user?.username || "", present: uniqueDays, role: "Organizer" }];
    }

    // Operator sees all
    const supervisors = getUsers().filter((u) => u.role === "supervisor");
    const organizers = getUsers().filter((u) => u.role === "organizer");
    const allSupData = getAllDataForRole("supervisor");
    const allOrgData = getAllDataForRole("organizer");

    const supAttendance = supervisors.map((sup) => {
      const userData = allSupData.find((d) => d.username === sup.username);
      const reports: any[] = (userData?.data as any)?.dailyReports || [];
      const uniqueDays = new Set(reports.map((r: any) => r.date)).size;
      return { name: sup.fullName, username: sup.username, present: uniqueDays, role: "Supervisor" };
    });

    const orgAttendance = organizers.map((org) => {
      const userData = allOrgData.find((d) => d.username === org.username);
      const checkIns: any[] = (userData?.data as any)?.dailyCheckIns || [];
      const uniqueDays = new Set(checkIns.map((r: any) => r.date)).size;
      return { name: org.fullName, username: org.username, present: uniqueDays, role: "Organizer" };
    });

    return [...supAttendance, ...orgAttendance];
  };

  const attendanceData = getAttendanceData();

  return (
    <AppLayout title="Attendance">
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Total Working Days</th>
              <th className="py-2 pr-4">Days Present</th>
              <th className="py-2 pr-4 min-w-[120px]">Progress</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((a) => (
              <tr key={a.username} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium">{a.name}</td>
                <td className="py-3 pr-4">{a.role}</td>
                <td className="py-3 pr-4 font-mono-data">{totalWorkingDays}</td>
                <td className="py-3 pr-4 font-mono-data">{a.present}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Progress value={(a.present / totalWorkingDays) * 100} className="h-2 flex-1" />
                    <span className="font-mono-data text-xs">{Math.round((a.present / totalWorkingDays) * 100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {attendanceData.length === 0 && <tr><td colSpan={5} className="py-4 text-muted-foreground">No attendance data found.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
