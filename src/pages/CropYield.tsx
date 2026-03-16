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
  yield: number;
  price: number;
  totalValue: number;
  status: "pending" | "approved";
  addedBy: string;
}

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

  const canAdd = user?.role === "supervisor";
  const canApprove = user?.role === "operator";

  const addCrop = () => {
    if (!farmerName || !village || !cropType.trim() || !yieldQty || !price) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const y = parseFloat(yieldQty);
    const p = parseFloat(price);
    const entry: CropEntry = {
      id: Date.now().toString(), farmerName, village, cropType: cropType.trim(),
      yield: y, price: p, totalValue: y * p, status: "pending", addedBy: user?.username || "",
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
    toast({ title: "Payment Approved" });
  };

  return (
    <AppLayout title="Crop Yield">
      {canAdd && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Add Crop Production</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <Input type="number" value={yieldQty} onChange={(e) => setYieldQty(e.target.value)} placeholder="Yield (kg)" />
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Market price (₹/kg)" />
            <Button className="btn-press gap-1.5" onClick={addCrop}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {yieldQty && price && (
            <p className="text-sm text-muted-foreground">Total Value: <span className="font-mono-data font-semibold text-foreground">₹{(parseFloat(yieldQty || "0") * parseFloat(price || "0")).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></p>
          )}
        </div>
      )}
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3">Farmer</th>
              <th className="py-2 pr-3">Village</th>
              <th className="py-2 pr-3">Crop</th>
              <th className="py-2 pr-3">Yield (kg)</th>
              <th className="py-2 pr-3">Price (₹/kg)</th>
              <th className="py-2 pr-3">Total Value</th>
              <th className="py-2 pr-3">Status</th>
              {canApprove && <th className="py-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {crops.map((c) => (
              <tr key={c.id} className={`border-b border-border last:border-0 ${c.status === "approved" ? "animate-flash-green" : ""}`}>
                <td className="py-2.5 pr-3 font-medium">{c.farmerName}</td>
                <td className="py-2.5 pr-3">{c.village}</td>
                <td className="py-2.5 pr-3">{c.cropType}</td>
                <td className="py-2.5 pr-3 font-mono-data">{c.yield.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td className="py-2.5 pr-3 font-mono-data">₹{c.price.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3 font-mono-data font-semibold">₹{c.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td className="py-2.5 pr-3">
                  <Badge variant={c.status === "approved" ? "default" : "secondary"}>{c.status === "approved" ? "Approved" : "Pending"}</Badge>
                </td>
                {canApprove && (
                  <td className="py-2.5">
                    {c.status === "pending" && (
                      <Button size="sm" variant="outline" className="btn-press gap-1" onClick={() => approve(c.id)}>
                        <Check className="h-3 w-3" /> Approve
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {crops.length === 0 && <tr><td colSpan={8} className="py-4 text-muted-foreground">No crop yield entries.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
