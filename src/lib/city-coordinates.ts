/**
 * Centroides aproximados de ciudades/localidades en Navarra y alrededores.
 * Usado como fallback cuando Venue/Festival no tiene lat/lng.
 */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Pamplona: { lat: 42.8125, lng: -1.6458 },
  Tudela: { lat: 42.0614, lng: -1.6047 },
  Tafalla: { lat: 42.5306, lng: -1.6742 },
  Estella: { lat: 42.6714, lng: -2.0306 },
  Barañáin: { lat: 42.8, lng: -1.6833 },
  Burlada: { lat: 42.8258, lng: -1.6164 },
  Zizur: { lat: 42.7869, lng: -1.6917 },
  Villava: { lat: 42.8303, lng: -1.6086 },
  Ansoáin: { lat: 42.8333, lng: -1.6333 },
  Berriozar: { lat: 42.8333, lng: -1.6833 },
  Huarte: { lat: 42.8314, lng: -1.5917 },
  Egüés: { lat: 42.8167, lng: -1.5667 },
  Sangüesa: { lat: 42.5753, lng: -1.2828 },
  Aoiz: { lat: 42.7861, lng: -1.3681 },
  Corella: { lat: 42.1147, lng: -1.7856 },
  Cintruénigo: { lat: 42.0806, lng: -1.8056 },
  Cascante: { lat: 41.9989, lng: -1.6789 },
  Alsasua: { lat: 42.895, lng: -2.1689 },
  Irurtzun: { lat: 42.9194, lng: -1.8292 },
  Lekunberri: { lat: 43.0014, lng: -1.8931 },
  Elizondo: { lat: 43.1453, lng: -1.5172 },
  Doneztebe: { lat: 43.1306, lng: -1.6739 },
  Baztan: { lat: 43.1333, lng: -1.5167 },
  Roncal: { lat: 42.95, lng: -0.95 },
  "San Adrián": { lat: 42.3333, lng: -1.9333 },
  Lodosa: { lat: 42.4222, lng: -2.0789 },
  Viana: { lat: 42.5153, lng: -2.3711 },
  Mendavia: { lat: 42.4433, lng: -2.2006 },
  Andosilla: { lat: 42.3767, lng: -1.9433 },
  Castejón: { lat: 42.1689, lng: -1.6906 },
  Fitero: { lat: 42.0569, lng: -1.8569 },
  Olite: { lat: 42.4811, lng: -1.6519 },
  Tiana: { lat: 42.5167, lng: -1.6167 },
  "Puente la Reina": { lat: 42.6722, lng: -1.8156 },
  "Estella-Lizarra": { lat: 42.6714, lng: -2.0306 },
  Lizarra: { lat: 42.6714, lng: -2.0306 },
  // Euskadi / alrededores
  Donostia: { lat: 43.3128, lng: -1.975 },
  "San Sebastián": { lat: 43.3128, lng: -1.975 },
  Bilbao: { lat: 43.263, lng: -2.935 },
  Vitoria: { lat: 42.8467, lng: -2.6727 },
  Gasteiz: { lat: 42.8467, lng: -2.6727 },
};

export function getCoordinatesForCity(city: string): { lat: number; lng: number } | null {
  const normalized = city.trim();
  if (!normalized) return null;
  const exact = CITY_COORDINATES[normalized];
  if (exact) return exact;
  const lower = normalized.toLowerCase();
  const entry = Object.entries(CITY_COORDINATES).find(
    ([k]) => k.toLowerCase() === lower
  );
  return entry ? entry[1] : null;
}
