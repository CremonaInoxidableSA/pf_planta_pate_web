import EquipoPage from "@/components/monitoreoIndividual/equiposPage";

interface CocinasPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function CocinasPage({ searchParams }: CocinasPageProps) {
  const { id } = await searchParams;

  return <EquipoPage type="cocina" initialId={id} />;
}
