"use client";
import dynamic from "next/dynamic";

const Tabla = dynamic(() => import("@/app/alertas/tabla"), { ssr: false });

export default function Home() {
  return (
    <section className="flex flex-col w-full min-h-[70vh] min-w-162.5 gap-5">
      <Tabla />
    </section>
  );
}
