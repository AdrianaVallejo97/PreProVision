require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT) || 3003;

app.listen(PORT, () => {
  console.log(`places-service running on port ${PORT}`);
});
