export const WEB_ASSET_PRESETS = [
  {
    id: 'original_clean',
    fileName: 'logo-clean-original.png',
    title: 'الصورة الأصلية الكاملة (شفافة PNG)',
    usage: 'النسخة الأساسية عالية الدقة بعد إزالة الخلفية للاستخدام العام',
    category: 'الأساسية',
    width: 0,
    height: 0,
    mode: 'original'
  },
  {
    id: 'favicon_16',
    fileName: 'favicon-16x16.png',
    title: 'أيقونة تاب المتصفح المصغرة (Tab Icon)',
    usage: 'تظهر في شريط علامات التبويب بجانب اسم الموقع في المتصفحات',
    category: 'أيقونات التاب (Favicons)',
    width: 16,
    height: 16,
    mode: 'contain'
  },
  {
    id: 'favicon_32',
    fileName: 'favicon-32x32.png',
    title: 'أيقونة تاب المتصفح القياسية (Favicon 32×32)',
    usage: 'المقاس الأساسي لأيقونة التاب والـ Bookmarks في كروم وإيدج',
    category: 'أيقونات التاب (Favicons)',
    width: 32,
    height: 32,
    mode: 'contain'
  },
  {
    id: 'favicon_48',
    fileName: 'favicon-48x48.png',
    title: 'أيقونة نتائج بحث جوجل وسطح المكتب (48×48)',
    usage: 'تظهر بجانب رابط الموقع في محركات البحث واختصارات سطح المكتب',
    category: 'أيقونات التاب (Favicons)',
    width: 48,
    height: 48,
    mode: 'contain'
  },
  {
    id: 'apple_touch',
    fileName: 'apple-touch-icon.png',
    title: 'أيقونة الآيفون والآيباد (Apple Touch Icon)',
    usage: 'تظهر عند إضافة الموقع للشاشة الرئيسية على أجهزة iOS و Safari',
    category: 'تطبيقات PWA والموبايل',
    width: 180,
    height: 180,
    mode: 'contain'
  },
  {
    id: 'pwa_192',
    fileName: 'pwa-192x192.png',
    title: 'أيقونة تطبيق الـ PWA للموبايل والكمبيوتر (192×192)',
    usage: 'شرط إجباري في manifest.json لتثبيت النظام كتطبيق مستقل بضغطة واحدة',
    category: 'تطبيقات PWA والموبايل',
    width: 192,
    height: 192,
    mode: 'contain'
  },
  {
    id: 'pwa_512',
    fileName: 'pwa-512x512.png',
    title: 'أيقونة تطبيق الـ PWA وشاشة الفتح (512×512)',
    usage: 'شرط إجباري في manifest.json لشاشة بدء التطبيق (Splash Screen) والمتجر',
    category: 'تطبيقات PWA والموبايل',
    width: 512,
    height: 512,
    mode: 'contain'
  },
  {
    id: 'pwa_maskable',
    fileName: 'icon-512.png',
    title: 'أيقونة PWA القابلة للقص الآمن (Maskable 512×512)',
    usage: 'مزودة بهامش أمان داخلي لمنع قص أطراف اللوجو داخل دوائر أندرويد',
    category: 'تطبيقات PWA والموبايل',
    width: 512,
    height: 512,
    mode: 'maskable'
  },
  {
    id: 'header_logo',
    fileName: 'logo-header.png',
    title: 'شعار الهيدر والسايدبار للموقع (Header / Navbar)',
    usage: 'مقاس مثالي خفيف وسريع التحميل لوضعه في أعلى الموقع والـ Sidebar',
    category: 'واجهات الموقع والشبكات',
    width: 400,
    height: 140,
    mode: 'contain'
  },
  {
    id: 'og_social',
    fileName: 'og-image.png',
    title: 'صورة معاينة الرابط (OpenGraph / WhatsApp & Social)',
    usage: 'تظهر تلقائياً عند إرسال رابط الموقع في واتساب أو فيسبوك أو لينكدإن',
    category: 'واجهات الموقع والشبكات',
    width: 1200,
    height: 630,
    mode: 'social'
  },
  {
    id: 'site_bg_watermark',
    fileName: 'site-bg-watermark.png',
    title: 'خلفية الموقع / العلامة المائية (Background 1920×1080)',
    usage: 'خلفية كاملة للموقع أو شاشة تسجيل الدخول بشفافية مائية هادئة',
    category: 'واجهات الموقع والشبكات',
    width: 1920,
    height: 1080,
    mode: 'watermark'
  }
];

export function renderAssetSizeCanvas(
  sourceCanvas,
  preset,
  options = {}
) {
  const {
    paddingPercent = 10,
    bgMode = 'transparent',
    bgColor = '#ffffff',
    watermarkOpacity = 0.08
  } = options;

  const sW = sourceCanvas.width;
  const sH = sourceCanvas.height;

  const targetW = preset.mode === 'original' ? sW : preset.width;
  const targetH = preset.mode === 'original' ? sH : preset.height;

  const out = document.createElement('canvas');
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const shouldFillBg =
    bgMode === 'solid' ||
    preset.mode === 'maskable' ||
    preset.mode === 'social';

  if (shouldFillBg) {
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  if (preset.mode === 'original') {
    ctx.drawImage(sourceCanvas, 0, 0);
    return out;
  }

  let effectivePad = paddingPercent / 100;
  if (preset.mode === 'maskable') {
    effectivePad = Math.max(0.2, effectivePad);
  } else if (preset.mode === 'social') {
    effectivePad = Math.max(0.18, effectivePad);
  } else if (preset.mode === 'watermark') {
    effectivePad = 0.22;
  }

  const availW = targetW * (1 - effectivePad * 2);
  const availH = targetH * (1 - effectivePad * 2);

  const sRatio = sW / sH;
  const aRatio = availW / availH;

  let drawW, drawH;
  if (sRatio > aRatio) {
    drawW = availW;
    drawH = drawW / sRatio;
  } else {
    drawH = availH;
    drawW = drawH * sRatio;
  }

  const dx = (targetW - drawW) / 2;
  const dy = (targetH - drawH) / 2;

  ctx.save();
  if (preset.mode === 'watermark') {
    ctx.globalAlpha = watermarkOpacity;
  }
  ctx.drawImage(sourceCanvas, 0, 0, sW, sH, dx, dy, drawW, drawH);
  ctx.restore();

  return out;
}

export function triggerDataUrlDownload(dataUrl, fileName) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateIntegrationGuideFiles(generatedAssets, projectName = 'AXONID_System') {
  const manifestJson = JSON.stringify(
    {
      id: '/',
      name: projectName,
      short_name: projectName,
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
    null,
    2
  );

  const textGuide = `======================================================================
دليل طريقة ربط اللوجو والأيقونات والـ PWA والخلفية في موقعك (AXONID KIT)
======================================================================

1. مكان وضع الصور:
-----------------
انقل جميع ملفات الـ PNG الموجودة في هذا الفولدر + ملف manifest.json
وضعها مباشرة داخل مجلد (public/) في مشروعك.

قائمة الملفات الموجودة في هذا الفولدر ووظيفة كل ملف:
${generatedAssets.map((a) => `- ${a.fileName} (${a.actualWidth}x${a.actualHeight}px) -> ${a.title}: ${a.usage}`).join('\n')}

----------------------------------------------------------------------
2. كود الربط داخل وسم <head> في ملف (index.html):
----------------------------------------------------------------------
<!-- أيقونات تاب المتصفح Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />

<!-- أيقونة شاشة الآيفون والآيباد -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<!-- ملف تعريف تطبيق الـ PWA -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0a2540" />

<!-- صورة معاينة الرابط في واتساب وفيسبوك ولينكدإن -->
<meta property="og:image" content="/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- سكربت التقاط حدث تثبيت تطبيق الـ PWA بضغطة واحدة -->
<script>
  window.__deferredPwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__deferredPwaPrompt = e;
    window.dispatchEvent(new Event('ax-pwa-ready'));
  });
</script>

----------------------------------------------------------------------
3. طريقة تركيب خلفية الموقع المائية (site-bg-watermark.png) في الـ CSS:
----------------------------------------------------------------------
body {
  background-image: url('/site-bg-watermark.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  background-size: cover;
}

----------------------------------------------------------------------
4. طريقة وضع اللوجو في الهيدر والـ Sidebar:
----------------------------------------------------------------------
<img src="/logo-header.png" alt="Logo" className="h-10 w-auto object-contain" />
`;

  const htmlGuide = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>دليل ربط ومعاينة حزمة اللوجو والـ PWA — ${projectName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { background: #0a2540; color: #fff; padding: 24px; border-radius: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0 0 8px 0; font-size: 22px; }
    .header p { margin: 0; color: #bae6fd; font-size: 14px; }
    .card { background: #fff; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
    .card h2 { margin-top: 0; font-size: 17px; color: #0a2540; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    pre { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 10px; overflow-x: auto; direction: ltr; text-align: left; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .asset-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #fff; text-align: center; }
    .asset-preview { height: 110px; display: flex; align-items: center; justify-content: center; background: repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 16px 16px; border-radius: 8px; margin-bottom: 10px; padding: 8px; }
    .asset-preview img { max-height: 95px; max-width: 100%; object-fit: contain; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; font-family: monospace; direction: ltr; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>حزمة اللوجو والأيقونات ومقاسات الـ PWA وطريقة الربط (${projectName})</h1>
      <p>تم توليد وحفظ جميع الصور في هذا الفولدر بأسمائها القياسية الجاهزة للتركيب في فولدر public/ مباشرة</p>
    </div>

    <div class="card">
      <h2>1. معاينة جميع المقاسات المحفوظة في هذا الفولدر ووظيفة كل مقاس</h2>
      <div class="grid">
        ${generatedAssets
          .map(
            (a) => `
          <div class="asset-box">
            <div class="asset-preview">
              <img src="./${a.fileName}" alt="${a.title}" />
            </div>
            <div style="font-weight:bold; font-size:14px; color:#0a2540;">${a.title}</div>
            <div style="font-size:12px; color:#64748b; margin:4px 0 8px;">${a.usage}</div>
            <span class="badge">${a.fileName} (${a.actualWidth}×${a.actualHeight})</span>
          </div>`
          )
          .join('')}
      </div>
    </div>

    <div class="card">
      <h2>2. خطوة التركيب الأولى: نسخ الملفات إلى مجلد public/</h2>
      <p>انسخ جميع الصور الموجودة في هذا الفولدر مع ملف <code>manifest.json</code> وضعها داخل مجلد <code>public/</code> في مشروعك.</p>
    </div>

    <div class="card">
      <h2>3. كود الربط الجاهز داخل &lt;head&gt; في ملف index.html</h2>
      <pre>&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /&gt;
&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /&gt;
&lt;link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" /&gt;
&lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /&gt;
&lt;link rel="manifest" href="/manifest.json" /&gt;
&lt;meta name="theme-color" content="#0a2540" /&gt;
&lt;meta property="og:image" content="/og-image.png" /&gt;
&lt;script&gt;
  window.__deferredPwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__deferredPwaPrompt = e;
    window.dispatchEvent(new Event('ax-pwa-ready'));
  });
&lt;/script&gt;</pre>
    </div>

    <div class="card">
      <h2>4. كود استخدام اللوجو كخلفية مائية للموقع (CSS) وشعار للهيدر</h2>
      <pre>/* في ملف index.css لعمل خلفية مائية للموقع */
body {
  background-image: url('/site-bg-watermark.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  background-size: cover;
}

/* في الهيدر أو الـ Sidebar */
&lt;img src="/logo-header.png" alt="Logo" className="h-10 w-auto object-contain" /&gt;</pre>
    </div>
  </div>
</body>
</html>`;

  return {
    manifestJson,
    textGuide,
    htmlGuide
  };
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function saveAssetsToChosenFolder(generatedAssets, folderName = 'AX_Logo_Web_PWA_Kit') {
  const cleanFolder = folderName.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_') || 'AX_Logo_Web_PWA_Kit';
  const { manifestJson, textGuide, htmlGuide } = generateIntegrationGuideFiles(generatedAssets, cleanFolder);

  try {
    const res = await fetch('/api/save-assets-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folderName: cleanFolder,
        assets: generatedAssets.map((a) => ({
          fileName: a.fileName,
          dataUrl: a.dataUrl
        })),
        manifestJson,
        textGuide,
        htmlGuide
      })
    });

    const data = await res.json();
    if (data && data.success) {
      return { success: true, path: data.savedPath, method: 'server_dialog' };
    }
    if (data && data.canceled) {
      return { success: false, canceled: true };
    }
  } catch (err) {
    console.warn('Local server folder dialog fallback to browser picker:', err);
  }

  if (typeof window.showDirectoryPicker === 'function') {
    const parentHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const targetDirHandle = await parentHandle.getDirectoryHandle(cleanFolder, { create: true });

    for (const asset of generatedAssets) {
      const fileHandle = await targetDirHandle.getFileHandle(asset.fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(dataUrlToUint8Array(asset.dataUrl));
      await writable.close();
    }

    const writeTextFile = async (name, content) => {
      const fh = await targetDirHandle.getFileHandle(name, { create: true });
      const w = await fh.createWritable();
      await w.write(content);
      await w.close();
    };

    await writeTextFile('manifest.json', manifestJson);
    await writeTextFile('طريقة_الربط_والتركيب.txt', textGuide);
    await writeTextFile('طريقة_الربط_والكود.html', htmlGuide);

    return {
      success: true,
      path: `${parentHandle.name}/${cleanFolder}`,
      method: 'browser_picker'
    };
  }

  throw new Error('لم يتمكن المتصفح من فتح نافذة اختيار الفولدر.');
}
