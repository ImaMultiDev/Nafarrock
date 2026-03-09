"use client";

const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Props = {
  bands: { id: string; name: string }[];
  value: string[];
  onChange: (bandIds: string[]) => void;
};

/** Selector de bandas Nafarrock para vincular a un evento. Solo para mostrar próximos eventos en /bandas. */
export function BandSelector({ bands, value, onChange }: Props) {
  const toggle = (bandId: string) => {
    if (value.includes(bandId)) {
      onChange(value.filter((id) => id !== bandId));
    } else {
      onChange([...value, bandId]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Bandas participantes (Nafarrock)</label>
        <p className="mt-1 font-body text-xs text-punk-white/50">
          Selecciona las bandas registradas que participan. Solo se usa para mostrar sus próximos eventos en /bandas.
        </p>
      </div>
      <div className="max-h-40 space-y-2 overflow-y-auto border-2 border-punk-white/20 p-4">
        {bands.map((band) => (
          <label
            key={band.id}
            className="flex cursor-pointer items-center gap-2 transition-colors hover:text-punk-green/80 has-[:checked]:text-punk-green"
          >
            <input
              type="checkbox"
              checked={value.includes(band.id)}
              onChange={() => toggle(band.id)}
              className="accent-punk-green"
            />
            <span className="font-body text-punk-white/80">{band.name}</span>
          </label>
        ))}
        {bands.length === 0 && (
          <p className="font-body text-sm text-punk-white/50">No hay bandas aprobadas</p>
        )}
      </div>
    </div>
  );
}
