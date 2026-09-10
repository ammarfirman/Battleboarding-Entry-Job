const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "www");
const DST = path.join(ROOT, "windows-app", "www");

function copyDir(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            copyDir(s, d);
        } else {
            fs.copyFileSync(s, d);
        }
    }
}
console.log("Syncing www/ to windows-app/www/...");
copyDir(SRC, DST);
console.log("Done.");