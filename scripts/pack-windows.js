const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const WIN_OUT = path.join(DIST, "windows");
const BUNDLE_DIR = path.join(WIN_OUT, "BattleboardingEntry-win32-x64");
const ZIP_OUT = path.join(DIST, "BattleboardingEntry-Windows-x64.zip");
execSync("node scripts/sync-windows.js", { stdio: "inherit", cwd: ROOT });
console.log("\nPackaging Windows application...");
fs.mkdirSync(WIN_OUT, { recursive: true });
execSync(
    `npx @electron/packager windows-app BattleboardingEntry --platform=win32 --arch=x64 --out="${WIN_OUT}" --overwrite`,
    { stdio: "inherit", cwd: ROOT }
);
const standaloneSrc = path.join(DIST, "battleboarding-standalone.html");
if (fs.existsSync(standaloneSrc) && fs.existsSync(BUNDLE_DIR)) {
    fs.copyFileSync(standaloneSrc, path.join(BUNDLE_DIR, "BattleboardingEntry.html"));
}
console.log("\nCreating release ZIP archive...");
if (fs.existsSync(ZIP_OUT)) fs.unlinkSync(ZIP_OUT);
if (process.platform === "win32") {
    execSync(
        `powershell -Command "Compress-Archive -Path '${BUNDLE_DIR}\\*' -DestinationPath '${ZIP_OUT}' -Force"`,
        { stdio: "inherit" }
    );
} else {
    execSync(`cd "${BUNDLE_DIR}" && zip -r "${ZIP_OUT}" .`, { stdio: "inherit" });
}
console.log(`\nSuccess! Package ready at: dist/BattleboardingEntry-Windows-x64.zip`);