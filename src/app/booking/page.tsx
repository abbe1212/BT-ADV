import { getClients } from "@/lib/supabase/queries";
import BookingPageClient from "@/components/booking/BookingPageClient";

export const metadata = {
  title: "Book Your Slot — BT ADV",
  description: "Schedule a consultation with BT Advertising Agency for your next cinematic production.",
};

export default async function BookingPage() {
  const clients = await getClients();

  return <BookingPageClient clientLogos={clients} />;
}
