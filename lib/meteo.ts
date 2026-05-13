/**
 * Helpers météo pour l'outil "Météo escalade par site".
 * On utilise Open-Meteo (https://open-meteo.com) : gratuit, sans clé API,
 * licence CC-BY 4.0. Pas de tracking, pas d'inscription.
 */

export type OpenMeteoResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
};

export async function fetchForecast(
  lat: number,
  lon: number,
): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    timezone: "Europe/Paris",
    forecast_days: "5",
    hourly: [
      "temperature_2m",
      "precipitation",
      "precipitation_probability",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
      "is_day",
    ].join(","),
    daily: [
      "sunrise",
      "sunset",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
    ].join(","),
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!r.ok) throw new Error(`Open-Meteo HTTP ${r.status}`);
  return r.json();
}

/**
 * Verdict de grimpabilité pour un créneau horaire donné.
 * - good : conditions idéales (sec, tempéré, vent modéré)
 * - ok : grimpable mais avec une réserve (chaud, frais, ou nuageux)
 * - bad : à éviter (pluie active, gel, rafales)
 * - night : créneau nocturne (on n'évalue pas)
 */
export type Verdict = "good" | "ok" | "bad" | "night";

export type HourEvaluation = {
  iso: string;
  date: Date;
  temp: number;
  precip: number;
  precipProb: number;
  cloud: number;
  wind: number;
  gusts: number;
  isDay: boolean;
  verdict: Verdict;
  reason: string;
};

export function evaluateHour(
  i: number,
  data: OpenMeteoResponse,
): HourEvaluation {
  const h = data.hourly;
  const iso = h.time[i];
  const date = new Date(iso);
  const temp = h.temperature_2m[i];
  const precip = h.precipitation[i];
  const precipProb = h.precipitation_probability[i];
  const cloud = h.cloud_cover[i];
  const wind = h.wind_speed_10m[i];
  const gusts = h.wind_gusts_10m[i];
  const isDay = h.is_day[i] === 1;

  let verdict: Verdict = "good";
  let reason = "Conditions sèches, vent modéré, température confortable.";

  if (!isDay) {
    verdict = "night";
    reason = "Nuit.";
    return { iso, date, temp, precip, precipProb, cloud, wind, gusts, isDay, verdict, reason };
  }

  if (precip >= 0.5) {
    verdict = "bad";
    reason = `Pluie active (${precip.toFixed(1)} mm). Rocher trempé.`;
  } else if (gusts >= 50) {
    verdict = "bad";
    reason = `Rafales ${gusts.toFixed(0)} km/h, à éviter sur falaise haute.`;
  } else if (temp <= 0) {
    verdict = "bad";
    reason = `Gel (${temp.toFixed(0)} °C). Rocher cassant, doigts engourdis.`;
  } else if (temp >= 33) {
    verdict = "bad";
    reason = `Très chaud (${temp.toFixed(0)} °C). Adhérence et endurance dégradées.`;
  } else if (precipProb >= 60) {
    verdict = "ok";
    reason = `Risque de pluie ${precipProb}%. À surveiller.`;
  } else if (gusts >= 35) {
    verdict = "ok";
    reason = `Vent fort (${gusts.toFixed(0)} km/h en rafale).`;
  } else if (temp >= 28) {
    verdict = "ok";
    reason = `Chaud (${temp.toFixed(0)} °C). Mieux le matin ou en fin de journée.`;
  } else if (temp <= 4) {
    verdict = "ok";
    reason = `Frais (${temp.toFixed(0)} °C). Gantes au relais, mais grimpable.`;
  }

  return { iso, date, temp, precip, precipProb, cloud, wind, gusts, isDay, verdict, reason };
}

export type DayBucket = {
  dateLabel: string; // ex "Mer. 15 mai"
  dayIso: string;    // YYYY-MM-DD
  hours: HourEvaluation[];
  sunrise: string;
  sunset: string;
  tempMin: number;
  tempMax: number;
  precipSum: number;
  bestWindow: { start: Date; end: Date; verdict: Verdict } | null;
};

const FR_WEEKDAY = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const FR_MONTH = [
  "jan.", "fév.", "mars", "avril", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function frDate(d: Date): string {
  return `${FR_WEEKDAY[d.getDay()]} ${d.getDate()} ${FR_MONTH[d.getMonth()]}`;
}

export function buildDays(data: OpenMeteoResponse): DayBucket[] {
  const byDay = new Map<string, HourEvaluation[]>();
  for (let i = 0; i < data.hourly.time.length; i++) {
    const ev = evaluateHour(i, data);
    const key = ev.iso.slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(ev);
    byDay.set(key, arr);
  }

  const out: DayBucket[] = [];
  for (let d = 0; d < data.daily.time.length; d++) {
    const dayIso = data.daily.time[d];
    const hours = byDay.get(dayIso) ?? [];
    const dateLabel = frDate(new Date(`${dayIso}T12:00:00`));

    // Best window : la plus longue plage continue "good" en journée.
    let best: DayBucket["bestWindow"] = null;
    let runStart = -1;
    let runVerdict: Verdict | null = null;
    for (let i = 0; i < hours.length; i++) {
      const v = hours[i].verdict;
      if ((v === "good" || v === "ok") && runStart === -1) {
        runStart = i;
        runVerdict = v;
      } else if (v === "good" && runVerdict === "ok") {
        runVerdict = "good";
      } else if (v !== "good" && v !== "ok" && runStart !== -1) {
        const len = i - runStart;
        const candStart = hours[runStart].date;
        const candEnd = hours[i - 1].date;
        if (!best || (best.end.getTime() - best.start.getTime()) < (candEnd.getTime() - candStart.getTime())) {
          best = { start: candStart, end: candEnd, verdict: runVerdict ?? "ok" };
        }
        runStart = -1;
        runVerdict = null;
      }
    }
    if (runStart !== -1 && hours.length > 0) {
      const candStart = hours[runStart].date;
      const candEnd = hours[hours.length - 1].date;
      if (!best || (best.end.getTime() - best.start.getTime()) < (candEnd.getTime() - candStart.getTime())) {
        best = { start: candStart, end: candEnd, verdict: runVerdict ?? "ok" };
      }
    }

    out.push({
      dayIso,
      dateLabel,
      hours,
      sunrise: data.daily.sunrise[d],
      sunset: data.daily.sunset[d],
      tempMin: data.daily.temperature_2m_min[d],
      tempMax: data.daily.temperature_2m_max[d],
      precipSum: data.daily.precipitation_sum[d],
      bestWindow: best,
    });
  }
  return out;
}

const FR_ORIENTATION: Record<string, string> = {
  N: "Nord — ombragé tout le jour, idéal en plein été, frais à mi-saison.",
  NE: "Nord-est — soleil le matin tôt, ombre l'après-midi. Bon compromis estival.",
  E: "Est — soleil le matin, ombre l'après-midi. À grimper tôt en été.",
  SE: "Sud-est — soleil matin et midi, ombre tardive. Confortable en demi-saison.",
  S: "Sud — soleil toute la journée. À fuir en plein été, parfait en hiver.",
  SW: "Sud-ouest — soleil après-midi et fin de journée. Très chaud l'été.",
  W: "Ouest — ombre le matin, soleil l'après-midi. Bon en automne.",
  NW: "Nord-ouest — peu de soleil, idéal en plein été.",
};

export function orientationHint(orientation: string | null | undefined): string | null {
  if (!orientation) return null;
  // L'orientation FFME est texte libre. On essaie d'extraire le code N/E/S/W.
  const upper = orientation.toUpperCase();
  const codes = ["NE", "NW", "SE", "SW", "N", "S", "E", "W"];
  for (const code of codes) {
    if (upper.includes(code)) {
      return FR_ORIENTATION[code] ?? null;
    }
  }
  return null;
}

export function frHour(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}h`;
}

export function frTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}
