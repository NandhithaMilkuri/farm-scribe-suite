import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { getSharedData, setSharedData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FarmerPayments() {
  const { toast } = useToast();
  const shared = getSharedData<any>();
  const farmers: any[] = shared.farmers || [];
  const [crops, setCrops] = useState<any[]>(shared.crops || []);
  const [smsNotif, setSmsNotif] = useState<{ farmer: string; phone: string; amount: number } | null>(null);

  // Only show approved (funded by operator) entries that organizer can pay to farmers
  const fundedEntries = crops.filter((c: any) => c.status === "approved");
  const paidEntries = crops.filter((c: any) => c.status === "funded");

  const sendToFarmer = (id: string) => {
    const entry = crops.find((c) => c.id === id);
    if (!entry) return;
    const farmer = farmers.find((f: any) => f.name === entry.farmerName);
    const updated = crops.map((c) => c.id === id ? { ...c, status: "funded" } : c);
    setCrops(updated);
    setSharedData({ crops: updated });

    const phone = farmer?.phone || "N/A";
    const amount = entry.farmerAmount;
    setSmsNotif({ farmer: entry.farmerName, phone, amount });
    setTimeout(() => setSmsNotif(null), 5000);

    toast({
      title: `₹${amount.toLocaleString("en-IN")} sent to ${entry.farmerName}`,
      description: `SMS sent to: ${phone}`,
    });
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <AppLayout title="Farmer Payments">
      <AnimatePresence>
        {smsNotif && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30"
          >
            <p className="font-semibold text-primary">Payment Successful</p>
            <p className="text-sm">₹{smsNotif.amount.toLocaleString("en-IN")} credited to {smsNotif.farmer}'s account.</p>
            <p className="text-sm text-muted-foreground">SMS sent to: {smsNotif.phone}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="data-card mb-4">
        <h2 className="font-semibold text-sm mb-3">Funded by Operator — Ready to Pay Farmers</h2>
        {fundedEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending farmer payments. Operator must approve crop yield first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3">Farmer</th>
                  <th className="py-2 pr-3">Village</th>
                  <th className="py-2 pr-3">Crop</th>
                  <th className="py-2 pr-3">Qty (qtl)</th>
                  <th className="py-2 pr-3">Price (₹/qtl)</th>
                  <th className="py-2 pr-3">Total Value</th>
                  <th className="py-2 pr-3">Your 10%</th>
                  <th className="py-2 pr-3">Farmer Gets</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {fundedEntries.map((c: any) => {
                  const farmer = farmers.find((f: any) => f.name === c.farmerName);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 font-medium">
                        {c.farmerName}
                        {farmer?.bankAccount && <span className="block text-xs text-muted-foreground">A/C: {farmer.bankAccount}</span>}
                      </td>
                      <td className="py-2.5 pr-3">{c.village}</td>
                      <td className="py-2.5 pr-3">{c.cropType}</td>
                      <td className="py-2.5 pr-3 font-mono-data">{c.yieldQty}</td>
                      <td className="py-2.5 pr-3 font-mono-data">{fmt(c.price)}</td>
                      <td className="py-2.5 pr-3 font-mono-data font-semibold">{fmt(c.totalValue)}</td>
                      <td className="py-2.5 pr-3 font-mono-data text-primary">{fmt(c.commission)}</td>
                      <td className="py-2.5 pr-3 font-mono-data font-semibold">{fmt(c.farmerAmount)}</td>
                      <td className="py-2.5">
                        <Button size="sm" className="btn-press gap-1" onClick={() => sendToFarmer(c.id)}>
                          <Send className="h-3 w-3" /> Pay Farmer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paidEntries.length > 0 && (
        <div className="data-card overflow-x-auto">
          <h2 className="font-semibold text-sm mb-3">Payment History</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3">Farmer</th>
                <th className="py-2 pr-3">Crop</th>
                <th className="py-2 pr-3">Total Value</th>
                <th className="py-2 pr-3">Your Commission</th>
                <th className="py-2 pr-3">Farmer Paid</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {paidEntries.map((c: any) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{c.farmerName}</td>
                  <td className="py-2.5 pr-3">{c.cropType}</td>
                  <td className="py-2.5 pr-3 font-mono-data">{fmt(c.totalValue)}</td>
                  <td className="py-2.5 pr-3 font-mono-data text-primary">{fmt(c.commission)}</td>
                  <td className="py-2.5 pr-3 font-mono-data font-semibold">{fmt(c.farmerAmount)}</td>
                  <td className="py-2.5"><Badge variant="default">Paid</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
