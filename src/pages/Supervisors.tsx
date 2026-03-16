import AppLayout from "@/components/AppLayout";
import { getUsers } from "@/lib/auth";

export default function Supervisors() {
  const supervisors = getUsers().filter((u) => u.role === "supervisor");

  return (
    <AppLayout title="Supervisors">
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Username</th>
              <th className="py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((s) => (
              <tr key={s.username} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-4 font-medium">{s.fullName}</td>
                <td className="py-2.5 pr-4 font-mono-data">{s.username}</td>
                <td className="py-2.5 capitalize">{s.role}</td>
              </tr>
            ))}
            {supervisors.length === 0 && <tr><td colSpan={3} className="py-4 text-muted-foreground">No supervisors registered.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
