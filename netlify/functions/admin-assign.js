const { quinielaStore, getTeams, computeSummary, getEntryFee } = require("./lib");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AZTECA2026";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }
  if (data.password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Clave incorrecta" }) };
  }

  const store = quinielaStore();
  const teams = await getTeams(store);
  const ownerById = {};
  (data.updates || []).forEach(u => { ownerById[u.id] = (u.owner || "").trim(); });

  const updated = teams.map(t => {
    if (ownerById[t.id] !== undefined) {
      const newOwner = ownerById[t.id];
      if (newOwner === "") {
        // se libera el equipo: vuelve al pool disponible y resetea su ronda
        return { ...t, owner: null, status: "Dieciseisavos" };
      }
      return { ...t, owner: newOwner };
    }
    return t;
  });

  await store.setJSON("teams", updated);
  const entryFee = await getEntryFee(store);
  const summary = computeSummary(updated, entryFee);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, teams: updated, summary })
  };
};
