"use client";

import { useTranslation } from "react-i18next";

interface Producto {
  nombre_receta: string;
  capacidad_receta: number;
  cantidad_ciclos: number;
}

interface BarraProductosProps {
  productos: Producto[];
}

const BarraProductos = ({ productos }: BarraProductosProps) => {
  const { t } = useTranslation();

  const totalCiclos = productos.reduce((sum, p) => sum + p.cantidad_ciclos, 0);

  const colores = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];

  return (
    <div className="w-full gap-5 flex flex-col text-texto">
      <div className="flex items-center justify-between">
        <h1 className="whitespace-nowrap">% {t("min.productoRealizado")}</h1>
        <h1>{t("min.total")}</h1>
      </div>

      {productos.length > 0 ? (
        <>
          <div className="w-full h-6 bg-background3 rounded-md overflow-hidden flex">
            {productos.map((producto, index) => {
              const porcentaje =
                totalCiclos > 0
                  ? (producto.cantidad_ciclos / totalCiclos) * 100
                  : 0;
              return (
                <div
                  key={producto.nombre_receta}
                  className={`${colores[index % colores.length]} h-full transition-all`}
                  style={{ width: `${porcentaje}%` }}
                  title={`${producto.nombre_receta}: ${producto.cantidad_ciclos} ciclos (${porcentaje.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {productos.map((producto, index) => {
              const porcentaje =
                totalCiclos > 0
                  ? (producto.cantidad_ciclos / totalCiclos) * 100
                  : 0;
              return (
                <div
                  key={producto.nombre_receta}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-3 h-3 rounded-sm ${colores[index % colores.length]}`}
                  />
                  <span>
                    {producto.nombre_receta}: {producto.cantidad_ciclos} (
                    {porcentaje.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="w-full h-6 bg-background3 rounded-md" />
      )}
    </div>
  );
};

export default BarraProductos;
