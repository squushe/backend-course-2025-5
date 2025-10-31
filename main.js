const { program } = require("commander");
const fs = require("fs");
const http = require("http");
const path = require("path");
const superagent = require("superagent");

program
  .requiredOption("-H, --host <host>")
  .requiredOption("-p, --port <port>")
  .requiredOption("-c, --cache <path>");

program.parse();

const options = program.opts();

if (!fs.existsSync(options.cache)) {
  fs.mkdirSync(options.cache, { recursive: true });
  console.log("Директорію створено");
}

let server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.pathname.slice(1);
  const method = req.method;
  const filePath = path.join(options.cache, `${code}.jpg`);

  switch (method) {
    case "GET":
      try {
        const workData = await fs.promises.readFile(filePath);
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(workData);
      } catch {
        res.writeHead(404);
        res.end("Not Found");
      }
      break;
    case "PUT":
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks);
      await fs.promises.writeFile(filePath, data);
      res.writeHead(201);
      res.end("Created");
      break;
    case "DELETE":
      try {
        await fs.promises.unlink(filePath);
        res.writeHead(200);
        res.end("Deleted");
      } catch {
        res.writeHead(404);
        res.end("Not Found");
      }
      break;
    default:
      res.writeHead(405);
      res.end("Method not allowed");
      break;
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
