"use client";

import React, { useState } from "react";
import { authFetch } from "@/app/api/api";
import { useTranslation } from "react-i18next";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onUserCreated: () => void;
};

export default function FormUsuario({ onUserCreated }: Props) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    username: "",
    nombre: "",
    apellido: "",
    rol: "",
    password: "",
    reporte: true,
    habilitado: 1,
  });

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      alert(t("min.emailInvalido"));
      return;
    }

    const payload = { ...form, habilitado: form.habilitado ? 1 : 0 };

    const res = await authFetch(`/api/proxy/auth/crear_usuario`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.detail || t("min.errorCrearUsuario"));
      return;
    }

    onUserCreated();
  };

  return (
    <DialogContent className="w-full bg-background3 z-800 p-5">
      <DialogHeader>
        <DialogTitle>{t("min.crearUsuario")}</DialogTitle>
        <DialogDescription>
          {t("min.completaDatosCrearUsuario")}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("min.email")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder={t("min.ingreseCorreoUsuario")}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username">{t("min.usuario")}</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder={t("min.asigneUsuarioUnico")}
            required
          />
        </div>

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
          <Label>{t("min.rol")}</Label>
          <Select onValueChange={(v) => handleChange("rol", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("min.seleccioneRol")} />
            </SelectTrigger>
            <SelectContent className="z-900">
              <SelectGroup>
                <SelectLabel>{t("min.rol")}</SelectLabel>
                <SelectItem value="admin">{t("min.admin")}</SelectItem>
                <SelectItem value="user">{t("min.usuario")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{t("min.contra")}</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder={t("min.ingreseContraseñaUsuario")}
        />
      </div>

      <RadioGroup
        defaultValue={form.reporte ? "true" : "false"}
        onValueChange={(v) => handleChange("reporte", v === "true")}
      >
        <Label className="mb-2 mt-4">{t("min.recibeReportes")}</Label>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="option-one" />
          <Label htmlFor="option-one">{t("min.si")}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="option-two" />
          <Label htmlFor="option-two">{t("min.no")}</Label>
        </div>
      </RadioGroup>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">{t("min.cancelar")}</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>{t("min.crearUsuario")}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
