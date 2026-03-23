import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyOperator, getOperatorStaff, getUsers, User } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Supervisors() {
  const { toast } = useToast();
  const operatorNs = getMyOperator();
  const [staff, setStaff] = useState<User[]>(getOperatorStaff(operatorNs));
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const startEdit = (s: User) => {
    setEditingUsername(s.username);
    setEditName(s.fullName);
    setEditPhone(s.phone);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editPhone.trim()) {
      toast({ title: "Error", description: "Name and phone required.", variant: "destructive" });
      return;
    }
    const allUsers = getUsers();
    const idx = allUsers.findIndex((u) => u.username === editingUsername);
    if (idx >= 0) {
      allUsers[idx].fullName = editName.trim();
      allUsers[idx].phone = editPhone.trim();
      localStorage.setItem("AFMS_USERS", JSON.stringify(allUsers));
    }
    setStaff(getOperatorStaff(operatorNs));
    setEditingUsername(null);
    toast({ title: "Staff Updated" });
  };

  const deleteStaff = (username: string) => {
    if (!confirm("Delete this staff member? They won't be able to login.")) return;
    const allUsers = getUsers();
    const updated = allUsers.filter((u) => u.username !== username);
    localStorage.setItem("AFMS_USERS", JSON.stringify(updated));
    // Remove from operator map
    const map = JSON.parse(localStorage.getItem("AFMS_OPERATOR_MAP") || "{}");
    delete map[username];
    localStorage.setItem("AFMS_OPERATOR_MAP", JSON.stringify(map));
    setStaff(getOperatorStaff(operatorNs));
    toast({ title: "Staff Deleted" });
  };

  return (
    <AppLayout title="My Staff">
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Username</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.username} className="border-b border-border last:border-0">
                {editingUsername === s.username ? (
                  <>
                    <td className="py-2 pr-4"><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" /></td>
                    <td className="py-2.5 pr-4 font-mono-data">{s.username}</td>
                    <td className="py-2 pr-4"><Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="h-8" maxLength={10} /></td>
                    <td className="py-2.5"><Badge variant={s.role === "supervisor" ? "default" : "secondary"} className="capitalize">{s.role}</Badge></td>
                    <td className="py-2 flex gap-1">
                      <Button size="sm" variant="ghost" onClick={saveEdit}><Check className="h-4 w-4 text-primary" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingUsername(null)}><X className="h-4 w-4" /></Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2.5 pr-4 font-medium">{s.fullName}</td>
                    <td className="py-2.5 pr-4 font-mono-data">{s.username}</td>
                    <td className="py-2.5 pr-4 font-mono-data">{s.phone}</td>
                    <td className="py-2.5"><Badge variant={s.role === "supervisor" ? "default" : "secondary"} className="capitalize">{s.role}</Badge></td>
                    <td className="py-2.5 flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteStaff(s.username)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan={5} className="py-4 text-muted-foreground">No staff created. Go to Dashboard to add supervisors and organizers.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
