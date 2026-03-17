import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSharedData, setSharedData } from "@/lib/storage";
import { getUsers, getCurrentUser, getVillageAssignments, setVillageAssignments, getAssignedVillages, getMyOperator, setOperatorForUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Villages() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const isOperator = user?.role === "operator";
  const operatorNs = getMyOperator();
  const [name, setName] = useState("");
  const shared = getSharedData<any>();
  const allVillages: string[] = shared.villages || [];

  const myVillages = isOperator ? allVillages : (user ? getAssignedVillages(user.username, user.role) : []);
  const [villages, setVillages] = useState<string[]>(allVillages);

  const supervisors = getUsers().filter((u) => u.role === "supervisor");
  const organizers = getUsers().filter((u) => u.role === "organizer");
  const [assignments, setAssignments] = useState(getVillageAssignments(operatorNs));

  const [assignVillage, setAssignVillage] = useState("");
  const [assignUser, setAssignUser] = useState("");
  const [assignRole, setAssignRole] = useState<"supervisor" | "organizer">("supervisor");

  const addVillage = () => {
    if (!name.trim()) { toast({ title: "Error", description: "Village name is required.", variant: "destructive" }); return; }
    if (villages.includes(name.trim())) { toast({ title: "Error", description: "Village already exists.", variant: "destructive" }); return; }
    const updated = [...villages, name.trim()];
    setVillages(updated);
    setSharedData({ villages: updated });
    setName("");
    toast({ title: "Village Added" });
  };

  const assignVillageToUser = () => {
    if (!assignVillage || !assignUser) {
      toast({ title: "Error", description: "Select village and user.", variant: "destructive" });
      return;
    }
    const updated = [...assignments];
    let entry = updated.find((a) => a.village === assignVillage);
    if (!entry) {
      entry = { village: assignVillage, supervisors: [], organizers: [] };
      updated.push(entry);
    }
    const list = assignRole === "supervisor" ? entry.supervisors : entry.organizers;
    if (list.includes(assignUser)) {
      toast({ title: "Already Assigned", variant: "destructive" });
      return;
    }
    list.push(assignUser);
    setAssignments([...updated]);
    setVillageAssignments(operatorNs, updated);
    // Map this user to this operator so they see the right data
    setOperatorForUser(assignUser, operatorNs);
    setAssignUser("");
    toast({ title: `Village assigned to ${assignRole}` });
  };

  const getAssignedUsers = (village: string) => {
    const entry = assignments.find((a) => a.village === village);
    if (!entry) return { supervisors: [], organizers: [] };
    return { supervisors: entry.supervisors, organizers: entry.organizers };
  };

  const displayVillages = isOperator ? villages : myVillages;

  return (
    <AppLayout title="Villages">
      {isOperator && (
        <>
          <div className="data-card mb-4">
            <h2 className="font-semibold text-sm mb-3">Add Village</h2>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Village name" className="max-w-xs" />
              <Button className="btn-press gap-1.5" onClick={addVillage}><Plus className="h-4 w-4" /> Add</Button>
            </div>
          </div>
          <div className="data-card mb-4 space-y-3">
            <h2 className="font-semibold text-sm">Assign Village to Supervisor / Organizer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Select value={assignVillage} onValueChange={setAssignVillage}>
                <SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger>
                <SelectContent>{villages.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={assignRole} onValueChange={(v) => { setAssignRole(v as any); setAssignUser(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assignUser} onValueChange={setAssignUser}>
                <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                <SelectContent>
                  {(assignRole === "supervisor" ? supervisors : organizers).map((u) => (
                    <SelectItem key={u.username} value={u.username}>{u.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="btn-press gap-1.5" onClick={assignVillageToUser}><Users className="h-4 w-4" /> Assign</Button>
            </div>
          </div>
        </>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {displayVillages.map((v) => {
          const assigned = getAssignedUsers(v);
          return (
            <div key={v} className="data-card">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{v}</span>
              </div>
              {isOperator && (assigned.supervisors.length > 0 || assigned.organizers.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {assigned.supervisors.map((s) => {
                    const u = supervisors.find((x) => x.username === s);
                    return <Badge key={s} variant="secondary" className="text-xs">{u?.fullName || s} (Sup)</Badge>;
                  })}
                  {assigned.organizers.map((o) => {
                    const u = organizers.find((x) => x.username === o);
                    return <Badge key={o} variant="outline" className="text-xs">{u?.fullName || o} (Org)</Badge>;
                  })}
                </div>
              )}
            </div>
          );
        })}
        {displayVillages.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No villages assigned to you.</p>}
      </div>
    </AppLayout>
  );
}
