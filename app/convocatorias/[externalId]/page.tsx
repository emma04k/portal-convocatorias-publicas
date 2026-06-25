import { ConvocatoriaDetail } from "@/components/convocatorias/convocatoria-detail";

type ConvocatoriaDetailPageProps = {
  params: {
    externalId: string;
  };
};

export default function ConvocatoriaDetailPage({ params }: ConvocatoriaDetailPageProps) {
  return (
    <main className="content-shell">
      <ConvocatoriaDetail externalId={params.externalId} />
    </main>
  );
}
