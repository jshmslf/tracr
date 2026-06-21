import { ApplicationForm } from "@/components/applications/application-form";

export default function NewApplicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add application</h1>
      <ApplicationForm />
    </div>
  );
}
