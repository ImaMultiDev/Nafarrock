"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { isValidEmail, isPasswordValid } from "@/lib/validation";

type EntityImageInfo = {
  hasImages: boolean;
  logoUrl?: string | null;
  imageUrl?: string | null;
  images: string[];
};

type ClaimProps = {
  claimType?: "BAND" | "VENUE" | "FESTIVAL" | "ASOCIACION";
  claimId?: string;
  claimName?: string;
  entityImageInfo?: EntityImageInfo | null;
};

const ROLES = [
  { value: "USUARIO", label: "Usuario", desc: "Cuenta básica" },
  { value: "BANDA", label: "Banda", desc: "Requiere aprobación del admin" },
  { value: "SALA", label: "Sala / Espacio", desc: "Requiere aprobación" },
  { value: "FESTIVAL", label: "Festival", desc: "Requiere aprobación" },
  {
    value: "ASOCIACION",
    label: "Asociación / Sociedad",
    desc: "Requiere aprobación",
  },
  {
    value: "ORGANIZADOR",
    label: "Organizador de eventos",
    desc: "Requiere aprobación",
  },
  { value: "PROMOTOR", label: "Promotor", desc: "Requiere aprobación" },
] as const;

const GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
];

type Role = (typeof ROLES)[number]["value"];

type Member = { name: string; instrument: string };

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass =
  "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

const claimFolder: Record<
  "BAND" | "VENUE" | "FESTIVAL" | "ASOCIACION",
  "bands" | "venues" | "festivals" | "asociaciones"
> = {
  BAND: "bands",
  VENUE: "venues",
  FESTIVAL: "festivals",
  ASOCIACION: "asociaciones",
};

export function RegisterForm({
  claimType,
  claimId,
  claimName,
  entityImageInfo,
}: ClaimProps) {
  const router = useRouter();
  const isClaimMode = !!claimType && !!claimId && !!claimName;
  const [claimLogoUrl, setClaimLogoUrl] = useState("");
  const [claimImageUrl, setClaimImageUrl] = useState("");
  const [claimImages, setClaimImages] = useState<string[]>([]);
  const [imageChoice, setImageChoice] = useState<"keep_nafarrock" | "use_mine">(
    "keep_nafarrock",
  );
  const claimToRole: Record<
    "BAND" | "VENUE" | "FESTIVAL" | "ASOCIACION",
    Role
  > = {
    BAND: "BANDA",
    VENUE: "SALA",
    FESTIVAL: "FESTIVAL",
    ASOCIACION: "ASOCIACION",
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<Role>(
    claimType ? claimToRole[claimType] : "USUARIO",
  );
  const [members, setMembers] = useState<Member[]>([]);

  const addMember = () =>
    setMembers((m) => [...m, { name: "", instrument: "" }]);
  const removeMember = (i: number) =>
    setMembers((m) => m.filter((_, j) => j !== i));
  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers((m) =>
      m.map((x, j) => (j === i ? { ...x, [field]: value } : x)),
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const emailVal = String(formData.get("email") ?? "").trim();
    if (!isValidEmail(emailVal)) {
      setError("Introduce un email válido");
      return;
    }
    if (!isPasswordValid(password)) {
      setError(
        "La contraseña no cumple los requisitos: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
      );
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    let payload: Record<string, unknown>;

    if (isClaimMode && claimType && claimId && claimName) {
      const userHasImages = !!(
        claimLogoUrl ||
        claimImageUrl ||
        claimImages.length > 0
      );
      const needsChoice = entityImageInfo?.hasImages && userHasImages;
      payload = {
        email: formData.get("email"),
        password: formData.get("password"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone") || undefined,
        role: claimToRole[claimType],
        claimType,
        claimId,
        claimName,
        claimLogoUrl: claimLogoUrl || undefined,
        claimImageUrl: claimImageUrl || undefined,
        claimImages,
        imageChoice: needsChoice
          ? imageChoice
          : userHasImages
            ? "use_mine"
            : "keep_nafarrock",
      };
    } else {
      payload = {
        email: formData.get("email"),
        password: formData.get("password"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone") || undefined,
        role,
      };

      if (role !== "USUARIO") {
        payload.entityName = formData.get("entityName");
      }

      if (role === "BANDA") {
        payload.location = formData.get("location") || undefined;
        payload.foundedYear = formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined;
        payload.bio = formData.get("bio") || undefined;
        payload.genres = formData.getAll("genres");
        payload.spotifyUrl = formData.get("spotifyUrl") || undefined;
        payload.bandcampUrl = formData.get("bandcampUrl") || undefined;
        payload.instagramUrl = formData.get("instagramUrl") || undefined;
        payload.facebookUrl = formData.get("facebookUrl") || undefined;
        payload.youtubeUrl = formData.get("youtubeUrl") || undefined;
        payload.webUrl = formData.get("webUrl") || undefined;
        payload.members = members.filter(
          (m) => m.name.trim() && m.instrument.trim(),
        );
      }

      if (role === "SALA") {
        payload.city = formData.get("city");
        payload.address = formData.get("address") || undefined;
        payload.description = formData.get("description") || undefined;
        payload.foundedYear = formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined;
        payload.capacity = formData.get("capacity")
          ? Number(formData.get("capacity"))
          : undefined;
        payload.websiteUrl = formData.get("websiteUrl") || undefined;
        payload.mapUrl = formData.get("mapUrl") || undefined;
        payload.instagramUrl = formData.get("instagramUrl") || undefined;
        payload.facebookUrl = formData.get("facebookUrl") || undefined;
      }

      if (role === "FESTIVAL" || role === "ASOCIACION") {
        payload.location = formData.get("location") || undefined;
        payload.foundedYear = formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined;
        payload.description = formData.get("description") || undefined;
        payload.websiteUrl = formData.get("websiteUrl") || undefined;
        payload.instagramUrl = formData.get("instagramUrl") || undefined;
        payload.facebookUrl = formData.get("facebookUrl") || undefined;
      }

      if (role === "ORGANIZADOR" || role === "PROMOTOR") {
        payload.description = formData.get("description") || undefined;
        payload.websiteUrl = formData.get("websiteUrl") || undefined;
      }
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al registrarse");
      return;
    }
    if (data.requiresVerification && data.email) {
      router.push(
        `/auth/verificar-email?email=${encodeURIComponent(data.email)}`,
      );
    } else {
      router.push("/auth/login?registered=1");
    }
  };

  const needsEntity = role !== "USUARIO";

  return (
    <PageLayout>
      <div className="mx-auto max-w-xl">
        {isClaimMode ? (
          <>
            <Link
              href="/auth/reclamar"
              className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
            >
              ← Volver a buscar perfil
            </Link>
            <h1 className="mt-6 font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
              REGISTRARSE PARA RECLAMAR
            </h1>
            <p className="mt-3 font-body text-punk-white/60">
              Introduce tus datos para vincular tu cuenta al perfil de &quot;
              {claimName}&quot;. Una vez verificado el email, el administrador
              revisará tu solicitud.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
              REGISTRARSE
            </h1>
            <p className="mt-3 font-body text-punk-white/60">
              Crea tu cuenta como usuario o registra tu banda, sala, festival,
              promotor u organizador.
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {error && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{error}</p>
            </div>
          )}

          <section>
            <h2 className="font-display text-xl tracking-tighter text-punk-green mb-6">
              Datos personales
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  Nombre *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>
                  Apellidos *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="email" className={labelClass}>
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div className="mt-6">
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Contraseña *"
                required
                minLength={8}
                showStrength
                autoComplete="new-password"
              />
            </div>
            <div className="mt-6">
              <PasswordInput
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                label="Repetir contraseña *"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="mt-6">
              <label htmlFor="phone" className={labelClass}>
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={inputClass}
              />
            </div>
          </section>

          {isClaimMode ? (
            <>
              <section className="border-2 border-punk-green/30 bg-punk-green/5 p-6">
                <label className={labelClass}>Perfil que reclamas</label>
                <input
                  type="text"
                  value={claimName ?? ""}
                  readOnly
                  className={`${inputClass} cursor-not-allowed bg-punk-black/50`}
                />
                <p className="mt-2 font-body text-sm text-punk-white/70">
                  Una vez verificado y vinculado podrán cambiar el nombre.
                </p>
              </section>

              {claimType && claimId && (
                <section className="border-2 border-punk-green/30 bg-punk-green/5 p-6 space-y-6">
                  <h2 className="font-display text-xl tracking-tighter text-punk-green">
                    Imágenes de tu perfil (opcional)
                  </h2>
                  <p className="font-body text-sm text-punk-white/80">
                    Puedes subir logo e imágenes. Si Nafarrock ya ha añadido
                    imágenes a este perfil, podrás elegir si conservarlas o
                    reemplazarlas por las tuyas.
                  </p>
                  <div>
                    <ImageUpload
                      folder={claimFolder[claimType]}
                      type="logo"
                      claimMode
                      claimId={claimId}
                      value={claimLogoUrl}
                      onChange={setClaimLogoUrl}
                      onRemove={() => setClaimLogoUrl("")}
                      label="Logo"
                    />
                  </div>
                  {(claimType === "BAND" || claimType === "VENUE") && (
                    <div>
                      <ImageUpload
                        folder={claimFolder[claimType]}
                        type="image"
                        claimMode
                        claimId={claimId}
                        currentImageCount={0}
                        value={claimImageUrl}
                        onChange={setClaimImageUrl}
                        onRemove={() => setClaimImageUrl("")}
                        label="Imagen principal"
                      />
                    </div>
                  )}
                  <div>
                    <ImageGallery
                      folder={claimFolder[claimType]}
                      entityId={claimId}
                      claimMode
                      claimId={claimId}
                      images={claimImages}
                      onChange={setClaimImages}
                      label="Galería (máx. 3)"
                      maxImages={3}
                    />
                  </div>
                  {entityImageInfo?.hasImages &&
                    (claimLogoUrl ||
                      claimImageUrl ||
                      claimImages.length > 0) && (
                      <div className="border-t border-punk-white/20 pt-6">
                        <label className={labelClass}>
                          ¿Qué imágenes quieres en tu perfil?
                        </label>
                        <div className="mt-2 space-y-2">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="radio"
                              name="imageChoice"
                              value="keep_nafarrock"
                              checked={imageChoice === "keep_nafarrock"}
                              onChange={() => setImageChoice("keep_nafarrock")}
                              className="accent-punk-green"
                            />
                            <span className="font-body text-punk-white/90">
                              Conservar las de Nafarrock
                            </span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="radio"
                              name="imageChoice"
                              value="use_mine"
                              checked={imageChoice === "use_mine"}
                              onChange={() => setImageChoice("use_mine")}
                              className="accent-punk-green"
                            />
                            <span className="font-body text-punk-white/90">
                              Usar las mías
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                </section>
              )}
            </>
          ) : (
            <>
              <section>
                <label className={labelClass}>Tipo de cuenta</label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center gap-2 border-2 px-4 py-2 transition-colors ${
                        role === r.value
                          ? "border-punk-green bg-punk-green/10 text-punk-green"
                          : "border-punk-white/20 hover:border-punk-white/40 text-punk-white/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => setRole(r.value)}
                        className="sr-only"
                      />
                      <span className="font-punch text-xs uppercase">
                        {r.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 font-body text-xs text-punk-white/50">
                  {ROLES.find((r) => r.value === role)?.desc}
                </p>
              </section>

              {needsEntity &&
                (role === "BANDA" ||
                  role === "SALA" ||
                  role === "FESTIVAL" ||
                  role === "ASOCIACION") && (
                  <div className="border-2 border-punk-green/30 bg-punk-green/5 p-4">
                    <p className="font-body text-punk-white/90">
                      ¿Tu perfil ya existe en Nafarrock? Búscalo y reclámalo
                      para gestionarlo tú mismo.
                    </p>
                    <Link
                      href="/auth/reclamar"
                      className="mt-2 inline-block font-punch text-xs uppercase tracking-widest text-punk-green hover:underline"
                    >
                      Buscar y reclamar perfil →
                    </Link>
                  </div>
                )}
            </>
          )}
          {needsEntity && !isClaimMode && (
            <section>
              <h2 className="font-display text-xl tracking-tighter text-punk-green mb-6">
                {role === "BANDA" ||
                role === "SALA" ||
                role === "FESTIVAL" ||
                role === "ASOCIACION"
                  ? "Crear nuevo perfil (si no aparece en la búsqueda)"
                  : `Datos de ${role === "ORGANIZADOR" ? "el organizador" : "el promotor"}`}
              </h2>
              <div>
                <label htmlFor="entityName" className={labelClass}>
                  Nombre{" "}
                  {role === "BANDA"
                    ? "de la banda"
                    : role === "SALA"
                      ? "de la sala"
                      : role === "FESTIVAL"
                        ? "del festival"
                        : role === "ASOCIACION"
                          ? "de la asociación/sociedad"
                          : ""}{" "}
                  *
                </label>
                <input
                  id="entityName"
                  name="entityName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>

              {role === "BANDA" && (
                <>
                  <div className="mt-6">
                    <label htmlFor="location" className={labelClass}>
                      Localidad
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className={inputClass}
                      placeholder="Pamplona, Tudela..."
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="foundedYear" className={labelClass}>
                      Año de fundación
                    </label>
                    <input
                      id="foundedYear"
                      name="foundedYear"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      className={inputClass}
                      placeholder="2020"
                    />
                  </div>
                  <div className="mt-6">
                    <label className={labelClass}>Géneros</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {GENRES.map((g) => (
                        <label
                          key={g}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name="genres"
                            value={g}
                            className="accent-punk-green"
                          />
                          <span className="font-body text-sm text-punk-white/80">
                            {g}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="bio" className={labelClass}>
                      Biografía
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>
                        Miembros (nombre + instrumento)
                      </label>
                      <button
                        type="button"
                        onClick={addMember}
                        className="font-punch text-xs uppercase text-punk-green hover:text-punk-green/80"
                      >
                        + Añadir
                      </button>
                    </div>
                    {members.map((m, i) => (
                      <div key={i} className="mt-2 flex gap-2">
                        <input
                          value={m.name}
                          onChange={(e) =>
                            updateMember(i, "name", e.target.value)
                          }
                          placeholder="Nombre"
                          className={inputClass + " flex-1"}
                        />
                        <input
                          value={m.instrument}
                          onChange={(e) =>
                            updateMember(i, "instrument", e.target.value)
                          }
                          placeholder="Instrumento"
                          className={inputClass + " flex-1"}
                        />
                        <button
                          type="button"
                          onClick={() => removeMember(i)}
                          className="border-2 border-punk-red px-3 text-punk-red hover:bg-punk-red hover:text-punk-black"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="spotifyUrl" className={labelClass}>
                        Spotify
                      </label>
                      <input
                        id="spotifyUrl"
                        name="spotifyUrl"
                        type="url"
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label htmlFor="bandcampUrl" className={labelClass}>
                        Bandcamp
                      </label>
                      <input
                        id="bandcampUrl"
                        name="bandcampUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="instagramUrl" className={labelClass}>
                        Instagram
                      </label>
                      <input
                        id="instagramUrl"
                        name="instagramUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="youtubeUrl" className={labelClass}>
                        YouTube
                      </label>
                      <input
                        id="youtubeUrl"
                        name="youtubeUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="facebookUrl" className={labelClass}>
                        Facebook
                      </label>
                      <input
                        id="facebookUrl"
                        name="facebookUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="webUrl" className={labelClass}>
                        Web
                      </label>
                      <input
                        id="webUrl"
                        name="webUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {role === "SALA" && (
                <>
                  <div className="mt-6">
                    <label htmlFor="city" className={labelClass}>
                      Ciudad *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Pamplona"
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="address" className={labelClass}>
                      Dirección
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="description" className={labelClass}>
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="foundedYear" className={labelClass}>
                        Año de fundación
                      </label>
                      <input
                        id="foundedYear"
                        name="foundedYear"
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="capacity" className={labelClass}>
                        Aforo
                      </label>
                      <input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min={1}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="websiteUrl" className={labelClass}>
                      Web
                    </label>
                    <input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="mapUrl" className={labelClass}>
                      Enlace a mapa (Google Maps)
                    </label>
                    <input
                      id="mapUrl"
                      name="mapUrl"
                      type="url"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="instagramUrl" className={labelClass}>
                        Instagram
                      </label>
                      <input
                        id="instagramUrl"
                        name="instagramUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="facebookUrl" className={labelClass}>
                        Facebook
                      </label>
                      <input
                        id="facebookUrl"
                        name="facebookUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {(role === "FESTIVAL" || role === "ASOCIACION") && (
                <>
                  <div className="mt-6">
                    <label htmlFor="location" className={labelClass}>
                      Localidad
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="foundedYear" className={labelClass}>
                      Año de fundación
                    </label>
                    <input
                      id="foundedYear"
                      name="foundedYear"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="description" className={labelClass}>
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="websiteUrl" className={labelClass}>
                      Web
                    </label>
                    <input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="instagramUrl" className={labelClass}>
                        Instagram
                      </label>
                      <input
                        id="instagramUrl"
                        name="instagramUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="facebookUrl" className={labelClass}>
                        Facebook
                      </label>
                      <input
                        id="facebookUrl"
                        name="facebookUrl"
                        type="url"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {(role === "ORGANIZADOR" || role === "PROMOTOR") && (
                <>
                  <div className="mt-6">
                    <label htmlFor="description" className={labelClass}>
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="websiteUrl" className={labelClass}>
                      Web
                    </label>
                    <input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      className={inputClass}
                    />
                  </div>
                </>
              )}
            </section>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-punk-green bg-punk-green px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50 sm:w-auto"
            >
              {loading
                ? "Registrando..."
                : isClaimMode
                  ? "Registrarse y enviar solicitud"
                  : "Registrarse"}
            </button>
            <p className="font-body text-sm text-punk-white/60">
              {isClaimMode
                ? "Recibirás un email de verificación. Tras verificar, tu solicitud pasará a revisión del administrador."
                : "Después del registro podrás iniciar sesión y completar tu perfil con logo e imágenes."}
            </p>
          </div>
        </form>

        <p className="mt-10 text-center font-body text-sm text-punk-white/60">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-punch uppercase tracking-widest text-punk-green hover:text-punk-green/80"
          >
            Entrar
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}
