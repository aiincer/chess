const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "online.js");

let content = fs.readFileSync(file, "utf8");

let lines = content.split(/\r?\n/);

let result = [];

for (let line of lines) {
    if (line.length === 0) {
        continue;
    }

    result.push(line);
}

fs.writeFileSync(file, result.join("\n"), "utf8");

console.log("Fertig.");