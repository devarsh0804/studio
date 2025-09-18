
import { PageHeader } from "@/components/PageHeader";
import { GradingView } from "./components/GradingView";

export default function GradingPage() {
  return (
    <>
      <PageHeader 
        title="IoT Grading Station"
        description="Perform AI-powered quality analysis and generate a digital certificate for a new crop lot."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <GradingView />
      </main>
    </>
  );
}
