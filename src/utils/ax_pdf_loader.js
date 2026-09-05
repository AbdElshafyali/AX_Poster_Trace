import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function loadPdfDocument(fileOrUrl) {
  let loadingTask;
  if (typeof fileOrUrl === 'string') {
    loadingTask = pdfjsLib.getDocument(fileOrUrl);
  } else {
    const arrayBuffer = await fileOrUrl.arrayBuffer();
    loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  }
  return await loadingTask.promise;
}

export async function renderPdfPageToCanvas(pdfDoc, pageNumber, scale = 2) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  await page.render(renderContext).promise;
  return canvas;
}

export async function extractAllPdfPages(file) {
  const pdfDoc = await loadPdfDocument(file);
  const totalPages = pdfDoc.numPages;
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    const canvas = await renderPdfPageToCanvas(pdfDoc, i, 2);
    pages.push({
      pageNumber: i,
      totalPages,
      canvas,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: canvas.width,
      height: canvas.height,
      fileName: `${file.name} - صفحة ${i}`
    });
  }

  return pages;
}


