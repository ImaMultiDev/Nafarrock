"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Venue = { id: string; name: string };
type Festival = { id: string; name: string };

const TEXT_OPTION = "text";

type Props = {
  venues: Venue[];
  festivals: Festival[];
  name?: string;
  id?: string;
  defaultValue?: string;
  defaultVenueText?: string;
};

export function VenueFestivalSelect({
  venues,
  festivals,
  name = "venueOrFestival",
  id = "venueOrFestival",
  defaultValue = "",
  defaultVenueText = "",
}: Props) {
  const t = useTranslations("eventForm");
  const initial = defaultValue || (defaultVenueText ? TEXT_OPTION : "");
  const [selected, setSelected] = useState(initial);
  const showTextInput = selected === TEXT_OPTION;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={id} className={labelClass}>
          {t("venueLabel")}
        </label>
        <select
          id={id}
          name={name}
          className={inputClass}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">{t("venueEmpty")}</option>
          {venues.length > 0 && (
            <optgroup label={t("venuesGroup")}>
              {venues.map((v) => (
                <option key={v.id} value={`venue-${v.id}`}>
                  {v.name}
                </option>
              ))}
            </optgroup>
          )}
          {festivals.length > 0 && (
            <optgroup label={t("festivalsGroup")}>
              {festivals.map((f) => (
                <option key={f.id} value={`festival-${f.id}`}>
                  {f.name}
                </option>
              ))}
            </optgroup>
          )}
          <option value={TEXT_OPTION}>{t("venueTextFree")}</option>
        </select>
      </div>
      {showTextInput && (
        <div>
          <label htmlFor="venueText" className={labelClass}>
            {t("venueTextLabel")}
          </label>
          <input
            id="venueText"
            name="venueText"
            type="text"
            className={inputClass}
            placeholder={t("venueTextPlaceholder")}
            defaultValue={defaultVenueText}
          />
        </div>
      )}
    </div>
  );
}
