import CustomerDetailClient from "@/components/admin/CustomerDetailClient";

type Props = { params: Promise<{ email: string }> };

export default async function Page({ params }: Props) {
  const { email } = await params;
  let decoded = email;
  try {
    decoded = decodeURIComponent(email);
  } catch {
    /* keep raw */
  }
  return <CustomerDetailClient emailParam={decoded} />;
}
