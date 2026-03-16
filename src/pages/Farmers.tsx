import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSharedData, setSharedData } from "@/lib/storage";
import { getCurrentUser, getAssignedVillages } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  bankAccount?: string;
  ifscCode?: string;
}

export default function Farmers() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const shared = getSharedData<any>();
  const allFarmers: Farmer[] = shared.farmers || [];
  const allVillages: string[] = shared.villages || [];

  // Show only farmers from assigned villages for non-operators
  const myVillages = user?.role === "operator" ? allVillages : (user ? getAssignedVillages(user.username, user.role) : []);
  const visibleFarmers = user?.role === "operator" ? allFarmers : allFarmers.filter((f) => myVillages.includes(f.village));

  const [farmers, setFarmers] = useState<Farmer[]>(allFarmers);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const canAdd = user?.role === "supervisor";

  const addFarmer = () => {
    if (!name.trim() || !phone.trim() || !village) {
      toast({ title: "Error", description: "Name, phone and village are required.", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Error", description: "Phone must be 10 digits.", variant: "destructive" });
      return;
    }
    const newFarmer: Farmer = { id: Date.now().toString(), name: name.trim(), phone, village, bankAccount: bankAccount.trim() || undefined, ifscCode: ifscCode.trim() || undefined };
    const updated = [...farmers, newFarmer];
    setFarmers(updated);
    setSharedData({ farmers: updated });
    setName(""); setPhone(""); setVillage(""); setBankAccount(""); setIfscCode("");
    toast({ title: "Farmer Added" });
  };

  const displayFarmers = user?.role === "operator" ? farmers : farmers.filter((f) => myVillages.includes(f.village));

  return (
    <AppLayout title="Farmers">
      {canAdd && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Add Farmer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Farmer name" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (10 digits)" maxLength={10} />
            <Select value={village} onValueChange={setVillage}>
              <SelectTrigger><SelectValue placeholder="Village" /></SelectTrigger>
              <SelectContent>{myVillages.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Bank A/C Number (optional)" />
            <Input value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} placeholder="IFSC Code (optional)" />
            <Button className="btn-press gap-1.5" onClick={addFarmer}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </div>
      )}
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Village</th>
              {(user?.role === "organizer" || user?.role === "operator") && <th className="py-2 pr-4">Bank A/C</th>}
              {(user?.role === "organizer" || user?.role === "operator") && <th className="py-2">IFSC</th>}
            </tr>
          </thead>
          <tbody>
            {displayFarmers.map((f) => (
              <tr key={f.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-4 font-medium">{f.name}</td>
                <td className="py-2.5 pr-4 font-mono-data">{f.phone}</td>
                <td className="py-2.5 pr-4">{f.village}</td>
                {(user?.role === "organizer" || user?.role === "operator") && <td className="py-2.5 pr-4 font-mono-data">{f.bankAccount || "—"}</td>}
                {(user?.role === "organizer" || user?.role === "operator") && <td className="py-2.5 font-mono-data">{f.ifscCode || "—"}</td>}
              </tr>
            ))}
            {displayFarmers.length === 0 && <tr><td colSpan={5} className="py-4 text-muted-foreground">No farmers registered.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
