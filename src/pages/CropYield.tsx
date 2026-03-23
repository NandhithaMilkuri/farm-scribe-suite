import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSharedData, setSharedData } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";

interface CropEntry {
  id: string;
  farmerName: string;
  village: string;
  cropType: string;
  yieldQty: number;
  price: number;
  totalValue: number;
  commission: number;
  farmerAmount: number;
  status: "pending" | "approved" | "funded";
  addedBy: string;
  season?: string;
}

const SEASONS = ["Kharif 2025", "Rabi 2025-26", "Kharif 2026", "Rabi 2026-27"];

export default function CropYield() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const shared = getSharedData<any>();
  const [crops, setCrops] = useState<CropEntry[]>(shared.crops || []);
  const farmers: any[] = shared.farmers || [];
  const villages: string[] = shared.villages || [];

  const [farmerName, setFarmerName] = useState("");
  const [village, setVillage] = useState("");
  const [cropType, setCropType] = useState("");
  const [yieldQty, setYieldQty] = useState("");
  const [price, setPrice] = useState("");
  const [season, setSeason] = useState(SEASONS[0]);
  const [filterSeason, setFilterSeason] = useState("all");

  const canAdd = user?.role === "supervisor";
  const canApprove = user?.role === "operator";
  const isSupervisor = user?.role === "supervisor";

  const addCrop = () => {
    if (!farmerName || !village || !cropType.trim() || !yieldQty || !price) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const y = parseFloat(yieldQty);
    const p = parseFloat(price);
    const total = y * p;
    const commission = total * 0.10;
    const farmerAmount = total - commission;
    const entry: CropEntry = {
      id: Date.now().toString(), farmerName, village, cropType: cropType.trim(),
      yieldQty: y, price: p, totalValue: total, commission, farmerAmount,
      status: "pending", addedBy: user?.username || "", season,
    };
    const updated = [...crops, entry];
    setCrops(updated);
    setSharedData({ crops: updated });
    setFarmerName(""); setVillage(""); setCropType(""); setYieldQty(""); setPrice("");
    toast({ title: "Crop Yield Added" });
  };

  const approve = (id: string) => {
    const updated = crops.map((c) => c.id === id ? { ...c, status: "approved" as const } : c);
    setCrops(updated);
    setSharedData({ crops: updated });
    toast({ title: "Approved — Funds sent to Organizer" });
  };

  const filteredCrops = filterSeason === "all" ? crops : crops.filter((c) => c.season === filterSeason);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <AppLayout title="Crop Yield">
      {canAdd && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Add Crop Production</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
              <SelectContent>{SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={farmerName} onValueChange={setFarmerName}>
              <SelectTrigger><SelectValue placeholder="Farmer" /></SelectTrigger>
              <SelectContent>{farmers.map((f: any) => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={village} onValueChange={setVillage}>
              <SelectTrigger><SelectValue placeholder="Village" /></SelectTrigger>
              <SelectContent>{villages.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="Crop type" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input type="number" value={yieldQty} onChange={(e) => setYieldQty(e.target.value)} placeholder="Yield (quintals)" />
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Market price (₹/quintal)" />
            <Button className="btn-press gap-1.5" onClick={addCrop}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {yieldQty && price && !isSupervisor && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <p>Total Value: <span className="font-mono-data font-semibold">{fmt(parseFloat(yieldQty || "0") * parseFloat(price || "0"))}</span></p>
              <p>Organizer 10%: <span className="font-mono-data font-semibold text-primary">{fmt(parseFloat(yieldQty || "0") * parseFloat(price || "0") * 0.10)}</span></p>
              <p>Farmer 90%: <span className="font-mono-data font-semibold">{fmt(parseFloat(yieldQty || "0") * parseFloat(price || "0") * 0.90)}</span></p>
            </div>
          )}
        </div>
      )}

      {/* Season filter */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by Season:</span>
        <Select value={filterSeason} onValueChange={setFilterSeason}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3">Farmer</th>
              <th className="py-2 pr-3">Village</th>
              <th className="py-2 pr-3">Crop</th>
              <th className="py-2 pr-3">Season</th>
              <th className="py-2 pr-3">Qty (qtl)</th>
              <th className="py-2 pr-3">Price (₹/qtl)</th>
              <th className="py-2 pr-3">Total</th>
              {!isSupervisor && <th className="py-2 pr-3">Org 10%</th>}
              {!isSupervisor && <th className="py-2 pr-3">Farmer 90%</th>}
              <th className="py-2 pr-3">Status</th>
              {canApprove && <th className="py-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredCrops.map((c) => (
              <tr key={c.id} className={`border-b border-border last:border-0 ${c.status === "approved" ? "animate-flash-green" : ""}`}>
                <td className="py-2.5 pr-3 font-medium">{c.farmerName}</td>
                <td className="py-2.5 pr-3">{c.village}</td>
                <td className="py-2.5 pr-3">{c.cropType}</td>
                <td className="py-2.5 pr-3 text-xs">{c.season || "—"}</td>
                <td className="py-2.5 pr-3 font-mono-data">{c.yieldQty}</td>
                <td className="py-2.5 pr-3 font-mono-data">{fmt(c.price)}</td>
                <td className="py-2.5 pr-3 font-mono-data font-semibold">{fmt(c.totalValue)}</td>
                {!isSupervisor && <td className="py-2.5 pr-3 font-mono-data text-primary">{fmt(c.commission)}</td>}
                {!isSupervisor && <td className="py-2.5 pr-3 font-mono-data">{fmt(c.farmerAmount)}</td>}
                <td className="py-2.5 pr-3">
                  <Badge variant={c.status === "approved" || c.status === "funded" ? "default" : "secondary"}>
                    {c.status === "approved" ? "Funded" : c.status === "funded" ? "Paid" : "Pending"}
                  </Badge>
                </td>
                {canApprove && (
                  <td className="py-2.5">
                    {c.status === "pending" && (
                      <Button size="sm" variant="outline" className="btn-press gap-1" onClick={() => approve(c.id)}>
                        <Check className="h-3 w-3" /> Approve & Fund
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredCrops.length === 0 && <tr><td colSpan={isSupervisor ? 8 : 11} className="py-4 text-muted-foreground">No crop yield entries.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
