"use client";

import { useState } from "react";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-red focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Props = {
  defaultEmail: string;
  defaultName?: string;
  role?: string;
};

export function ContactForm({ defaultEmail, defaultName, role }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message ?? "Error al enviar");
      return;
    }

    setSuccess(true);
    form.reset();
  };

  if (success) {
    return (
      <div className="mt-10 max-w-xl border-2 border-punk-green/50 bg-punk-green/10 p-6">
        <h2 className="font-display text-xl text-punk-green">Mensaje enviado</h2>
        <p className="mt-2 font-body text-punk-white/90">
          Tu mensaje ha sido enviado correctamente. Te responderemos a la mayor brevedad.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 border-2 border-punk-green px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-green transition-all hover:bg-punk-green hover:text-punk-black"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-xl space-y-6">
      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Nombre / Entidad
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            defaultValue={defaultName}
            placeholder="Tu nombre o el de tu banda/sala/festival"
            className={inputClass}
            readOnly={!!defaultName}
          />
          {role && (
            <p className="mt-1 font-body text-xs text-punk-white/50">
              Rol: {role}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            className={`${inputClass} bg-punk-black/50`}
            readOnly
          />
          <p className="mt-1 font-body text-xs text-punk-white/50">
            Las respuestas se enviarán a este correo
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          Asunto *
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="Ej: Consulta sobre publicación de evento"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Mensaje *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={5000}
          placeholder="Escribe tu mensaje con el detalle que necesites. Incluye información relevante sobre tu banda, sala, festival o evento si aplica."
          className={inputClass}
        />
        <p className="mt-1 font-body text-xs text-punk-white/50">
          Mínimo 10 caracteres, máximo 5000
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-red bg-punk-red px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-transparent hover:text-punk-red disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}
