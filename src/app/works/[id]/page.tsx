import { notFound } from "next/navigation";
import { getWorkById, getNextWork } from "@/lib/supabase/queries";
import WorkDetailClient from "@/components/works/WorkDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const work = await getWorkById(id);
  
  if (!work) {
    return { title: "Work Not Found — BT ADV" };
  }

  return {
    title: `${work.title_en ?? work.title_ar} — BT ADV`,
    description: `${work.category} production by BT Advertising Agency.`,
  };
}

export default async function WorkDetailsPage({ params }: Props) {
  const { id } = await params;
  const work = await getWorkById(id);

  if (!work) {
    notFound();
  }

  const nextWork = await getNextWork(work.order_index);

  return <WorkDetailClient work={work} nextWork={nextWork} />;
}
