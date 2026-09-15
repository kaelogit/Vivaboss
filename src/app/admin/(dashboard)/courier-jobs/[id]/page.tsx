import CourierJobDetailClient from "@/components/admin/CourierJobDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <CourierJobDetailClient jobId={id} />;
}
