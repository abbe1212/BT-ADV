import { MessagesPage } from "@/components/admin/messages/MessagesPage";
import { getAllMessages } from "@/lib/supabase/queries";

// Messages must always show the latest — no caching.
export const dynamic = 'force-dynamic';

export default async function MessagesRoute() {
  const messages = await getAllMessages();
  return <MessagesPage initialMessages={messages} />;
}
