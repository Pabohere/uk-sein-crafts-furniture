import { EventArticle } from "@/components/dynamic-pages";
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventArticle id={id} />;
}
