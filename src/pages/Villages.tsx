import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSharedData, setSharedData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus } from "lucide-react";

export default function Villages() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const shared = getSharedData<any>();
  const [villages, setVillages] = useState<string[]>(shared.villages || []);

  const addVillage = () => {
    if (!name.trim()) { toast({ title: "Error", description: "Village name is required.", variant: "destructive" }); return; }
    if (villages.includes(name.trim())) { toast({ title: "Error", description: "Village already exists.", variant: "destructive" }); return; }
    const updated = [...villages, name.trim()];
    setVillages(updated);
    setSharedData({ villages: updated });
    setName("");
    toast({ title: "Village Added" });
  };

  return (
    <AppLayout title="Villages">
      <div className="data-card mb-4">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Village name" className="max-w-xs" />
          <Button className="btn-press gap-1.5" onClick={addVillage}><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {villages.map((v) => (
          <div key={v} className="data-card flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{v}</span>
          </div>
        ))}
        {villages.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No villages added. Start by adding one above.</p>}
      </div>
    </AppLayout>
  );
}
