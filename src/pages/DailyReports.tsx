import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserData, setUserData, getSharedData } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "@/components/ImagePreview";
import { Plus } from "lucide-react";

interface DailyReport {
  id: string;
  date: string;
  village: string;
  farmersMet: number;
  description: string;
  image?: string;
}

export default function DailyReports() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const data = getUserData<any>();
  const shared = getSharedData<any>();
  const villages: string[] = shared.villages || [];
  const [reports, setReports] = useState<DailyReport[]>(data.dailyReports || []);

  const [date, setDate] = useState("");
  const [village, setVillage] = useState("");
  const [farmersMet, setFarmersMet] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const canAdd = user?.role === "supervisor";

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addReport = () => {
    if (!date || !village || !farmersMet || !description.trim()) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const report: DailyReport = {
      id: Date.now().toString(), date, village, farmersMet: parseInt(farmersMet),
      description: description.trim(), image: imagePreview || undefined,
    };
    const updated = [...reports, report];
    setReports(updated);
    setUserData({ dailyReports: updated });
    setDate(""); setVillage(""); setFarmersMet(""); setDescription(""); setImagePreview("");
    toast({ title: "Daily Report Submitted" });
  };

  return (
    <AppLayout title="Daily Reports">
      {canAdd && (
        <div className="data-card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Submit Daily Report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Select value={village} onValueChange={setVillage}>
              <SelectTrigger><SelectValue placeholder="Village visited" /></SelectTrigger>
              <SelectContent>{villages.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" value={farmersMet} onChange={(e) => setFarmersMet(e.target.value)} placeholder="Farmers met" />
          </div>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Work description" rows={2} />
          <div className="flex items-center gap-3">
            <Input type="file" accept="image/*" onChange={handleImage} className="max-w-xs" />
            {imagePreview && <ImagePreview src={imagePreview} className="h-16 w-16" alt="Report" />}
          </div>
          <Button className="btn-press gap-1.5" onClick={addReport}><Plus className="h-4 w-4" /> Submit Report</Button>
        </div>
      )}
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="data-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono-data text-sm text-muted-foreground">{r.date}</p>
                <p className="font-medium">{r.village} · {r.farmersMet} farmers met</p>
                <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
              </div>
              {r.image && <ImagePreview src={r.image} className="h-20 w-28 rounded-md" alt="Report" />}
            </div>
          </div>
        ))}
        {reports.length === 0 && <p className="text-sm text-muted-foreground">No reports submitted. Start by logging your daily activity.</p>}
      </div>
    </AppLayout>
  );
}
