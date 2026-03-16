import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSharedData, setSharedData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Payment {
  id: string;
  farmerName: string;
  phone: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
}

export default function FarmerPayments() {
  const { toast } = useToast();
  const shared = getSharedData<any>();
  const farmers: any[] = shared.farmers || [];
  const [payments, setPayments] = useState<Payment[]>(shared.farmerPayments || []);

  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [smsNotif, setSmsNotif] = useState<{ farmer: string; phone: string; amount: number } | null>(null);

  const selectedFarmerData = farmers.find((f: any) => f.name === selectedFarmer);

  const sendPayment = () => {
    if (!selectedFarmer || !amount || !date) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const farmer = farmers.find((f: any) => f.name === selectedFarmer);
    const payment: Payment = {
      id: Date.now().toString(), farmerName: selectedFarmer, phone: farmer?.phone || "",
      amount: parseFloat(amount), date, status: "paid",
    };
    const updated = [...payments, payment];
    setPayments(updated);
    setSharedData({ farmerPayments: updated });

    // SMS simulation
    setFlashId(payment.id);
    setSmsNotif({ farmer: selectedFarmer, phone: farmer?.phone || "", amount: parseFloat(amount) });
    setTimeout(() => { setFlashId(null); setSmsNotif(null); }, 5000);

    toast({
      title: `₹${parseFloat(amount).toLocaleString("en-IN")} credited to ${selectedFarmer}`,
      description: `SMS sent to: ${farmer?.phone || "N/A"}`,
    });

    setSelectedFarmer(""); setAmount(""); setDate("");
  };

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
            <p className="text-sm">₹{smsNotif.amount.toLocaleString("en-IN")} credited to {smsNotif.farmer} account.</p>
            <p className="text-sm text-muted-foreground">SMS sent to: {smsNotif.phone}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="data-card mb-4 space-y-3">
        <h2 className="font-semibold text-sm">Send Payment to Farmer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
            <SelectTrigger><SelectValue placeholder="Select farmer" /></SelectTrigger>
            <SelectContent>{farmers.map((f: any) => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
          {selectedFarmerData && (
            <Input value={selectedFarmerData.phone} disabled className="font-mono-data" />
          )}
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button className="btn-press gap-1.5" onClick={sendPayment}><Send className="h-4 w-4" /> Send Payment</Button>
      </div>

      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3">Farmer</th>
              <th className="py-2 pr-3">Phone</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Date</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className={`border-b border-border last:border-0 ${flashId === p.id ? "animate-flash-green" : ""}`}>
                <td className="py-2.5 pr-3 font-medium">{p.farmerName}</td>
                <td className="py-2.5 pr-3 font-mono-data">{p.phone}</td>
                <td className="py-2.5 pr-3 font-mono-data font-semibold">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3 font-mono-data">{p.date}</td>
                <td className="py-2.5"><Badge variant="default">Paid</Badge></td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={5} className="py-4 text-muted-foreground">No payments recorded.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
