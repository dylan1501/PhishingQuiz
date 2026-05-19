import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import apiHandler from "./api/[...path]";

function readRequestBody(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    request.on("error", reject);
    request.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }

      const rawBody = Buffer.concat(chunks).toString("utf8");
      const contentType = request.headers["content-type"] ?? "";
      if (contentType.includes("application/json")) {
        try {
          resolve(JSON.parse(rawBody));
          return;
        } catch (error) {
          reject(error);
          return;
        }
      }

      resolve(rawBody);
    });
  });
}

function createQueryFromUrl(requestUrl: string) {
  const url = new URL(requestUrl, "http://localhost");
  const segments = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const query: Record<string, string | string[]> = { path: segments };

  url.searchParams.forEach((value, key) => {
    const existingValue = query[key];
    if (Array.isArray(existingValue)) {
      query[key] = [...existingValue, value];
      return;
    }
    if (typeof existingValue === "string") {
      query[key] = [existingValue, value];
      return;
    }
    query[key] = value;
  });

  return query;
}

function createVercelLikeResponse(response: ServerResponse) {
  return {
    status(statusCode: number) {
      response.statusCode = statusCode;
      return this;
    },
    json(payload: unknown) {
      if (!response.headersSent) {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      response.end(JSON.stringify(payload));
      return this;
    },
    end(payload?: unknown) {
      response.end(payload as never);
      return this;
    },
    setHeader(name: string, value: string | string[]) {
      response.setHeader(name, value);
    },
  };
}

function localVercelApiPlugin(): Plugin {
  return {
    name: "local-vercel-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith("/api")) {
          next();
          return;
        }

        try {
          const body = await readRequestBody(request);
          await apiHandler(
            {
              ...request,
              method: request.method,
              query: createQueryFromUrl(request.url),
              body,
              headers: request.headers,
            } as never,
            createVercelLikeResponse(response) as never,
          );
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Không xử lý được API local.",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? env.DATABASE_URL;
  process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? env.ADMIN_SESSION_SECRET;

  return {
    plugins: [react(), localVercelApiPlugin()],
  };
});
