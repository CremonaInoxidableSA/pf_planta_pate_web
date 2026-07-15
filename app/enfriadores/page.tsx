import EquipoPage from "@/components/monitoreoIndividual/equiposPage";

interface EnfriadoresPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function EnfriadoresPage({
  searchParams,
}: EnfriadoresPageProps) {
  const { id } = await searchParams;

  return <EquipoPage type="enfriador" initialId={id} />;
}
