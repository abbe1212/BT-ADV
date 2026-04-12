import { BookingsPage } from "@/components/admin/bookings/BookingsPage";
import { getAllBookings } from "@/lib/supabase/queries";

// Bookings must always be fresh — never cache
export const dynamic = 'force-dynamic';

export default async function BookingsRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const page = parseInt((resolvedParams?.page as string) || '1');
  const limit = parseInt((resolvedParams?.limit as string) || '20');
  const offset = (page - 1) * limit;
  
  const search   = (resolvedParams?.search   as string) || undefined;
  const status   = (resolvedParams?.status   as string) || undefined;
  const type     = (resolvedParams?.type     as string) || undefined;
  const dateFrom = (resolvedParams?.dateFrom as string) || undefined;
  const dateTo   = (resolvedParams?.dateTo   as string) || undefined;

  const { data, count } = await getAllBookings({
    limit,
    offset,
    search,
    status,
    type,
    dateFrom,
    dateTo,
  });

  return (
    <BookingsPage
      initialBookings={data}
      totalCount={count}
      currentPage={page}
      pageSize={limit}
    />
  );
}
