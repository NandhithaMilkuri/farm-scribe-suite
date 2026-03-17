import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, getLeaveRequests, saveLeaveRequests, type LeaveRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CalendarOff, Check, X } from "lucide-react";

export default function LeaveManagement() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const isOperator = user?.role === "operator";
  const [leaves, setLeaves] = useState<LeaveRequest[]>(getLeaveRequests());

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const canApply = user?.role === "supervisor" || user?.role === "organizer";

  const applyLeave = () => {
    if (!date || !reason.trim()) {
      toast({ title: "Error", description: "Date and reason are required.", variant: "destructive" });
      return;
    }
    const leave: LeaveRequest = {
      id: Date.now().toString(),
      username: user?.username || "",
      fullName: user?.fullName || "",
      role: user?.role || "supervisor",
      date,
      reason: reason.trim(),
      status: "pending",
      appliedOn: new Date().toISOString().split("T")[0],
    };
    const updated = [...leaves, leave];
    setLeaves(updated);
    saveLeaveRequests(updated);
    setDate(""); setReason("");
    toast({ title: "Leave Request Submitted" });
  };

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    const updated = leaves.map((l) => l.id === id ? { ...l, status } : l);
    setLeaves(updated);
    saveLeaveRequests(updated);
    toast({ title: `Leave ${status === "approved" ? "Approved" : "Rejected"}` });
  };

  const myLeaves = leaves.filter((l) => l.username === user?.username);
  const allPending = leaves.filter((l) => l.status === "pending");

  const statusVariant = (s: string) => s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary";

  return (
    <AppLayout title="Leave Management">
      {canApply && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Apply for Leave</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave" rows={1} />
          </div>
          <Button className="btn-press gap-1.5" onClick={applyLeave}><CalendarOff className="h-4 w-4" /> Apply Leave</Button>
        </div>
      )}

      {canApply && (
        <div className="data-card mb-4 overflow-x-auto">
          <h2 className="font-semibold text-sm mb-3">My Leave Requests</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Applied On</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-mono-data">{l.date}</td>
                  <td className="py-2.5 pr-3">{l.reason}</td>
                  <td className="py-2.5 pr-3 font-mono-data">{l.appliedOn}</td>
                  <td className="py-2.5"><Badge variant={statusVariant(l.status)}>{l.status}</Badge></td>
                </tr>
              ))}
              {myLeaves.length === 0 && <tr><td colSpan={4} className="py-4 text-muted-foreground">No leave requests.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {isOperator && (
        <div className="data-card overflow-x-auto">
          <h2 className="font-semibold text-sm mb-3">All Leave Requests</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{l.fullName}</td>
                  <td className="py-2.5 pr-3 capitalize">{l.role}</td>
                  <td className="py-2.5 pr-3 font-mono-data">{l.date}</td>
                  <td className="py-2.5 pr-3">{l.reason}</td>
                  <td className="py-2.5 pr-3"><Badge variant={statusVariant(l.status)}>{l.status}</Badge></td>
                  <td className="py-2.5">
                    {l.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="btn-press gap-1" onClick={() => updateStatus(l.id, "approved")}>
                          <Check className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="btn-press gap-1 text-destructive" onClick={() => updateStatus(l.id, "rejected")}>
                          <X className="h-3 w-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && <tr><td colSpan={6} className="py-4 text-muted-foreground">No leave requests.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
