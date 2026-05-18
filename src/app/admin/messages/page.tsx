import { MessagesPage } from "@/components/admin/messages/MessagesPage";
import { getAllMessages } from "@/lib/supabase/queries";

// Messages must always show the latest — no caching.
export const dynamic = 'force-dynamic';

export default async function MessagesRoute() {
  // [P1.11] getAllMessages now returns { data, count } with default limit of 50.
  const { data: messages, count } = await getAllMessages({ limit: 50 });
  return <MessagesPage initialMessages={messages} totalCount={count} />;
}
