import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import path from "path";

const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("building vercel serverless function...");
  await esbuild({
    entryPoints: ["server/vercel.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "api/index.js",
    alias: {
      "@shared": path.resolve("shared"),
    },
    external: ["pg-native", "bufferutil", "utf-8-validate"],
    logLevel: "info",
  });
  console.log("api/index.js ready for Vercel");

  console.log("building netlify serverless function...");
  await esbuild({
    entryPoints: ["server/netlify.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "netlify/functions/api.js",
    alias: {
      "@shared": path.resolve("shared"),
    },
    external: ["pg-native", "bufferutil", "utf-8-validate"],
    logLevel: "info",
  });
  console.log("netlify/functions/api.js ready for Netlify");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
