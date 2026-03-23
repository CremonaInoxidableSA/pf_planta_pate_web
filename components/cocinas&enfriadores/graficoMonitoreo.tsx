"use client";

const GraficoMonitoreo: React.FC<{ id: number }> = ({ id }) => {
  return (
    <div className="w-full h-full bg-background2 rounded-md flex items-center justify-center">
      <p className="text-texto text-lg">Gráfico de monitoreo para equipo {id}</p>
    </div>
  );
};

export default GraficoMonitoreo;
