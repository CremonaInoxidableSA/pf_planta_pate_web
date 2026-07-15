"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import LogoBase64 from "@/public/logo/LogoBase64";
import { Button } from "@/components/ui/button";

const Spinner = () => (
  <div className="border border-solid border-[#f3f3f3] border-t-[#e82a31] rounded-[100%] w-6 h-6 animate-spin" />
);

interface ResetPasswordProps {
  initialToken?: string;
}

const ResetPassword = ({ initialToken }: ResetPasswordProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const verificarToken = useCallback(
    async (tokenToVerify: string) => {
      try {
        const response = await fetch(
          `/api/proxy/mail/verificar-token-recuperacion?token=${tokenToVerify}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setTokenValid(true);
          setEmail(data.email);
        } else {
          toast.error(data.error || t("min.tokenInvalidoExpirado"));
          setTokenValid(false);
        }
      } catch {
        toast.error(t("min.errorConexionServidor"));
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
      verificarToken(initialToken);
    } else {
      toast.error("Token no encontrado");
      setValidatingToken(false);
    }
  }, [initialToken, verificarToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("min.contrasNoCoinciden"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("min.contraMinima"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/proxy/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t("min.contraActualizadaExitosamente"));
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.error || t("min.errorActualizarContra"));
      }
    } catch {
      toast.error(t("min.errorConexionServidor"));
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <section className="flex h-full w-full items-center justify-center">
        <div className="w-auto h-[40vh] gap-3.75 flex flex-col items-center justify-center p-[3rem_4rem_2rem_4rem] max-w-480 bg-backgroundoscuro rounded-md">
          <LogoBase64 className="flex w-[65%] p-0 h-auto" />
          <div className="flex flex-col items-center gap-5">
            <Spinner />
            <p className="text-center">{t("min.verificandoToken")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!tokenValid) {
    return (
      <section className="flex h-full w-full items-center justify-center">
        <div className="w-auto h-[40vh] gap-3.75 flex flex-col items-center justify-center p-[3rem_4rem_2rem_4rem] max-w-480 bg-backgroundoscuro rounded-md">
          <LogoBase64 className="flex w-[65%] p-0 h-auto" />
          <div className="flex flex-col items-center gap-5 w-full">
            <p className="text-center text-red-500 font-semibold">
              {t("min.tokenInvalidoExpirado")}
            </p>
            <Link
              className="w-full flex text-center justify-center text-[#5d5d5d] h-auto text-[14px] font-semibold tracking-[0.5px] cursor-pointer hover:text-[#e82a31] ease-in-out"
              href="/login/recuperacion"
            >
              {t("min.solicitarNuevoEnlace")}
            </Link>
            <Link
              className="w-full flex text-center justify-center text-[#5d5d5d] h-auto text-[14px] font-semibold tracking-[0.5px] cursor-pointer hover:text-[#e82a31] ease-in-out"
              href="/login"
            >
              {t("min.volverInicioSesion")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full items-center justify-center">
      <div className="w-auto h-auto gap-3.75 flex flex-col items-center p-[3rem_4rem_2rem_4rem] max-w-480 bg-backgroundoscuro rounded-md">
        <LogoBase64 className="flex w-[65%] p-0 h-auto" />

        <div className="w-full text-center mb-4">
          <h2 className="text-xl font-semibold mb-2">
            {t("min.restablecerContrasena")}
          </h2>
          <p className="text-sm text-gray-400">
            {t("min.para")}: {email}
          </p>
        </div>

        <form
          className="flex flex-col w-full justify-between gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.25">
            <label
              htmlFor="newPassword"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              {t("min.nuevaContrasena")}
            </label>
            <input
              className="bg-background2 p-3 rounded-md w-full flex items-center justify-center border-none px-4"
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("min.minimo6Caracteres")}
            />
          </div>

          <div className="flex flex-col gap-1.25">
            <label
              htmlFor="confirmPassword"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              {t("min.confirmarContrasena")}
            </label>
            <input
              className="bg-background2 p-3 rounded-md w-full flex items-center justify-center border-none px-4"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("min.repiteContrasena")}
            />
          </div>

          <Button
            disabled={loading}
            type="submit"
            className="bg-[#e82a31] mt-1.25 p-3 rounded-md w-full h-13 flex items-center justify-center border-none font-semibold cursor-pointer disabled:bg-[#a82328] disabled:cursor-not-allowed text-texto"
          >
            {loading ? <Spinner /> : t("min.actualizarContrasena")}
          </Button>
        </form>

        <Link
          className="w-full flex text-center justify-center text-[#5d5d5d] h-auto text-[14px] font-semibold tracking-[0.5px] cursor-pointer hover:text-[#e82a31] ease-in-out mt-2"
          href="/login"
        >
          {t("min.volverInicioSesion")}
        </Link>
      </div>
    </section>
  );
};

export default ResetPassword;
