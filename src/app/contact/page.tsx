import type { Metadata } from "next";
import { ContactSection } from "@/features/contact/ContactSection";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <ContactSection />;
}
