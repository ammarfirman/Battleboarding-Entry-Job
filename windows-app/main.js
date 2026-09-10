"use strict";

const { app, BrowserWindow, protocol, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const WWW = path.join(__dirname, "www");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".ico": "image/x-icon"
};

// A stable, secure origin (app://local) so IndexedDB / localStorage persist
// between runs, stored under Electron's per-app userData folder.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true }
  }
]);

function serve(request) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url).pathname);
  } catch (e) {
    return new Response("bad request", { status: 400 });
  }
  if (!pathname || pathname === "/") pathname = "/index.html";

  const rel = path.normalize(pathname).replace(/^([\\/])+/, "");
  const file = path.join(WWW, rel);
  if (!file.startsWith(WWW)) return new Response("forbidden", { status: 403 });

  try {
    const data = fs.readFileSync(file);
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    return new Response(data, { headers: { "content-type": type, "cache-control": "no-cache" } });
  } catch (e) {
    return new Response("not found", { status: 404 });
  }
}

function createWindow() {
    const { screen } = require("electron");
    const display = screen.getPrimaryDisplay();
    const { width: maxW, height: maxH } = display.workAreaSize;
    const initialWidth = Math.min(1200, Math.max(360, Math.round(maxW * 0.92)));
    const initialHeight = Math.min(840, Math.max(480, Math.round(maxH * 0.92)));
    const win = new BrowserWindow({
        width: initialWidth,
        height: initialHeight,
        minWidth: 360,
        minHeight: 480,
        backgroundColor: "#0B0B0C",
        autoHideMenuBar: true,
        title: "Battleboarding Entry",
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false
        }
    });
    win.once("ready-to-show", () => {
        win.show();
    });
    Menu.setApplicationMenu(null);
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (/^https?:/i.test(url)) shell.openExternal(url);
        return { action: "deny" };
    });
    win.loadURL("app://local/index.html");
}

app.whenReady().then(() => {
  protocol.handle("app", serve);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
