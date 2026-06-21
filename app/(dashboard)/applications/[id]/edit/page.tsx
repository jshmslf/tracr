import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getApplication } from "@/lib/db/queries";
import { ApplicationForm } from "@/components/applications/application-form";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const application = await getApplication(session!.user.id, id);

  if (!application) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit application</h1>
      <ApplicationForm application={application} />
    </div>
  );
}
