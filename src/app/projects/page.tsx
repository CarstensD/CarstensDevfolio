import type { Metadata } from "next";
import { WorkSection } from "@/features/work/WorkSection";

export const metadata: Metadata = { title: "Work" };

export default function ProjectsPage() {
  return <WorkSection />;
}
