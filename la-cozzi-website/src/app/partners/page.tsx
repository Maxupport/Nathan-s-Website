import PartnersPage from "@/components/PartnersPage";
import { getPartners } from "@/lib/notion";

export const revalidate = 60;

export const metadata = {
  title: "夥伴列表 | La Cozzi 拉釦子樂團",
  description: "與 La Cozzi 合作的優質夥伴，包括婚禮顧問、場地與各領域專業人士。",
};

export default async function Page() {
  const partners = await getPartners();
  return <PartnersPage partners={partners} />;
}
