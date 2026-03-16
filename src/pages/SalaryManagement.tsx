import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllDataForRole } from "@/lib/storage";
import { getUsers, getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalaryRecord {
  id: string;
  username: string;
  name: string;
  userRole: "supervisor" | "organizer";
  month: string;
  baseSalary: number;
  totalDA: number;
  totalTA: number;
  totalSalary: number;
  status: "pending" | "credited";
  season?: string;
}

export default function SalaryManagement() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const canCredit = user?.role === "operator";

  const supervisors = getUsers().filter((u) => u.role === "supervisor");
  const organizers = getUsers().filter((u) => u.role === "organizer");
  const allSupervisorData = getAllDataForRole("supervisor");

  const [selectedSup, setSelectedSup] = useState("");
  const [month, setMonth] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  // Organizer salary
  const [selectedOrg, setSelectedOrg] = useState("");
  const [orgSeason, setOrgSeason] = useState("");
  const [orgBaseSalary, setOrgBaseSalary] = useState("");

  const savedRecords = JSON.parse(localStorage.getItem("AFMS_SALARIES") || "[]");
  const [records, setRecords] = useState<SalaryRecord[]>(savedRecords);

  const getSupTotals = (username: string) => {
    const userData = allSupervisorData.find((d) => d.username === username);
    const travelBills: any[] = (userData?.data as any)?.travelBills || [];
    const totalDA = travelBills.reduce((s: number, t: any) => s + (t.da || 0), 0);
    const totalTA = travelBills.reduce((s: number, t: any) => s + (t.petrolAmount || 0), 0);
    return { totalDA, totalTA };
  };

  const addSupervisorSalary = () => {
    if (!selectedSup || !month || !baseSalary) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const sup = supervisors.find((s) => s.username === selectedSup);
    const { totalDA, totalTA } = getSupTotals(selectedSup);
    const base = parseFloat(baseSalary);
    const record: SalaryRecord = {
      id: Date.now().toString(), username: selectedSup, name: sup?.fullName || selectedSup,
      userRole: "supervisor", month, baseSalary: base, totalDA, totalTA, totalSalary: base + totalDA + totalTA, status: "pending",
    };
    const updated = [...records, record];
    setRecords(updated);
    localStorage.setItem("AFMS_SALARIES", JSON.stringify(updated));
    setSelectedSup(""); setMonth(""); setBaseSalary("");
    toast({ title: "Supervisor Salary Record Created" });
  };

  const addOrganizerSalary = () => {
    if (!selectedOrg || !orgSeason || !orgBaseSalary) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const org = organizers.find((o) => o.username === selectedOrg);
    const base = parseFloat(orgBaseSalary);
    const record: SalaryRecord = {
      id: Date.now().toString(), username: selectedOrg, name: org?.fullName || selectedOrg,
      userRole: "organizer", month: "", baseSalary: base, totalDA: 0, totalTA: 0,
      totalSalary: base, status: "pending", season: orgSeason,
    };
    const updated = [...records, record];
    setRecords(updated);
    localStorage.setItem("AFMS_SALARIES", JSON.stringify(updated));
    setSelectedOrg(""); setOrgSeason(""); setOrgBaseSalary("");
    toast({ title: "Organizer Salary Record Created" });
  };

  const creditSalary = (id: string) => {
    const updated = records.map((r) => r.id === id ? { ...r, status: "credited" as const } : r);
    setRecords(updated);
    localStorage.setItem("AFMS_SALARIES", JSON.stringify(updated));
    toast({ title: "Salary Credited", description: "Payment has been processed." });
  };

  const seasons = [
    "Kharif (Jun-Nov)",
    "Rabi (Nov-Apr)",
    "Zaid (Mar-Jun)",
  ];

  const supRecords = records.filter((r) => r.userRole === "supervisor");
  const orgRecords = records.filter((r) => r.userRole === "organizer");

  return (
    <AppLayout title="Salary Management">
      <Tabs defaultValue="supervisor">
        <TabsList className="mb-4">
          <TabsTrigger value="supervisor">Supervisor Salary</TabsTrigger>
          <TabsTrigger value="organizer">Organizer Salary (Seasonal)</TabsTrigger>
        </TabsList>

        <TabsContent value="supervisor">
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
              {selectedSup && (
                <div className="text-sm text-muted-foreground grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <span>Total DA: <span className="font-mono-data font-semibold text-foreground">₹{getSupTotals(selectedSup).totalDA.toLocaleString("en-IN")}</span></span>
                  <span>Total TA: <span className="font-mono-data font-semibold text-foreground">₹{getSupTotals(selectedSup).totalTA.toLocaleString("en-IN")}</span></span>
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
                {supRecords.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{r.name}</td>
                    <td className="py-2.5 pr-3 font-mono-data">{r.month}</td>
                    <td className="py-2.5 pr-3 font-mono-data">₹{r.baseSalary.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 pr-3 font-mono-data">₹{r.totalDA.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 pr-3 font-mono-data">₹{r.totalTA.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 pr-3 font-mono-data font-semibold">₹{r.totalSalary.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 pr-3"><Badge variant={r.status === "credited" ? "default" : "secondary"}>{r.status === "credited" ? "Credited" : "Pending"}</Badge></td>
                    {canCredit && (
                      <td className="py-2.5">{r.status === "pending" && <Button size="sm" className="btn-press" onClick={() => creditSalary(r.id)}>Credit</Button>}</td>
                    )}
                  </tr>
                ))}
                {supRecords.length === 0 && <tr><td colSpan={8} className="py-4 text-muted-foreground">No supervisor salary records.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="organizer">
          {canCredit && (
            <div className="data-card mb-4 space-y-3">
              <h2 className="font-semibold text-sm">Credit Organizer Salary (6-Month Season)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger><SelectValue placeholder="Organizer" /></SelectTrigger>
                  <SelectContent>{organizers.map((o) => <SelectItem key={o.username} value={o.username}>{o.fullName}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={orgSeason} onValueChange={setOrgSeason}>
                  <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
                  <SelectContent>{seasons.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" value={orgBaseSalary} onChange={(e) => setOrgBaseSalary(e.target.value)} placeholder="Salary amount (₹)" />
                <Button className="btn-press gap-1.5" onClick={addOrganizerSalary}><IndianRupee className="h-4 w-4" /> Create</Button>
              </div>
            </div>
          )}
          <div className="data-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3">Organizer</th>
                  <th className="py-2 pr-3">Season</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  {canCredit && <th className="py-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {orgRecords.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{r.name}</td>
                    <td className="py-2.5 pr-3">{r.season}</td>
                    <td className="py-2.5 pr-3 font-mono-data font-semibold">₹{r.totalSalary.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 pr-3"><Badge variant={r.status === "credited" ? "default" : "secondary"}>{r.status === "credited" ? "Credited" : "Pending"}</Badge></td>
                    {canCredit && (
                      <td className="py-2.5">{r.status === "pending" && <Button size="sm" className="btn-press" onClick={() => creditSalary(r.id)}>Credit</Button>}</td>
                    )}
                  </tr>
                ))}
                {orgRecords.length === 0 && <tr><td colSpan={5} className="py-4 text-muted-foreground">No organizer salary records.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
