import { notFound } from "next/navigation";
import { getWorkById, getNextWork, getWorks } from "@/lib/supabase/queries";
import WorkDetailClient from "@/components/works/WorkDetailClient";

export const revalidate = 3600; // Revalidate every hour; individual work detail pages
export const dynamicParams = true; // Allow new works added after build to be rendered on-demand

/**
 * [P2.14] Pre-render all current works at build time.
 * New works added via the admin dashboard will be served on-demand (dynamicParams=true)
 * and then cached in the ISR store for subsequent requests.
 */
export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((work) => ({ id: work.id }));
}

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
