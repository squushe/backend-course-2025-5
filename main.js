const { program } = require("commander");
const fs = require("fs");
const http = require("http");

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

let server = http.createServer((req, res) => {});
server.listen(options.port, options.host, () => {});
