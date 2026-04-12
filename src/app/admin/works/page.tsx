import { WorksPage } from "@/components/admin/works/WorksPage";
import { getAllAdminWorks } from "@/lib/supabase/queries";

// Works admin page uses search params for filtering/pagination — must re-render per request.
export const dynamic = 'force-dynamic';

export default async function WorksRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page    = parseInt((resolvedParams?.page    as string) || '1');
  const limit   = parseInt((resolvedParams?.limit   as string) || '20');
  const offset  = (page - 1) * limit;
  const search  = (resolvedParams?.search  as string) || undefined;
  const category = (resolvedParams?.category as string) || undefined;

  const { data: works, count } = await getAllAdminWorks({ limit, offset, search, category });

  return <WorksPage initialWorks={works} totalCount={count} currentPage={page} pageSize={limit} />;
}

