import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve("outputs");
fs.mkdirSync(outputDir, { recursive: true });

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:8765");

  if (request.method === "POST" && url.pathname === "/save") {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const requestedName = url.searchParams.get("name") ?? "screenshot";
      const safeName = requestedName.replace(/[^a-z0-9-]/gi, "-");
      const target = path.join(outputDir, `${safeName}.png`);
      fs.writeFileSync(target, Buffer.from(Buffer.concat(chunks).toString("utf8"), "base64"));
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end(target);
    });
    return;
  }

  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(`<!doctype html><meta charset="utf-8"><title>Local screenshot saver</title>
    <label>Screenshot data<textarea id="data" aria-label="Screenshot data"></textarea></label>
    <button id="save">Save locally</button><output id="status"></output>
    <script>
      const name = new URLSearchParams(location.search).get('name') || 'screenshot';
      save.onclick = async () => {
        const result = await fetch('/save?name=' + encodeURIComponent(name), { method: 'POST', body: data.value });
        status.textContent = result.ok ? 'SAVED: ' + await result.text() : 'ERROR';
      };
    </script>`);
});

server.listen(8765, "127.0.0.1", () => {
  console.log("Local screenshot saver ready at http://127.0.0.1:8765");
});
