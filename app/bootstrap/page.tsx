"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BootstrapPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch(`/api/needs-setup`);
        const data = await res.json();

        if (data.needs_setup) {
          setNeedsSetup(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/proxy/auth/create-superadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          nombre,
          apellido,
          password,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Invalidar cache de needs-setup para que no redirija más a bootstrap
      await fetch("/api/needs-setup/invalidate", { method: "POST" });

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Error al conectarse con el servidor");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Verificando estado del sistema...</p>
      </div>
    );
  }

  if (!needsSetup) {
    return null;
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="h-auto w-[40vw] flex flex-col bg-background2 p-5 rounded">
        <h1 className="text-4xl font-semibold w-full flex justify-center">
          Crear Superadmin Inicial
        </h1>
        <p className="text-md my-3">
          No hay usuarios en la base de datos. Por favor, crea el usuario
          administrador.
        </p>

        {success && (
          <div>
            {success} Superadmin creado exitosamente. Redirigiendo al login...
          </div>
        )}

        {error && <div>❌ {error}</div>}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full h-auto gap-2.5"
        >
          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="username"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background3 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
            />
          </div>

          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="email"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background3 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
            />
          </div>

          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="nombre"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-background3 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
            />
          </div>

          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="apellido"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Apellido
            </label>
            <input
              id="apellido"
              type="text"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="bg-background3 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
            />
          </div>

          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="password"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background3 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#e82a31] mt-4 p-1 rounded w-full h-13 flex items-center justify-center border-none font-semibold cursor-pointer disabled:bg-[#a82328] disabled:cursor-not-allowed text-texto"
          >
            {loading ? "Creando..." : "Crear Superadmin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BootstrapPage;
