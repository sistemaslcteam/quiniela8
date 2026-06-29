const { quinielaStore, getTeams, computeSummary } = require("./lib");

exports.handler = async () => {
  const store = quinielaStore();
  const teams = await getTeams(store);
  const summary = computeSummary(teams);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teams, summary })
  };
};
