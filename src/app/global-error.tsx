"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0a0a",
            color: "#f8f8f8",
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#E60026", fontSize: "2.5rem", margin: 0 }}>
            Error crítico
          </h1>
          <p style={{ marginTop: "1rem", opacity: 0.8 }}>
            Ha ocurrido un error grave. Por favor, recarga la página.
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#E60026",
                color: "white",
                border: "2px solid #E60026",
                padding: "0.75rem 1.5rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
            <a
              href="/"
              style={{
                border: "2px solid rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.8)",
                padding: "0.75rem 1.5rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textDecoration: "none",
              }}
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
