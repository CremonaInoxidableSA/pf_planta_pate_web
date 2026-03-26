"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CambioPass = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current_password: "", new_password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    key: "current_password" | "new_password",
    value: string,
  ) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.current_password || !form.new_password) {
      toast.error(t("min.completeCampos"), {
        position: "top-center",
      });
      return;
    }

    setLoading(true);

    try {
      const token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("access_token") ||
            localStorage.getItem("token"))) ||
        undefined;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/proxy/auth/cambiar_password`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
        credentials: "include",
      });

      let data: {
        success?: boolean;
        detail?: string;
        error?: string;
        message?: string;
      } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && (data.success ?? true)) {
        toast.success(t("min.contraCambiada"), {
          position: "top-center",
        });
        setOpen(false);
        setForm({ current_password: "", new_password: "" });
      } else {
        const message =
          data.detail ?? data.error ?? data.message ?? t("min.errorContra");
        toast.error(message, {
          position: "top-center",
        });
      }
    } catch {
      toast.error(t("min.errorConexion"), {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2 w-full border border-botonblueborder bg-botonblue hover:bg-botonbluehover text-texto cursor-pointer">
          <p className="text-botonblueborder font-medium">
            {t("min.cambiarContra")}
          </p>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150 bg-background3 z-800">
        <DialogHeader>
          <DialogTitle>{t("min.cambiarContra")}</DialogTitle>
          <DialogDescription>{t("min.completaDatosCambiar")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current_password">{t("min.contraActual")}</Label>
            <Input
              id="current_password"
              type="password"
              value={form.current_password}
              onChange={(e) => handleChange("current_password", e.target.value)}
              placeholder={t("min.ingreseContraActual")}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new_password">{t("min.nuevaContra")}</Label>
            <Input
              id="new_password"
              type="password"
              value={form.new_password}
              onChange={(e) => handleChange("new_password", e.target.value)}
              placeholder={t("min.ingreseNuevaContra")}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("min.cancelar")}</Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>{t("min.cambiando")}</span>
              </div>
            ) : (
              t("min.cambiar")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CambioPass;
