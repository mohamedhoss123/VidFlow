import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./output.swagger.json" with { type: "json" };

const app = express();
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3020, () => {
  console.log("Docs available at http://localhost:3000/api/docs");
});
