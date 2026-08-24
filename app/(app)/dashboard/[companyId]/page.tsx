import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ companyId: string }>;
}

export default async function DashboardCompanyPage({ params }: Props) {
  const { companyId } = await params;
  redirect(`/companies/${companyId}`);
}
