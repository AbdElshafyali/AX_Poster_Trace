import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

function directPrintPlugin() {
  return {
    name: 'direct-print-plugin',
    configureServer(server) {
      server.middlewares.use('/api/direct-print', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            const tempPdf = path.join(os.tmpdir(), `ax_poster_${Date.now()}.pdf`);
            fs.writeFileSync(tempPdf, body);

            const sumatraPath = 'C:\\Program Files\\SumatraPDF\\SumatraPDF.exe';
            const cmd = fs.existsSync(sumatraPath)
              ? `"${sumatraPath}" -silent -print-settings "monochrome,paper=A4,fit,duplex=simplex" -print-to-default "${tempPdf}"`
              : `powershell -Command "Start-Process -FilePath '${tempPdf}' -Verb Print"`;

            exec(cmd, { windowsHide: true }, (err) => {
              setTimeout(() => {
                try { fs.unlinkSync(tempPdf); } catch (e) {}
              }, 20000);

              if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'تم إرسال المستند بنجاح إلى الطابعة' }));
            });
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });
    }
  };
}

function saveAssetsFolderPlugin() {
  return {
    name: 'save-assets-folder-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-assets-folder', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
            const { folderName, assets, manifestJson, textGuide, htmlGuide } = body;

            const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'اختر مكان حفظ مجلد اللوجو ومقاسات الـ PWA'
$dialog.ShowNewFolderButton = $true
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $dialog.SelectedPath
} else {
  Write-Output 'CANCELED'
}
`;

            const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');
            exec(`powershell -NoProfile -EncodedCommand ${encodedScript}`, (psErr, stdout) => {
              const selectedBase = stdout ? stdout.trim() : '';

              if (psErr || !selectedBase || selectedBase === 'CANCELED') {
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, canceled: true }));
              }

              const targetDir = path.join(selectedBase, folderName || 'AX_Logo_Web_PWA_Kit');
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }

              if (Array.isArray(assets)) {
                for (const asset of assets) {
                  if (asset.fileName && asset.dataUrl) {
                    const base64Data = asset.dataUrl.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    fs.writeFileSync(path.join(targetDir, asset.fileName), buffer);
                  }
                }
              }

              if (manifestJson) {
                fs.writeFileSync(path.join(targetDir, 'manifest.json'), manifestJson, 'utf-8');
              }
              if (textGuide) {
                fs.writeFileSync(path.join(targetDir, 'طريقة_الربط_والتركيب.txt'), textGuide, 'utf-8');
              }
              if (htmlGuide) {
                fs.writeFileSync(path.join(targetDir, 'طريقة_الربط_والكود.html'), htmlGuide, 'utf-8');
              }

              exec(`explorer.exe "${targetDir}"`, () => {});

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, savedPath: targetDir }));
            });
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    directPrintPlugin(),
    saveAssetsFolderPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'icon-512.png'],
      manifestFilename: 'manifest.json',
      manifest: {
        id: '/',
        name: 'AXONID Poster & Trace Studio',
        short_name: 'AX Poster Trace',
        description: 'استوديو تقسيم البوسترات وإزالة الخلفية وتجهيز خطوط الشف والطباعة',
        theme_color: '#0a2540',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        dir: 'rtl',
        lang: 'ar-EG',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 5000000
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 9876,
    host: true,
    allowedHosts: true
  }
});
