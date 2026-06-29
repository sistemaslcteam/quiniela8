const { getStore } = require("@netlify/blobs");

function quinielaStore() {
  return getStore({
    name: "quiniela-octavos",
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN
  });
}

const ENTRY_FEE_DEFAULT = 100;
const NUM_TEAMS = 16;

const STATUS_OPTIONS = [
  "Octavos",
  "Avanzó a Cuartos",
  "Avanzó a Semifinal",
  "Jugó la Final",
  "Jugó el partido por el 3er lugar",
  "Eliminado en Octavos",
  "Eliminado en Cuartos",
  "Campeón",
  "Subcampeón",
  "3er lugar",
  "4to lugar"
];

const ROUNDS_PAID = {
  "Octavos": 1,
  "Avanzó a Cuartos": 2,
  "Avanzó a Semifinal": 3,
  "Jugó la Final": 4,
  "Jugó el partido por el 3er lugar": 4,
  "Eliminado en Octavos": 1,
  "Eliminado en Cuartos": 2,
  "Campeón": 4,
  "Subcampeón": 4,
  "3er lugar": 4,
  "4to lugar": 4
};

function defaultTeams() {
  const teams = [];
  for (let i = 1; i <= NUM_TEAMS; i++) {
    teams.push({
      id: i,
      name: `Equipo ${i}`,
      owner: null,
      status: "Octavos",
      bracketPos: i
    });
  }
  return teams;
}

async function getTeams(store) {
  let teams = await store.get("teams", { type: "json" });
  if (!teams) {
    teams = defaultTeams();
    await store.setJSON("teams", teams);
  }
  let migrated = false;
  teams = teams.map(t => {
    if (t.bracketPos === undefined || t.bracketPos === null) {
      migrated = true;
      return { ...t, bracketPos: t.id };
    }
    return t;
  });
  if (migrated) await store.setJSON("teams", teams);
  return teams;
}


async function getEntryFee(store) {
  const settings = await store.get("settings", { type: "json" });
  if (settings && typeof settings.entryFee === "number" && settings.entryFee > 0) {
    return settings.entryFee;
  }
  return ENTRY_FEE_DEFAULT;
}

async function setEntryFee(store, fee) {
  const settings = (await store.get("settings", { type: "json" })) || {};
  settings.entryFee = fee;
  await store.setJSON("settings", settings);
}

function computeSummary(teams, entryFee) {
  const fee = entryFee || ENTRY_FEE_DEFAULT;
  let pot = 0;
  const assigned = teams.filter(t => t.owner);
  assigned.forEach(t => {
    const rounds = ROUNDS_PAID[t.status] || 1;
    pot += rounds * fee;
  });
  const find = (status) => assigned.filter(t => t.status === status);
  return {
    pot,
    entriesCount: assigned.length,
    remainingTeams: teams.filter(t => !t.owner).length,
    premio1: Math.round(pot * 0.6),
    premio2: Math.round(pot * 0.25),
    premio3: Math.round(pot * 0.15),
    campeon: find("Campeón"),
    subcampeon: find("Subcampeón"),
    tercero: find("3er lugar"),
    cuarto: find("4to lugar")
  };
}

module.exports = { quinielaStore, getTeams, defaultTeams, computeSummary, STATUS_OPTIONS, ROUNDS_PAID, ENTRY_FEE_DEFAULT, NUM_TEAMS, getEntryFee, setEntryFee };
