require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT) || 3007;

app.listen(PORT, () => {
  console.log(`notifications-service running on port ${PORT}`);
});
