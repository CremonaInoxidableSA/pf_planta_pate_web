"use client";

import React, { useState, useEffect } from "react";
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
  usernameToEdit?: string;
  userIdToEdit?: number;
};

export default function FormUsuario({
  onUserCreated,
  usernameToEdit,
  userIdToEdit,
}: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(!!usernameToEdit);
  const [form, setForm] = useState({
    id: userIdToEdit || undefined,
    email: "",
    username: "",
    nombre: "",
    apellido: "",
    rol: "",
    password: "",
    reporte: true,
    habilitado: 1,
  });

  const isEditing = !!usernameToEdit;

  useEffect(() => {
    if (!usernameToEdit) return;

    const fetchUserData = async () => {
      try {
        const res = await authFetch(
          `/api/proxy/auth/data_usuario/${usernameToEdit}`,
          { method: "GET" },
        );

        if (!res.ok) {
          throw new Error("Error al cargar datos del usuario");
        }

        const data = await res.json();
        setForm({
          id: data.id || userIdToEdit,
          email: data.email,
          username: data.username,
          nombre: data.nombre,
          apellido: data.apellido,
          rol: data.rol,
          password: "",
          reporte: data.reporte,
          habilitado: data.habilitado,
        });
      } catch {
        alert(t("min.errorCargarUsuario") || "Error al cargar usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [usernameToEdit, t, userIdToEdit]);

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      alert(t("min.emailInvalido"));
      return;
    }

    if (!isEditing && !form.password) {
      alert(t("min.contraRequerida"));
      return;
    }

    const payload = {
      ...form,
      habilitado: form.habilitado ? 1 : 0,
      password: isEditing && !form.password ? undefined : form.password,
    };

    const endpoint = isEditing ? "/editar_usuario" : "/crear_usuario";
    const res = await authFetch(`/api/proxy/auth${endpoint}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(
        err.detail ||
          t(isEditing ? "min.errorEditarUsuario" : "min.errorCrearUsuario"),
      );
      return;
    }

    onUserCreated();
  };

  if (loading) {
    return (
      <DialogContent className="sm:max-w-150 bg-background3 z-800">
        <DialogHeader>
          <DialogTitle>{t("min.cargando") || "Cargando..."}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center py-8">
          <p>{t("min.cargando") || "Cargando..."}</p>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-150 bg-background3 z-800">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? t("min.editarUsuario") : t("min.crearUsuario")}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? t("min.modificaDatosUsuario")
            : t("min.completaDatosCrearUsuario")}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
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
          <Select
            value={form.rol}
            onValueChange={(v) => handleChange("rol", v)}
          >
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
        <Label htmlFor="password">
          {t("min.contra")} {isEditing && `(${t("min.opcional")})`}
        </Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder={
            isEditing
              ? t("min.dejarVacioMantenerContra")
              : t("min.ingreseContraUsuario")
          }
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
        <Button onClick={handleSubmit}>
          {isEditing ? t("min.guardarCambios") : t("min.crearUsuario")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
