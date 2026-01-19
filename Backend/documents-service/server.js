require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT) || 3006;

app.listen(PORT, () => {
  console.log(`documents-service running on port ${PORT}`);
});
