require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT) || 3004;

app.listen(PORT, () => {
  console.log(`agreements-service running on port ${PORT}`);
});
