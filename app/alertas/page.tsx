"use client";
import dynamic from "next/dynamic";

const Tabla = dynamic(() => import("@/components/tabla"), { ssr: false });

export default function Home() {
  return (
    <section className="flex flex-col w-[100%] min-h-[70vh] min-w-[650px] gap-[20px]">
      <Tabla />
    </section>
  );
}
