"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import CambioPass from "@/components/userIcon/cambioPass";
import { UserAvatar } from "@/components/userIcon/userAvatar";

import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

import { useTranslation } from "react-i18next";

const UserIcon = () => {
  const router = useRouter();
  const { logout, nombre, apellido, rol, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { t } = useTranslation();

  const displayName =
    `${nombre ?? ""}${nombre || apellido ? " " : ""}${apellido ?? ""}`.trim() ||
    t("min.usuario");

  const closeSession = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setOpen(false);
    } catch {
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cursor-pointer">
        <div className="group relative flex items-center justify-center w-6.25 h-6.25 ease-in-out">
          <div className="absolute inset-0 rounded-full bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150" />
          <div className="transition-transform ease-in-out group-hover:scale-110">
            <UserAvatar
              nombre={nombre}
              apellido={apellido}
              rol={rol}
              loading={loading}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="z-901">
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>{t("min.verificando")}</span>
          </div>
        ) : (
          <>
            <p className="text-lg">{displayName}</p>
            <p className="text-xs">{rol}</p>

            {rol === "admin" || rol === "superadmin" ? (
              <Button
                className="mt-2 w-full border border-botonblueborder bg-botonblue hover:bg-botonbluehover text-texto cursor-pointer"
                onClick={() => {
                  router.push("/config_user");
                  setOpen(false);
                }}
              >
                <p className="text-botonblueborder font-medium">
                  {t("min.configUsuarios")}
                </p>
              </Button>
            ) : (
              <CambioPass />
            )}
            <Button
              className="mt-2 w-full bg-redlogo hover:bg-red2 text-texto cursor-pointer"
              onClick={closeSession}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>{t("min.cargando")}</span>
                </div>
              ) : (
                <p className="text-white font-medium">
                  {t("min.cerrarSesion")}
                </p>
              )}
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UserIcon;
