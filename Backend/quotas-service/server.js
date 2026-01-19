require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT) || 3005;

app.listen(PORT, () => {
  console.log(`quotas-service running on port ${PORT}`);
});
