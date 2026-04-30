import { getSiteSettings } from "@/lib/supabase/queries";
import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Story — BT ADV",
  description:
    "Founded in 2024, BT Advertising Agency bridges raw imagination and premium cinematic reality. " +
    "From high-end TV commercials to viral digital campaigns across Egypt and the Middle East.",
  openGraph: {
    title: "Our Story — BT ADV",
    description: "Cinematic production agency built on bold ideas and flawless execution.",
  },
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const heroImage = settings.about_hero_image || '/images/about-hero.jpg';

  return <AboutPageClient heroImage={heroImage} />;
}
