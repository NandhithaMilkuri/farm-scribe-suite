import AppLayout from "@/components/AppLayout";
import { getMyOperator, getOperatorStaff } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export default function Supervisors() {
  const operatorNs = getMyOperator();
  const staff = getOperatorStaff(operatorNs);

  return (
    <AppLayout title="My Staff">
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Username</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.username} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-4 font-medium">{s.fullName}</td>
                <td className="py-2.5 pr-4 font-mono-data">{s.username}</td>
                <td className="py-2.5 pr-4 font-mono-data">{s.phone}</td>
                <td className="py-2.5">
                  <Badge variant={s.role === "supervisor" ? "default" : "secondary"} className="capitalize">{s.role}</Badge>
                </td>
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan={4} className="py-4 text-muted-foreground">No staff created. Go to Dashboard to add supervisors and organizers.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
