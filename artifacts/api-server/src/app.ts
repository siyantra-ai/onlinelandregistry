import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

import path from "path";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

// Stripe webhook needs raw body — must be before express.json()
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve static files from the resolved public directory
let publicPath = __dirname;
import fs from "fs";
if (!fs.existsSync(path.join(publicPath, "index.html"))) {
  publicPath = path.resolve(__dirname, "../public");
}
if (!fs.existsSync(path.join(publicPath, "index.html"))) {
  publicPath = path.resolve(__dirname, "public");
}

app.use(express.static(publicPath));

// Fallback all non-API requests to index.html for client-side routing (wouter)
app.get("*any", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
