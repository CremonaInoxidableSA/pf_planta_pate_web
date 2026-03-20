import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo/creminox-logo.webp";
import { FiMapPin } from "react-icons/fi";
import { CiMail } from "react-icons/ci";

interface FooterOption {
  id: number;
  icono: React.ReactNode;
  link: string;
  texto: string;
}

const Footer: React.FC = () => {
  const opcionesIzq: FooterOption[] = [
    {
      id: 1,
      icono: <FiMapPin className="w-auto h-full" />,
      link: "https://www.google.com/maps/place/Beron+de+Astrada+2745,+CABA,+Argentina",
      texto: "Beron de Astrada 2745, CABA, Argentina",
    },
  ];

  const opcionesDer: FooterOption[] = [
    {
      id: 2,
      icono: <CiMail className="w-auto h-full" />,
      link: "mailto:soporte@creminox.com",
      texto: "soporte@creminox.com",
    },
  ];

  return (
    <footer className="flex flex-col align-middle bg-headerbg">
      <div className="flex flex-row w-full max-w-1920 h-40 justify-between align-middle p-10">
        <ul className="flex flex-col justify-center align-middle h-full w-[30%]">
          {opcionesIzq.map(({ id, icono, link, texto }) => (
            <li
              key={id}
              className="flex flex-row items-center justify-start h-1/2 py-[1vh] gap-2.5"
            >
              <Link
                className="flex flex-row items-center h-full gap-2.5"
                href={link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {icono}
                <p className="items-center">{texto}</p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex justify-center align-middle h-full w-[40%]">
          <Link
            className="flex w-auto h-full p-0 justify-center items-center"
            href="https://creminox.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image src={Logo} alt="Creminox logo" />
          </Link>
        </div>

        <ul className="flex flex-col justify-center align-middle h-full w-[30%]">
          {opcionesDer.map(({ id, icono, link, texto }) => (
            <li
              key={id}
              className="flex flex-row items-center justify-end h-1/2 py-[1vh] gap-2.5"
            >
              <Link
                className="flex flex-row items-center h-full gap-3.75"
                href={link}
                rel="noopener noreferrer"
                target="_blank"
              >
                <p className="items-center">{texto}</p>
                {icono}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-[#6668]" />

      <p className="flex text-xs font-light text-texto2 py-1.25 w-full justify-center align-middle">
        ©2025 All Rights Reserved Cremona Inoxidable PF - alpha 0.0.01
      </p>
    </footer>
  );
};

export default Footer;
