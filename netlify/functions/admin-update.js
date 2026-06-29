const { quinielaStore, getTeams, computeSummary, STATUS_OPTIONS } = require("./lib");

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
  const statusById = {};
  (data.updates || []).forEach(u => { statusById[u.id] = u.status; });

  const updated = teams.map(t => {
    const newStatus = statusById[t.id];
    if (newStatus && STATUS_OPTIONS.includes(newStatus)) {
      return { ...t, status: newStatus };
    }
    return t;
  });

  await store.setJSON("teams", updated);
  const summary = computeSummary(updated);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, teams: updated, summary })
  };
};
