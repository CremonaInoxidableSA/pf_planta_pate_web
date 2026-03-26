import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { authFetch } from "@/app/api/api";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

export default function GenerarReclamo() {
  const { t } = useTranslation();
  const { email } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    area: "",
    reporte: "",
  });

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.apellido || !form.area || !form.reporte) {
      toast.error(t("min.completeAllFields"), {
        position: "top-center",
      });
      return;
    }

    if (!email) {
      toast.error(t("min.errorEmail"), {
        position: "top-center",
      });
      return;
    }

    try {
      const response = await authFetch(`/api/proxy/mail/reclamos/crear`, {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          area: form.area,
          reporte: form.reporte,
          email: email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enviado) {
          toast.success(t("min.reclamoEnviado"), {
            position: "top-center",
          });
          setForm({ nombre: "", apellido: "", area: "", reporte: "" });
        } else {
          toast.error(t("min.errorReclamo"), {
            position: "top-center",
          });
        }
      } else {
        toast.error(t("min.errorReclamo"), {
          position: "top-center",
        });
      }
    } catch {
      toast.error(t("min.errorReclamo"), {
        position: "top-center",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-150 bg-background3 z-800">
      <DialogHeader>
        <DialogTitle>{t("min.generarReclamo")}</DialogTitle>
        <DialogDescription>
          {t("min.completaDatosCrearUsuario")}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("min.nombre")}</Label>
          <Input
            id="name"
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder={t("min.ingreseNombreUsuario")}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="surname">{t("min.apellido")}</Label>
          <Input
            id="surname"
            value={form.apellido}
            onChange={(e) => handleChange("apellido", e.target.value)}
            placeholder={t("min.ingreseApellidoUsuario")}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>{t("min.dondeProblema")}</Label>
          <Select
            value={form.area}
            onValueChange={(v) => handleChange("area", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("min.seleccioneArea")} />
            </SelectTrigger>
            <SelectContent className="z-900">
              <SelectGroup>
                <SelectLabel>{t("min.rol")}</SelectLabel>
                <SelectItem value="exportacion">
                  {t("min.exportacion")}
                </SelectItem>
                <SelectItem value="visual">{t("min.visual")}</SelectItem>
                <SelectItem value="reportes">{t("min.reportes")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>{t("min.detalleReclamo")}</Label>
        <Textarea
          className="w-full"
          placeholder={t("min.detalleReclamo")}
          rows={5}
          value={form.reporte}
          onChange={(e) => handleChange("reporte", e.target.value)}
        ></Textarea>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">{t("min.cancelar")}</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>{t("min.generarReclamo")}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
