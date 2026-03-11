import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const PgSession = connectPgSimple(session);
const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "delivery-app-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = registerRoutes(httpServer, app).then(() => {
      app.use(
        (err: any, _req: Request, res: Response, next: NextFunction) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          if (res.headersSent) return next(err);
          return res.status(status).json({ message });
        },
      );
    });
  }
  return initPromise;
}

export default async function handler(req: any, res: any) {
  await ensureInit();
  app(req, res);
}
