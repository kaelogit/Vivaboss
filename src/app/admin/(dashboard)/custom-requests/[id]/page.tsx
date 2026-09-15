import CustomRequestDetailClient from "@/components/admin/CustomRequestDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCustomRequestDetailPage({ params }: Props) {
  const { id } = await params;
  return <CustomRequestDetailClient requestId={id} />;
}
