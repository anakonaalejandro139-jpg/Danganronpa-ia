const { app, BrowserWindow, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let server = null;

function startDistServer(distDir) {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];
      let filePath = path.join(distDir, urlPath === '/' ? 'index.html' : urlPath);

      if (!filePath.startsWith(distDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function createWindow() {
  const distDir = path.join(__dirname, '..', 'dist');
  const url = await startDistServer(distDir);

  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 420,
    minHeight: 620,
    title: 'Danganronpa: Saber Mortal 11°',
    icon: path.join(__dirname, '..', 'public', 'pwa-512x512.png'),
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadURL(url);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
