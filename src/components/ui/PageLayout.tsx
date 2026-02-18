/**
 * Layout base para páginas internas - mismo estilo punk que el home
 */
export function PageLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-punk-black ${className}`}
    >
      {/* Grid sutil de fondo */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,83,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,83,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gradiente radial sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(230,0,38,0.08)_0%,transparent_50%)]" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 sm:px-12 sm:py-16 lg:px-20 lg:py-20 2xl:max-w-content-wide max-[299px]:px-3 max-[299px]:py-8">
        {children}
      </div>
    </main>
  );
}
