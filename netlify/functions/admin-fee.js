const { quinielaStore, getTeams, computeSummary, setEntryFee, getEntryFee } = require("./lib");

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

  const fee = parseFloat(data.entryFee);
  if (!fee || fee <= 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Cuota inválida" }) };
  }

  const store = quinielaStore();
  await setEntryFee(store, fee);

  const teams = await getTeams(store);
  const summary = computeSummary(teams, fee);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, entryFee: fee, summary })
  };
};
