import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserData, setUserData, getSharedData, getAllDataForRole } from "@/lib/storage";
import { getCurrentUser, getMyOperator, getOperatorStaff } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "@/components/ImagePreview";
import { Plus } from "lucide-react";

interface TravelEntry {
  id: string;
  date: string;
  month: string; // YYYY-MM for salary mapping
  startKm: number;
  endKm: number;
  distance: number;
  petrolAmount: number;
  petrolBunk: string;
  da: number;
  totalBill: number;
  image?: string;
  username?: string;
  fullName?: string;
}

export default function TravelBills() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const operatorNs = getMyOperator();
  const data = getUserData<any>();
  const isOperator = user?.role === "operator";

  // For operator: show all supervisors' travel bills
  const getAllTravelBills = (): TravelEntry[] => {
    if (!isOperator) return data.travelBills || [];
    const staff = getOperatorStaff(operatorNs).filter((u) => u.role === "supervisor");
    const allSupData = getAllDataForRole("supervisor");
    const allBills: TravelEntry[] = [];
    staff.forEach((sup) => {
      const supData = allSupData.find((d) => d.username === sup.username);
      const bills: TravelEntry[] = (supData?.data as any)?.travelBills || [];
      bills.forEach((b) => allBills.push({ ...b, username: sup.username, fullName: sup.fullName }));
    });
    return allBills.sort((a, b) => b.date.localeCompare(a.date));
  };

  const [entries, setEntries] = useState<TravelEntry[]>(isOperator ? getAllTravelBills() : (data.travelBills || []));

  const [date, setDate] = useState("");
  const [billMonth, setBillMonth] = useState(""); // which month this bill belongs to
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [petrolAmount, setPetrolAmount] = useState("");
  const [petrolBunk, setPetrolBunk] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const canAdd = user?.role === "supervisor";

  const distance = startKm && endKm ? Math.max(0, parseFloat(endKm) - parseFloat(startKm)) : 0;
  const da = 100;
  const totalBill = da + (parseFloat(petrolAmount) || 0);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addEntry = () => {
    if (!date || !billMonth || !startKm || !endKm || !petrolAmount || !petrolBunk.trim()) {
      toast({ title: "Error", description: "All fields including bill month are required.", variant: "destructive" });
      return;
    }
    const entry: TravelEntry = {
      id: Date.now().toString(), date, month: billMonth,
      startKm: parseFloat(startKm), endKm: parseFloat(endKm),
      distance, petrolAmount: parseFloat(petrolAmount), petrolBunk: petrolBunk.trim(),
      da, totalBill, image: imagePreview || undefined,
    };
    const updated = [...entries, entry];
    setEntries(updated);
    setUserData({ travelBills: updated });
    setDate(""); setBillMonth(""); setStartKm(""); setEndKm(""); setPetrolAmount(""); setPetrolBunk(""); setImagePreview("");
    toast({ title: "Travel Entry Added" });
  };

  // Filter by month for operator
  const [filterMonth, setFilterMonth] = useState("all");
  const filteredEntries = filterMonth === "all" ? entries : entries.filter((e) => (e.month || e.date?.substring(0, 7)) === filterMonth);

  // Get unique months for filter
  const months = [...new Set(entries.map((e) => e.month || e.date?.substring(0, 7)))].sort().reverse();

  return (
    <AppLayout title="Travel & Allowance">
      {canAdd && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Add Travel Entry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Bill Month (for salary)</label>
              <Input type="month" value={billMonth} onChange={(e) => setBillMonth(e.target.value)} />
            </div>
            <Input type="number" value={startKm} onChange={(e) => setStartKm(e.target.value)} placeholder="Start KM" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input type="number" value={endKm} onChange={(e) => setEndKm(e.target.value)} placeholder="End KM" />
            <Input type="number" value={petrolAmount} onChange={(e) => setPetrolAmount(e.target.value)} placeholder="Petrol amount (₹)" />
            <Input value={petrolBunk} onChange={(e) => setPetrolBunk(e.target.value)} placeholder="Petrol bunk name" />
          </div>
          <Input type="file" accept="image/*" onChange={handleImage} className="max-w-xs" />
          {imagePreview && <ImagePreview src={imagePreview} className="h-20 w-28" alt="Proof" />}
          {startKm && endKm && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground">Distance:</span> <span className="font-mono-data font-semibold">{distance} km</span></div>
              <div><span className="text-muted-foreground">DA:</span> <span className="font-mono-data font-semibold">₹{da}</span></div>
              <div><span className="text-muted-foreground">Petrol:</span> <span className="font-mono-data font-semibold">₹{petrolAmount || 0}</span></div>
              <div><span className="text-muted-foreground">Total Bill:</span> <span className="font-mono-data font-semibold">₹{totalBill}</span></div>
            </div>
          )}
          <Button className="btn-press gap-1.5" onClick={addEntry}><Plus className="h-4 w-4" /> Add Entry</Button>
        </div>
      )}

      {/* Month filter */}
      {months.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by Month:</span>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {isOperator && <th className="py-2 pr-3">Supervisor</th>}
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Bill Month</th>
              <th className="py-2 pr-3">Start KM</th>
              <th className="py-2 pr-3">End KM</th>
              <th className="py-2 pr-3">Distance</th>
              <th className="py-2 pr-3">DA (₹)</th>
              <th className="py-2 pr-3">Petrol (₹)</th>
              <th className="py-2 pr-3">Total Bill (₹)</th>
              <th className="py-2">Proof</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                {isOperator && <td className="py-2.5 pr-3 font-medium">{e.fullName || "—"}</td>}
                <td className="py-2.5 pr-3 font-mono-data">{e.date}</td>
                <td className="py-2.5 pr-3 font-mono-data">{e.month || e.date?.substring(0, 7)}</td>
                <td className="py-2.5 pr-3 font-mono-data">{e.startKm?.toLocaleString()}</td>
                <td className="py-2.5 pr-3 font-mono-data">{e.endKm?.toLocaleString()}</td>
                <td className="py-2.5 pr-3 font-mono-data">{e.distance} km</td>
                <td className="py-2.5 pr-3 font-mono-data">₹{e.da}</td>
                <td className="py-2.5 pr-3 font-mono-data">₹{e.petrolAmount}</td>
                <td className="py-2.5 pr-3 font-mono-data font-semibold">₹{e.totalBill}</td>
                <td className="py-2.5">{e.image ? <ImagePreview src={e.image} className="h-10 w-14" alt="Proof" /> : "—"}</td>
              </tr>
            ))}
            {filteredEntries.length === 0 && <tr><td colSpan={isOperator ? 10 : 9} className="py-4 text-muted-foreground">No travel entries.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
