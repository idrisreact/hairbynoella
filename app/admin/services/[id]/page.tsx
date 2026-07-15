
import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditServiceClient from "./EditServiceClient";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await db.select().from(services).where(eq(services.id, id)).limit(1);

  if (!service.length) {
    notFound();
  }

  return <EditServiceClient service={service[0]} />;
}
