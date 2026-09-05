import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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

export default defineConfig({
  plugins: [react(), directPrintPlugin()],
  server: {
    port: 8787,
    host: true,
    allowedHosts: true
  }
});
