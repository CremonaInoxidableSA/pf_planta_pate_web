import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ProductoRealizado {
  NombreProducto: string;
  pesoTotal: number;
  cantidadCiclos: number;
  tiempoTotal: number;
}

interface FixedData {
  ProductosRealizados: ProductoRealizado[];
}

interface ProductBarProps {
  data: FixedData;
}

const BarraProductos: React.FC<ProductBarProps> = ({ data }) => {
  const produccionTotalEnKg = data.produccionTotal * 1000;

  const { t } = useTranslation();

  const productos = useMemo(() => {
    const generarColorPorIndice = (index: number): string => {
      const letras = "23456789ABCDE";
      let color = "#";
      let seed = index;

      for (let i = 0; i < 6; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        color += letras[Math.floor((seed / 233280) * 13)];
      }

      return color;
    };

    return data.ProductosRealizados.map((producto, index) => {
      const porcentaje = (producto.pesoTotal * 100) / produccionTotalEnKg;

      return {
        nombre: producto.NombreProducto,
        peso: producto.pesoTotal + "kg",
        cantidadCiclos: producto.cantidadCiclos,
        porcentaje: porcentaje.toFixed(1),
        color: generarColorPorIndice(index),
      };
    });
  }, [data.ProductosRealizados, produccionTotalEnKg]);

  return (
    <div>
      <h3 className="text-xl font-bold text-texto">
        % {t("barraProductos.texto")}
      </h3>
      <div className="flex h-[20px] rounded-[5px] overflow-hidden bg-[#444] mb-[15px]">
        {productos.map((producto, index) => (
          <div
            key={index}
            className="relative h-full"
            style={{
              width: `${producto.porcentaje}%`,
              backgroundColor: producto.color,
            }}
          >
            {/* Tooltip siempre visible */}
            <span className="absolute product-tooltip bg-[rgba(0,0,0,0.7)] text-texto px-[10px] py-[5px] rounded-[5px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap z-10 pointer-events-none">
              {`Ciclos: ${producto.cantidadCiclos}`}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-around flex-wrap">
        {productos.map((producto, index) => (
          <div key={index} className="flex items-center my-[5px] mx-[10px]">
            <span
              className="w-[15px] h-[15px] rounded-[3px] mr-[5px]"
              style={{ backgroundColor: producto.color }}
            />
            <p className="text-texto">{`${producto.nombre} - ${producto.porcentaje}% (${producto.peso})`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarraProductos;
