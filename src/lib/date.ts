/** Inicio del día actual en UTC (para comparar fechas de eventos) */
export function startOfToday(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
