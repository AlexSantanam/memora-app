import React, { useState, useEffect, useRef } from "react";
import { Memorial } from "../../types";
import { useApp } from "../../context/AppContext";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import {
  X,
  Printer,
  Download,
  QrCode,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Flame,
  Check,
  Maximize2,
  Info,
  Type,
  Eye,
} from "lucide-react";

export type PrintableFormat = "cuadro" | "urna" | "placa";
export type PrintableTheme = "warm_pergamino" | "clean_white" | "dark_elegance";

interface PrintableMemorialModalProps {
  memorial: Memorial;
  isOpen: boolean;
  onClose: () => void;
}

// Format date strings in natural Spanish
function formatMemorialDate(dateStr?: string): string {
  if (!dateStr) return "";
  const isoMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  }
  return dateStr.trim();
}

// Convert an image URL to safe Base64 data URL to avoid CORS taint
async function urlToBase64Safe(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.92));
            return;
          }
        } catch {
          // fallback
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

// Multi-line word wrapper for Canvas
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Object-fit "cover" drawing on canvas with center-crop
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const imgAspect = imgW / imgH;
  const targetAspect = dw / dh;

  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;

  if (imgAspect > targetAspect) {
    // Image is wider: crop left & right
    sWidth = imgH * targetAspect;
    sx = (imgW - sWidth) / 2;
  } else {
    // Image is taller: crop top & bottom
    sHeight = imgW / targetAspect;
    sy = (imgH - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dw, dh);
}

export const PrintableMemorialModal: React.FC<PrintableMemorialModalProps> = ({
  memorial,
  isOpen,
  onClose,
}) => {
  const { notify } = useApp();
  const [format, setFormat] = useState<PrintableFormat>("cuadro");
  const [theme, setTheme] = useState<PrintableTheme>("warm_pergamino");
  const [showQuote, setShowQuote] = useState(true);
  const [customQuote, setCustomQuote] = useState(memorial.quote || "");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [safePhotoUrl, setSafePhotoUrl] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Stable canonical URL to the memorial
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/m/${memorial.slug}`
      : `https://memora.app/m/${memorial.slug}`;

  const rawPhoto = memorial.mainPhoto || memorial.coverPhoto || "";

  // Synchronize state when memorial changes
  useEffect(() => {
    if (memorial) {
      setCustomQuote(memorial.quote || "");
    }
  }, [memorial]);

  // Pre-load QR Code and Safe Image Base64
  useEffect(() => {
    if (isOpen && memorial) {
      // 1. Generate High-Res QR
      QRCode.toDataURL(
        canonicalUrl,
        {
          width: 800,
          margin: 1,
          color: {
            dark: "#1F1B18",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );

      // 2. Preload and sanitize photo
      if (rawPhoto) {
        urlToBase64Safe(rawPhoto).then((b64) => {
          if (b64) {
            setSafePhotoUrl(b64);
          } else {
            setSafePhotoUrl(rawPhoto);
          }
        });
      } else {
        setSafePhotoUrl("");
      }
    }
  }, [isOpen, memorial, canonicalUrl, rawPhoto]);

  if (!isOpen) return null;

  // Format Dates cleanly
  const birthFormatted = formatMemorialDate(memorial.birthDate);
  const passingFormatted = formatMemorialDate(memorial.passingDate);
  const datesText = [birthFormatted, passingFormatted].filter(Boolean).join(" — ");

  // Load Image Promise Helper
  const loadImg = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load"));
      img.src = src;
    });
  };

  // High-Resolution 2D Canvas Generator with Optical Spacing & Word-Wrap
  const generateHighResCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    let width = 1200;
    let height = 1600;

    if (format === "urna") {
      width = 1200;
      height = 1200;
    } else if (format === "placa") {
      width = 1600;
      height = 1000;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");

    // Colors
    const isDark = theme === "dark_elegance";
    const isWarm = theme === "warm_pergamino";

    const bgColor = isDark ? "#1F1B18" : isWarm ? "#FAF7F2" : "#FFFFFF";
    const primaryTextColor = isDark ? "#FAF7F2" : "#24201D";
    const subTextColor = isDark ? "#D8CEBE" : "#7A4E38";
    const quoteColor = isDark ? "#E5DCD0" : "#4A423B";
    const goldColor = "#C5A880";
    const lightGold = "#E2D3BE";
    const outerBorderColor = isDark ? "#3D352F" : isWarm ? "#D8CEBE" : "#E2DCD4";

    // 1. Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Double Ornamental Borders with Consistent Inset
    const outerInset = 42;
    ctx.strokeStyle = outerBorderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(outerInset, outerInset, width - outerInset * 2, height - outerInset * 2);

    const innerInset = 54;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerInset, innerInset, width - innerInset * 2, height - innerInset * 2);

    // 3. Vintage Corner Flourishes
    const cSize = 28;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = goldColor;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(innerInset, innerInset + cSize);
    ctx.lineTo(innerInset + cSize, innerInset);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - innerInset - cSize, innerInset);
    ctx.lineTo(width - innerInset, innerInset + cSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(innerInset, height - innerInset - cSize);
    ctx.lineTo(innerInset + cSize, height - innerInset);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - innerInset - cSize, height - innerInset);
    ctx.lineTo(width - innerInset, height - innerInset - cSize);
    ctx.stroke();

    const activeQuote = showQuote ? customQuote.trim() : "";

    // ----------------------------------------------------
    // FORMAT 1: CUADRO (Vertical Frame, 1200 x 1600)
    // ----------------------------------------------------
    if (format === "cuadro") {
      let currentY = 80;

      // 1. Photo (Square rounded with center crop) - Enlarged by 30% (520px)
      const photoSize = 520;
      const photoX = (width - photoSize) / 2;
      const photoY = currentY;

      if (safePhotoUrl) {
        try {
          const img = await loadImg(safePhotoUrl);
          ctx.save();
          ctx.beginPath();
          const r = 26;
          ctx.roundRect(photoX, photoY, photoSize, photoSize, [r, r, r, r]);
          ctx.clip();
          drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          // Border for photo
          ctx.strokeStyle = goldColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoSize, photoSize, [r, r, r, r]);
          ctx.stroke();
        } catch {
          // Fallback box
          ctx.fillStyle = isDark ? "#2D2824" : "#F4EFEA";
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoSize, photoSize, [26, 26, 26, 26]);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = isDark ? "#2D2824" : "#F4EFEA";
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoSize, photoSize, [26, 26, 26, 26]);
        ctx.fill();
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Generous spacing (equivalent to line breaks) between photo and name
      currentY += photoSize + 76;

      // 2. Name
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = "center";
      ctx.font = "bold 44px 'Playfair Display', Georgia, serif";
      ctx.fillText(memorial.personName.toUpperCase(), width / 2, currentY);

      // 3. Dates
      if (datesText) {
        currentY += 42;
        ctx.fillStyle = subTextColor;
        ctx.font = "italic 26px Georgia, serif";
        ctx.fillText(datesText, width / 2, currentY);
      }

      // 4. Subtle Gold Divider
      currentY += 28;
      ctx.strokeStyle = lightGold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 80, currentY);
      ctx.lineTo(width / 2 + 80, currentY);
      ctx.stroke();

      ctx.fillStyle = goldColor;
      ctx.font = "14px serif";
      ctx.fillText("◆", width / 2, currentY + 4);

      // 5. Quote with proper word-wrapping & safety margins
      if (activeQuote) {
        currentY += 38;
        ctx.fillStyle = quoteColor;
        ctx.font = "italic 22px Georgia, serif";

        const quoteMaxWidth = 840;
        const quoteLines = wrapCanvasText(ctx, `"${activeQuote}"`, quoteMaxWidth);
        const maxLinesToShow = Math.min(quoteLines.length, 3);
        const lineHeight = 32;

        for (let i = 0; i < maxLinesToShow; i++) {
          ctx.fillText(quoteLines[i], width / 2, currentY);
          currentY += lineHeight;
        }
      }

      // 6. QR Code Card (Positioned harmoniously in bottom area)
      const qrSize = 220;
      const qrX = (width - qrSize) / 2;
      const qrY = height - 420;

      // QR Background Card
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, [16, 16, 16, 16]);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#4A423B" : "#D8CEBE";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (qrDataUrl) {
        try {
          const qrImg = await loadImg(qrDataUrl);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch (e) {
          console.warn(e);
        }
      }

      // 7. Instructions below QR
      ctx.fillStyle = subTextColor;
      ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("ESCANEA PARA CONOCER SU HISTORIA", width / 2, height - 145);

      // 8. Brand Footer
      ctx.fillStyle = goldColor;
      ctx.font = "bold 14px Georgia, serif";
      ctx.fillText("✦  MEMORA  ✦", width / 2, height - 95);
    }

    // ----------------------------------------------------
    // FORMAT 2: URNA (Compact Square, 1200 x 1200)
    // ----------------------------------------------------
    else if (format === "urna") {
      let currentY = 75;

      // Circular Photo with Center Crop - Enlarged by 30% (390px)
      const photoSize = 390;
      const photoX = (width - photoSize) / 2;
      const photoY = currentY;

      if (safePhotoUrl) {
        try {
          const img = await loadImg(safePhotoUrl);
          ctx.save();
          ctx.beginPath();
          ctx.arc(width / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          ctx.strokeStyle = goldColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(width / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        } catch {
          // Placeholder
        }
      }

      // Generous spacing between circular photo and name
      currentY += photoSize + 65;

      // Name
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = "center";
      ctx.font = "bold 38px 'Playfair Display', Georgia, serif";
      ctx.fillText(memorial.personName.toUpperCase(), width / 2, currentY);

      // Dates
      if (datesText) {
        currentY += 34;
        ctx.fillStyle = subTextColor;
        ctx.font = "italic 23px Georgia, serif";
        ctx.fillText(datesText, width / 2, currentY);
      }

      // Quote if available
      if (activeQuote) {
        currentY += 28;
        ctx.fillStyle = quoteColor;
        ctx.font = "italic 20px Georgia, serif";
        const quoteLines = wrapCanvasText(ctx, `"${activeQuote}"`, 820);
        const maxLines = Math.min(quoteLines.length, 2);
        for (let i = 0; i < maxLines; i++) {
          ctx.fillText(quoteLines[i], width / 2, currentY);
          currentY += 26;
        }
      }

      // QR Code Box
      const qrSize = 190;
      const qrX = (width - qrSize) / 2;
      const qrY = height - 350;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, [14, 14, 14, 14]);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#4A423B" : "#D8CEBE";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (qrDataUrl) {
        try {
          const qrImg = await loadImg(qrDataUrl);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch (e) {
          console.warn(e);
        }
      }

      // Scan Call to Action
      ctx.fillStyle = subTextColor;
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("ESCANEA PARA CONOCER SU HISTORIA", width / 2, height - 110);

      // Brand
      ctx.fillStyle = goldColor;
      ctx.font = "bold 13px Georgia, serif";
      ctx.fillText("✦  MEMORA  ✦", width / 2, height - 72);
    }

    // ----------------------------------------------------
    // FORMAT 3: PLACA (Horizontal, 1600 x 1000)
    // ----------------------------------------------------
    else {
      // Left Column: Photo - Enlarged by 30% (520 x 520)
      const photoSize = 520;
      const photoX = 90;
      const photoY = (height - photoSize) / 2;

      if (safePhotoUrl) {
        try {
          const img = await loadImg(safePhotoUrl);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoSize, photoSize, [24, 24, 24, 24]);
          ctx.clip();
          drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          ctx.strokeStyle = goldColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoSize, photoSize, [24, 24, 24, 24]);
          ctx.stroke();
        } catch {
          // Placeholder
        }
      }

      // Center Column: Details & Wrapped Quote
      const centerX = 650;
      let centerStartY = height / 2 - 130;

      ctx.textAlign = "left";
      ctx.fillStyle = primaryTextColor;
      ctx.font = "bold 44px 'Playfair Display', Georgia, serif";
      ctx.fillText(memorial.personName.toUpperCase(), centerX, centerStartY);

      if (datesText) {
        centerStartY += 42;
        ctx.fillStyle = subTextColor;
        ctx.font = "italic 26px Georgia, serif";
        ctx.fillText(datesText, centerX, centerStartY);
      }

      centerStartY += 24;
      ctx.strokeStyle = lightGold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerStartY);
      ctx.lineTo(centerX + 120, centerStartY);
      ctx.stroke();

      if (activeQuote) {
        centerStartY += 34;
        ctx.fillStyle = quoteColor;
        ctx.font = "italic 21px Georgia, serif";
        const quoteLines = wrapCanvasText(ctx, `"${activeQuote}"`, 500);
        const maxLines = Math.min(quoteLines.length, 4);
        for (let i = 0; i < maxLines; i++) {
          ctx.fillText(quoteLines[i], centerX, centerStartY);
          centerStartY += 32;
        }
      }

      centerStartY += 20;
      ctx.fillStyle = goldColor;
      ctx.font = "bold 15px Georgia, serif";
      ctx.fillText("✦  MEMORA  ✦", centerX, centerStartY);

      // Right Column: QR Code Box
      const qrSize = 240;
      const qrX = width - qrSize - 90;
      const qrY = (height - qrSize) / 2 - 25;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, [16, 16, 16, 16]);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#4A423B" : "#D8CEBE";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (qrDataUrl) {
        try {
          const qrImg = await loadImg(qrDataUrl);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch (e) {
          console.warn(e);
        }
      }

      ctx.textAlign = "center";
      ctx.fillStyle = subTextColor;
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("ESCANEA PARA CONOCER SU HISTORIA", qrX + qrSize / 2, qrY + qrSize + 44);
    }

    return canvas;
  };

  // Download High-Resolution PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    notify("info", "Generando documento PDF...", "Preparando recuerdo en alta resolución para imprimir.");

    try {
      const canvas = await generateHighResCanvas();
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: format === "placa" ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvasAspect = canvas.width / canvas.height;
      let renderWidth = pageWidth - 24;
      let renderHeight = renderWidth / canvasAspect;

      if (renderHeight > pageHeight - 24) {
        renderHeight = pageHeight - 24;
        renderWidth = renderHeight * canvasAspect;
      }

      const xPos = (pageWidth - renderWidth) / 2;
      const yPos = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, "JPEG", xPos, yPos, renderWidth, renderHeight);

      const safeName = memorial.personName.replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`Recuerdo-MEMORA-${safeName}-${format}.pdf`);

      notify("success", "PDF descargado con éxito", "Listo para imprimir con proporciones perfectas.");
    } catch (error) {
      console.error("PDF generation failed:", error);
      notify("error", "Error al generar PDF", "Por favor descarga la imagen PNG o usa Imprimir.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download High-Resolution PNG Image
  const handleDownloadImage = async () => {
    setIsDownloadingImage(true);

    try {
      const canvas = await generateHighResCanvas();
      const imgUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      const safeName = memorial.personName.replace(/[^a-zA-Z0-9_-]/g, "_");
      a.href = imgUrl;
      a.download = `Recuerdo-MEMORA-${safeName}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      notify("success", "Imagen PNG descargada", "Lista para revelar o enviar a grabado.");
    } catch (error) {
      console.error("Image download failed:", error);
      notify("error", "Error al descargar imagen", "Por favor prueba nuevamente.");
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Direct Browser Print Dialog (Using sandboxed clean print frame with automatic PDF fallback)
  const handleDirectPrint = async () => {
    setIsPrinting(true);
    notify("info", "Preparando para imprimir...", "Generando documento en alta resolución.");

    try {
      const canvas = await generateHighResCanvas();
      const imgDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      // Clean up previous print iframe if it exists
      const oldFrame = document.getElementById("memora-print-frame");
      if (oldFrame) {
        oldFrame.remove();
      }

      // Create a hidden print iframe to prevent whole-page distortion
      const printIframe = document.createElement("iframe");
      printIframe.id = "memora-print-frame";
      printIframe.style.position = "fixed";
      printIframe.style.right = "0";
      printIframe.style.bottom = "0";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "0";
      printIframe.style.visibility = "hidden";
      document.body.appendChild(printIframe);

      const frameDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
      if (!frameDoc) {
        throw new Error("No frame document available");
      }

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recuerdo MEMORA - ${memorial.personName}</title>
            <style>
              @page {
                size: ${format === "placa" ? "landscape" : "portrait"};
                margin: 0;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              img {
                max-width: 95vw;
                max-height: 95vh;
                object-fit: contain;
                display: block;
                margin: auto;
              }
            </style>
          </head>
          <body>
            <img id="memorial-print-img" src="${imgDataUrl}" alt="Memorial Print" />
          </body>
        </html>
      `);
      frameDoc.close();

      const printImg = frameDoc.getElementById("memorial-print-img") as HTMLImageElement;
      
      const executePrint = () => {
        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
          } catch (printErr) {
            console.warn("Direct window print failed or blocked, downloading PDF fallback...", printErr);
            handleDownloadPDF();
          } finally {
            setIsPrinting(false);
          }
        }, 400);
      };

      if (printImg) {
        if (printImg.complete) {
          executePrint();
        } else {
          printImg.onload = executePrint;
          printImg.onerror = () => {
            handleDownloadPDF();
            setIsPrinting(false);
          };
        }
      } else {
        executePrint();
      }
    } catch (error) {
      console.warn("Direct print encountered error, falling back to high-res PDF download:", error);
      notify("info", "Descargando versión PDF", "Tu navegador prefiere descargar el PDF para imprimirlo con fidelidad total.");
      await handleDownloadPDF();
      setIsPrinting(false);
    }
  };

  const currentDisplayPhoto = safePhotoUrl || rawPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#EAE3D9] flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-[#F4EFEA] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#D8CEBE] flex items-center justify-center text-[#7A4E38] shadow-xs">
              <Printer className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-medium text-[#24201D]">
                  Recuerdo para imprimir
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Alta Resolución
                </span>
              </div>
              <p className="text-xs text-[#5C534B]">
                Diseño optimizado para portarretratos, urnas o grabado en placa con código QR.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#8C827A] hover:text-[#24201D] hover:bg-[#EAE3D9] transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls & Preview Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Customization Controls */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A4E38] block">
                1. Formato de Recuerdo
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setFormat("cuadro")}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                    format === "cuadro"
                      ? "bg-[#FAF7F2] border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-xs"
                      : "bg-white border-[#EAE3D9] hover:bg-[#FAF7F2]/60"
                  }`}
                >
                  <div className="w-7 h-9 rounded border-2 border-[#7A4E38]/50 flex items-center justify-center text-[10px] font-bold text-[#7A4E38] mt-0.5 flex-shrink-0 bg-white">
                    3:4
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#24201D] block">
                      🖼️ Cuadro (Vertical)
                    </span>
                    <span className="text-[11px] text-[#7A7067] leading-tight block">
                      Para enmarcar en un portarretratos 10x15 o 13x18.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("urna")}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                    format === "urna"
                      ? "bg-[#FAF7F2] border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-xs"
                      : "bg-white border-[#EAE3D9] hover:bg-[#FAF7F2]/60"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg border-2 border-[#7A4E38]/50 flex items-center justify-center text-[10px] font-bold text-[#7A4E38] mt-0.5 flex-shrink-0 bg-white">
                    1:1
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#24201D] block">
                      🕊️ Urna (Compacto)
                    </span>
                    <span className="text-[11px] text-[#7A7067] leading-tight block">
                      Foto circular y diseño equilibrado para nicho o urna.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("placa")}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                    format === "placa"
                      ? "bg-[#FAF7F2] border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-xs"
                      : "bg-white border-[#EAE3D9] hover:bg-[#FAF7F2]/60"
                  }`}
                >
                  <div className="w-9 h-6 rounded border-2 border-[#7A4E38]/50 flex items-center justify-center text-[10px] font-bold text-[#7A4E38] mt-0.5 flex-shrink-0 bg-white">
                    16:9
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#24201D] block">
                      🏷️ Placa (Horizontal)
                    </span>
                    <span className="text-[11px] text-[#7A7067] leading-tight block">
                      Para grabado láser en metal, mármol o madera.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A4E38] block">
                2. Acabado y Papel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("warm_pergamino")}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    theme === "warm_pergamino"
                      ? "bg-[#FAF7F2] border-[#C5A880] text-[#24201D] font-bold ring-1 ring-[#C5A880]"
                      : "bg-white border-[#EAE3D9] text-[#7A7067]"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FAF7F2] border border-[#D8CEBE]"></span>
                  <span>Pergamino</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("clean_white")}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    theme === "clean_white"
                      ? "bg-white border-[#C5A880] text-[#24201D] font-bold ring-1 ring-[#C5A880]"
                      : "bg-white border-[#EAE3D9] text-[#7A7067]"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-gray-300"></span>
                  <span>Blanco Puro</span>
                </button>
              </div>
            </div>

            {/* Quote / Dedication Toggle & Edit */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A4E38]">
                  3. Frase o Dedicatoria
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuote(!showQuote)}
                  className="text-[11px] text-[#7A4E38] hover:underline font-semibold cursor-pointer"
                >
                  {showQuote ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {showQuote && (
                <textarea
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  placeholder="Escribe una frase o dedicatoria..."
                  rows={2}
                  maxLength={140}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D8CEBE] focus:outline-none focus:ring-1 focus:ring-[#C5A880] text-[#24201D] bg-white resize-none"
                />
              )}
            </div>

            {/* Helpful reassurance note */}
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-[#5C534B] space-y-1">
              <div className="flex items-center gap-1.5 text-[#7A4E38] font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>QR Activo Permanente</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                El código QR apunta a la dirección en línea de este memorial. Si más adelante agregas más fotos o historias, el QR impreso seguirá funcionando.
              </p>
            </div>

          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
                Vista Previa del Recuerdo
              </span>
              <span className="text-[11px] text-[#8C827A] flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-[#C5A880]" /> Proporción de Impresión
              </span>
            </div>

            {/* Container for card preview */}
            <div className="w-full bg-[#EAE3D9]/40 p-4 sm:p-6 rounded-3xl flex items-center justify-center overflow-hidden border border-[#D8CEBE]/70">
              
              {/* THE CARD PREVIEW */}
              <div
                id="memora-printable-card"
                className={`transition-all duration-300 relative shadow-xl rounded-2xl overflow-hidden ${
                  theme === "warm_pergamino"
                    ? "bg-[#FAF7F2] text-[#24201D] border-2 border-[#D8CEBE]"
                    : theme === "dark_elegance"
                    ? "bg-[#1F1B18] text-[#FAF7F2] border-2 border-[#4A423B]"
                    : "bg-white text-[#24201D] border-2 border-stone-200"
                } ${
                  format === "cuadro"
                    ? "w-full max-w-[340px] sm:max-w-[360px] p-6 text-center"
                    : format === "urna"
                    ? "w-full max-w-[310px] sm:max-w-[330px] p-5 text-center"
                    : "w-full max-w-[480px] sm:max-w-[540px] p-5 sm:p-6"
                }`}
              >
                {/* Double frame in preview */}
                <div className="absolute inset-2 border border-[#C5A880]/60 pointer-events-none rounded-xl"></div>

                {/* Corner ornaments */}
                <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#C5A880] pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#C5A880] pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-[#C5A880] pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-[#C5A880] pointer-events-none"></div>

                {/* --- 1. CUADRO FORMAT (VERTICAL) --- */}
                {format === "cuadro" && (
                  <div className="flex flex-col items-center justify-between space-y-3 relative z-10">
                    {/* Photo - Enlarged 30% */}
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden bg-stone-100 border-2 border-[#C5A880] shadow-sm flex-shrink-0">
                      {currentDisplayPhoto ? (
                        <img
                          src={currentDisplayPhoto}
                          alt={memorial.personName}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F2] text-[#7A4E38]">
                          {memorial.type === "pet" ? (
                            <span className="text-3xl">🐾</span>
                          ) : (
                            <Heart className="w-10 h-10 text-[#C5A880]" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Name & Dates */}
                    <div className="space-y-1 pt-4 sm:pt-5">
                      <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight uppercase leading-snug">
                        {memorial.personName}
                      </h3>
                      {datesText && (
                        <p className="text-xs font-serif text-[#7A4E38] tracking-wider">
                          {datesText}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-16 h-px bg-[#E2D3BE] relative flex items-center justify-center my-0.5">
                      <span className="text-[8px] text-[#C5A880] bg-inherit px-1">◆</span>
                    </div>

                    {/* Short Quote / Phrase with safe margins */}
                    {showQuote && customQuote && (
                      <p className="font-serif italic text-xs text-[#5C534B] px-4 max-w-[280px] leading-relaxed line-clamp-3">
                        "{customQuote}"
                      </p>
                    )}

                    {/* QR Code Block */}
                    <div className="pt-2 flex flex-col items-center space-y-1">
                      <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-[#D8CEBE] shadow-xs flex items-center justify-center">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR ${memorial.personName}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode className="w-12 h-12 text-[#8C827A]" />
                        )}
                      </div>
                      <p className="text-[9px] uppercase tracking-widest text-[#7A4E38] font-bold">
                        Escanea para conocer su historia
                      </p>
                    </div>

                    {/* Brand */}
                    <div className="pt-1 text-[8px] uppercase tracking-widest font-semibold font-serif text-[#C5A880]">
                      ✦ MEMORA ✦
                    </div>
                  </div>
                )}

                {/* --- 2. URNA FORMAT (COMPACT) --- */}
                {format === "urna" && (
                  <div className="flex flex-col items-center justify-between space-y-2.5 relative z-10">
                    {/* Compact Portrait - Enlarged 30% */}
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-stone-100 border-2 border-[#C5A880] shadow-xs flex-shrink-0">
                      {currentDisplayPhoto ? (
                        <img
                          src={currentDisplayPhoto}
                          alt={memorial.personName}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F2] text-[#7A4E38] rounded-full">
                          {memorial.type === "pet" ? (
                            <span className="text-2xl">🐾</span>
                          ) : (
                            <Flame className="w-8 h-8 text-[#C5A880]" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Name & Dates */}
                    <div className="space-y-1 pt-3 sm:pt-4">
                      <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight uppercase leading-snug">
                        {memorial.personName}
                      </h3>
                      {datesText && (
                        <p className="text-[11px] font-serif text-[#7A4E38] tracking-wider">
                          {datesText}
                        </p>
                      )}
                    </div>

                    {/* Quote */}
                    {showQuote && customQuote && (
                      <p className="font-serif italic text-[11px] text-[#5C534B] px-3 max-w-[260px] line-clamp-2 leading-tight">
                        "{customQuote}"
                      </p>
                    )}

                    {/* QR Code */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-20 h-20 bg-white p-1 rounded-lg border border-[#D8CEBE] shadow-2xs flex items-center justify-center">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR ${memorial.personName}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode className="w-10 h-10 text-[#8C827A]" />
                        )}
                      </div>
                      <p className="text-[8px] uppercase tracking-widest text-[#7A4E38] font-bold">
                        Escanea para conocer su historia
                      </p>
                    </div>

                    {/* Brand */}
                    <div className="text-[8px] uppercase tracking-widest font-semibold font-serif text-[#C5A880]">
                      ✦ MEMORA ✦
                    </div>
                  </div>
                )}

                {/* --- 3. PLACA FORMAT (HORIZONTAL) --- */}
                {format === "placa" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left relative z-10">
                    {/* Left: Photo - Enlarged 30% */}
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-stone-100 border-2 border-[#C5A880] shadow-sm flex-shrink-0">
                      {currentDisplayPhoto ? (
                        <img
                          src={currentDisplayPhoto}
                          alt={memorial.personName}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F2] text-[#7A4E38]">
                          {memorial.type === "pet" ? (
                            <span className="text-3xl">🐾</span>
                          ) : (
                            <Heart className="w-8 h-8 text-[#C5A880]" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Center: Info */}
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight uppercase leading-tight">
                        {memorial.personName}
                      </h3>
                      {datesText && (
                        <p className="text-xs font-serif text-[#7A4E38] tracking-wide">
                          {datesText}
                        </p>
                      )}
                      {showQuote && customQuote && (
                        <p className="font-serif italic text-[11px] text-[#5C534B] line-clamp-3 leading-relaxed">
                          "{customQuote}"
                        </p>
                      )}
                      <div className="pt-0.5 text-[8px] uppercase tracking-widest font-semibold font-serif text-[#C5A880]">
                        ✦ MEMORA ✦
                      </div>
                    </div>

                    {/* Right: QR Code */}
                    <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                      <div className="w-22 h-22 bg-white p-1 rounded-xl border border-[#D8CEBE] shadow-2xs flex items-center justify-center">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR ${memorial.personName}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode className="w-10 h-10 text-[#8C827A]" />
                        )}
                      </div>
                      <p className="text-[8px] uppercase tracking-widest text-[#7A4E38] font-bold text-center max-w-[90px]">
                        Escanea para ver su historia
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#F4EFEA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#7A7067]">
            <Info className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
            <span>Formato A4 optimizado con código QR de alta resolución.</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {/* Direct Print */}
            <button
              type="button"
              onClick={handleDirectPrint}
              disabled={isPrinting || isDownloadingImage || isGeneratingPdf}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Printer className="w-3.5 h-3.5 text-[#7A4E38]" />
              <span>{isPrinting ? "Preparando..." : "Imprimir"}</span>
            </button>

            {/* PNG Image Download */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloadingImage || isGeneratingPdf}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#7A4E38]" />
              <span>Guardar Imagen (PNG)</span>
            </button>

            {/* PDF Primary Download */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf || isDownloadingImage}
              className="px-6 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
              id="download-printable-pdf-btn"
            >
              <Download className="w-4 h-4 text-[#C5A880]" />
              <span>{isGeneratingPdf ? "Generando PDF..." : "Descargar PDF para imprimir"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
