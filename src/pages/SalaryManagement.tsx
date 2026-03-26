import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllDataForRole } from "@/lib/storage";
import { getCurrentUser, getMyOperator, getOperatorStaff } from "@/lib/auth";
import { sendSMS } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";

interface SalaryRecord {
  id: string;
  username: string;
  name: string;
  month: string;
  baseSalary: number;
  totalDA: number;
  totalTA: number;
  totalSalary: number;
  status: "pending" | "credited";
}

function salariesKey(operatorUsername: string) {
  return `AFMS_SALARIES_${operatorUsername}`;
}

export default function SalaryManagement() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const operatorNs = getMyOperator();
  const canCredit = user?.role === "operator";

  const supervisors = getOperatorStaff(operatorNs).filter((u) => u.role === "supervisor");
  const allSupervisorData = getAllDataForRole("supervisor");

  const [selectedSup, setSelectedSup] = useState("");
  const [month, setMonth] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  const savedRecords = JSON.parse(localStorage.getItem(salariesKey(operatorNs)) || "[]");
  const [records, setRecords] = useState<SalaryRecord[]>(savedRecords);

  // Filter travel bills by selected month
  const getSupTotals = (username: string, forMonth: string) => {
    const userData = allSupervisorData.find((d) => d.username === username);
    const travelBills: any[] = (userData?.data as any)?.travelBills || [];
    // Filter by month field, or fallback to date substring
    const monthBills = forMonth
      ? travelBills.filter((t: any) => (t.month || t.date?.substring(0, 7)) === forMonth)
      : travelBills;
    const totalDA = monthBills.reduce((s: number, t: any) => s + (t.da || 0), 0);
    const totalTA = monthBills.reduce((s: number, t: any) => s + (t.petrolAmount || 0), 0);
    return { totalDA, totalTA, billCount: monthBills.length };
  };

  const addSupervisorSalary = () => {
    if (!selectedSup || !month || !baseSalary) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const sup = supervisors.find((s) => s.username === selectedSup);
    const { totalDA, totalTA } = getSupTotals(selectedSup, month);
    const base = parseFloat(baseSalary);
    const record: SalaryRecord = {
      id: Date.now().toString(), username: selectedSup, name: sup?.fullName || selectedSup,
      month, baseSalary: base, totalDA, totalTA, totalSalary: base + totalDA + totalTA, status: "pending",
    };
    const updated = [...records, record];
    setRecords(updated);
    localStorage.setItem(salariesKey(operatorNs), JSON.stringify(updated));
    setSelectedSup(""); setMonth(""); setBaseSalary("");
    toast({ title: "Supervisor Salary Record Created" });
  };

  const creditSalary = (id: string) => {
    const updated = records.map((r) => r.id === id ? { ...r, status: "credited" as const } : r);
    setRecords(updated);
    localStorage.setItem(salariesKey(operatorNs), JSON.stringify(updated));
    const record = updated.find((r) => r.id === id);
    if (record) {
      const sup = supervisors.find((s) => s.username === record.username);
      if (sup?.phone) {
        // Open UPI for salary payment
        const upiLink = `upi://pay?pn=${encodeURIComponent(sup.fullName)}&am=${record.totalSalary.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Nutranta salary ${record.month}`)}`;
        window.open(upiLink, "_blank");
        sendSMS(sup.phone, `Nutranta: Your salary of ₹${record.totalSalary.toLocaleString("en-IN")} for ${record.month} has been credited. Thank you!`);
      }
    }
    toast({ title: "Salary Credited", description: "UPI payment initiated. SMS sent." });
  };

  return (
    <AppLayout title="Supervisor Salary Management">
      {canCredit && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Credit Supervisor Salary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Select value={selectedSup} onValueChange={setSelectedSup}>
              <SelectTrigger><SelectValue placeholder="Supervisor" /></SelectTrigger>
              <SelectContent>{supervisors.map((s) => <SelectItem key={s.username} value={s.username}>{s.fullName}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month" />
            <Input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} placeholder="Base salary (₹)" />
            <Button className="btn-press gap-1.5" onClick={addSupervisorSalary}><IndianRupee className="h-4 w-4" /> Create</Button>
          </div>
          {selectedSup && month && (
            <div className="text-sm text-muted-foreground grid grid-cols-2 sm:grid-cols-3 gap-2">
              <span>DA ({month}): <span className="font-mono-data font-semibold text-foreground">₹{getSupTotals(selectedSup, month).totalDA.toLocaleString("en-IN")}</span></span>
              <span>TA ({month}): <span className="font-mono-data font-semibold text-foreground">₹{getSupTotals(selectedSup, month).totalTA.toLocaleString("en-IN")}</span></span>
              <span>Bills: <span className="font-mono-data font-semibold text-foreground">{getSupTotals(selectedSup, month).billCount}</span></span>
            </div>
          )}
        </div>
      )}
      <div className="data-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3">Supervisor</th>
              <th className="py-2 pr-3">Month</th>
              <th className="py-2 pr-3">Base</th>
              <th className="py-2 pr-3">DA</th>
              <th className="py-2 pr-3">TA</th>
              <th className="py-2 pr-3">Total</th>
              <th className="py-2 pr-3">Status</th>
              {canCredit && <th className="py-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 font-medium">{r.name}</td>
                <td className="py-2.5 pr-3 font-mono-data">{r.month}</td>
                <td className="py-2.5 pr-3 font-mono-data">₹{r.baseSalary.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3 font-mono-data">₹{r.totalDA.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3 font-mono-data">₹{r.totalTA.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3 font-mono-data font-semibold">₹{r.totalSalary.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3"><Badge variant={r.status === "credited" ? "default" : "secondary"}>{r.status === "credited" ? "Credited" : "Pending"}</Badge></td>
                {canCredit && (
                  <td className="py-2.5">{r.status === "pending" && <Button size="sm" className="btn-press" onClick={() => creditSalary(r.id)}>Credit via UPI</Button>}</td>
                )}
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={8} className="py-4 text-muted-foreground">No salary records.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
