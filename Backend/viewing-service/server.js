require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT) || 3009;

app.listen(PORT, () => {
  console.log(`viewing-service running on port ${PORT}`);
});
