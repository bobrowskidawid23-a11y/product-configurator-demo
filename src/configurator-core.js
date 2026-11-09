const VAT_RATE = 0.23;

const FAMILY_RULES = {
  drawer: {
    label: "Szuflada",
    width: [300, 1200],
    height: [100, 300],
    price: ({ width, finish }) => 220 + (width >= 600 ? 20 : 0) + (finish === "graphite" ? 26 : 0),
    parts: ({ width }) => [
      { code: `BODY-${width}`, name: "Korpus szuflady" },
      { code: `FRONT-${width}`, name: "Front" },
      { code: "RUNNER-500", name: "Prowadnice" },
    ],
  },
  lift: {
    label: "Podnośnik frontu",
    width: [400, 1800],
    height: [300, 1000],
    price: ({ width, height, finish }) => 410 + width * 0.08 + height * 0.04 + (finish === "graphite" ? 28 : 0),
    parts: ({ width }) => [
      { code: `MECH-${width}`, name: "Mechanizm podnoszący" },
      { code: "COVER-SET", name: "Zestaw osłon" },
    ],
  },
  countertop: {
    label: "Blat",
    width: [500, 3000],
    height: [300, 1400],
    price: ({ width, height, finish }) => (width * height / 1_000_000) * 1180 + (finish === "sand" ? 39 : 0),
    parts: ({ width, height }) => [
      { code: `TOP-${width}x${height}`, name: "Płyta blatu" },
      { code: "EDGE-SET", name: "Obróbka krawędzi" },
    ],
  },
};

const FINISH_LABELS = {
  white: "biały",
  graphite: "grafitowy",
  sand: "piaskowy",
};

const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateConfiguration(input) {
  const errors = [];
  const rule = FAMILY_RULES[input?.family];

  if (!rule) errors.push("Wybierz obsługiwaną rodzinę produktu.");
  if (!Number.isFinite(Number(input?.width))) errors.push("Podaj szerokość w milimetrach.");
  if (!Number.isFinite(Number(input?.height))) errors.push("Podaj wysokość lub głębokość w milimetrach.");
  if (!Number.isInteger(Number(input?.quantity)) || Number(input.quantity) < 1 || Number(input.quantity) > 50) {
    errors.push("Ilość musi być liczbą od 1 do 50.");
  }

  if (rule && Number.isFinite(Number(input.width))) {
    const [min, max] = rule.width;
    if (Number(input.width) < min || Number(input.width) > max) {
      errors.push(`Dopuszczalna szerokość: ${min}–${max} mm.`);
    }
  }

  if (rule && Number.isFinite(Number(input.height))) {
    const [min, max] = rule.height;
    if (Number(input.height) < min || Number(input.height) > max) {
      errors.push(`Dopuszczalny drugi wymiar: ${min}–${max} mm.`);
    }
  }

  if (!FINISH_LABELS[input?.finish]) errors.push("Wybierz wykończenie.");
  return errors;
}

export function calculateConfiguration(input) {
  const normalized = {
    family: input.family,
    width: Number(input.width),
    height: Number(input.height),
    finish: input.finish,
    quantity: Number(input.quantity),
  };
  const errors = validateConfiguration(normalized);
  if (errors.length) throw new Error(`Konfiguracja jest nieprawidłowa: ${errors.join(" ")}`);

  const rule = FAMILY_RULES[normalized.family];
  const unitNet = money(rule.price(normalized));
  const netTotal = money(unitNet * normalized.quantity);

  return {
    valid: true,
    unitNet,
    netTotal,
    grossTotal: money(netTotal * (1 + VAT_RATE)),
    parts: rule.parts(normalized),
    summary: `${rule.label} ${normalized.width} × ${normalized.height} mm, ${FINISH_LABELS[normalized.finish]}`,
  };
}
