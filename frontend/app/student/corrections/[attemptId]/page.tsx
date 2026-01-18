import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OralCorrectionDetailView from "@/components/exam/OralCorrectionDetailView";
import WrittenCorrectionDetailView from "@/components/exam/WrittenCorrectionDetailView";

export default function CorrectionsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="written" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="written">Expression Écrite</TabsTrigger>
          <TabsTrigger value="oral">Expression Orale</TabsTrigger>
        </TabsList>

        <TabsContent value="written">
          <WrittenCorrectionDetailView />
        </TabsContent>

        <TabsContent value="oral">
          <OralCorrectionDetailView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
