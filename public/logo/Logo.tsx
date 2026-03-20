"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (!mounted) {
    return <div className={className} style={{ minHeight: "50px" }} />;
  }

  return (
    <div className={className}>
      <Image
        fill
        priority
        alt="Creminox Logo"
        src="./creminox-logo.webp"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
