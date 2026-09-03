import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
let app;
let baseUrl;

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 3100;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

before(async () => {
  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: root,
      env: { ...process.env, GOOGLE_SHEET_ID: "" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let output = "";
  app.stdout.on("data", (chunk) => { output += chunk; });
  app.stderr.on("data", (chunk) => { output += chunk; });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (app.exitCode !== null) throw new Error(`Next.js exited before startup:\n${output}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await wait(100);
  }
  throw new Error(`Next.js did not start:\n${output}`);
});

after(async () => {
  if (!app || app.exitCode !== null) return;
  app.kill("SIGTERM");
  const timeout = setTimeout(() => app.kill("SIGKILL"), 5000);
  await once(app, "exit");
  clearTimeout(timeout);
});

const routes = [
  ["/", "Eusun Han's Lab"],
  ["/members/professor", "Eusun Han"],
  ["/members/students", "Graduate Student 01"],
  ["/members/alumni", "Alumni Example 01"],
  ["/research", "Human-Centered AI"],
  ["/publications", "Example Paper"],
];

for (const [pathname, expected] of routes) {
  test(`server-renders ${pathname}`, async () => {
    const response = await fetch(baseUrl + pathname);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.ok(html.toLowerCase().includes(expected.toLowerCase()));
    assert.match(html, /Sample content is shown/);
    assert.match(html, /class="member-trigger"[^>]*>Members<\/button>/);
    assert.doesNotMatch(html, /<details|<summary/i);
    assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  });
}

test("alumni renders without profile images", async () => {
  const response = await fetch(baseUrl + "/members/alumni");
  const html = await response.text();
  assert.doesNotMatch(html, /member-image|portrait/i);
});
