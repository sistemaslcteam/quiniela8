const { quinielaStore, getTeams, computeSummary, getEntryFee } = require("./lib");

exports.handler = async () => {
  const store = quinielaStore();
  const teams = await getTeams(store);
  const entryFee = await getEntryFee(store);
  const summary = computeSummary(teams, entryFee);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teams, summary, entryFee })
  };
};
