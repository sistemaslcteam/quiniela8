const { quinielaStore, getTeams, NUM_TEAMS } = require("./lib");

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

  const name = (data.name || "").trim();
  let quantity = parseInt(data.quantity, 10);
  if (!name) return { statusCode: 400, body: JSON.stringify({ error: "Falta el nombre" }) };
  if (!quantity || quantity < 1) quantity = 1;
  if (quantity > NUM_TEAMS) quantity = NUM_TEAMS;

  const store = quinielaStore();
  const teams = await getTeams(store);

  const available = teams.filter(t => !t.owner);
  if (available.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Ya no quedan equipos disponibles" }) };
  }

  const toAssign = Math.min(quantity, available.length);
  const shuffled = available.slice().sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, toAssign);
  const pickedIds = new Set(picked.map(t => t.id));

  const updated = teams.map(t => {
    if (pickedIds.has(t.id)) {
      return { ...t, owner: name, status: "Dieciseisavos" };
    }
    return t;
  });

  await store.setJSON("teams", updated);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok: true,
      assigned: picked.map(t => ({ id: t.id, name: t.name })),
      requested: quantity,
      gotFewer: toAssign < quantity
    })
  };
};
