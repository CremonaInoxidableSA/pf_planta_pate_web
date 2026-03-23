"use client";

import { ImagenLayout } from "@/components/home/imagenLayout";
import { Alarmas } from "@/components/home/alarmas";

export default function Home() {
  return (
    <section className="p-5 flex flex-row w-full gap-5 items-center bg-background2 rounded-md">
      <div className="w-1/6 h-full flex items-center justify-center">
        <Alarmas />
      </div>

      <hr className="h-[95%] w-0.5 mx-0.5 border-none bg-background6 z-500" />

      <div className="w-full h-full flex items-center justify-center">
        <ImagenLayout />
      </div>
    </section>
  );
}
