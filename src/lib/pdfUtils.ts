import { ResearchField } from '@/types/user';
import * as pdfjs from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

export interface ExtractedPdfData {
  title: string;
  researchField: ResearchField | null;
  supervisor1: string;
  supervisor2: string;
  errors?: string[];
}

const getPdfText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    interface TransformedTextItem extends TextItem {
      transform: number[]; // [scaleX, skewY, skewX, scaleY, x, y]
      width: number;
    }

    const textItems = textContent.items.filter(
      item => 'str' in item && 'transform' in item && item.str.trim().length > 0
    ) as TransformedTextItem[];

    if (textItems.length === 0) continue;

    const lineGroups: TransformedTextItem[][] = [];
    const yTolerance = 5;

    for (const item of textItems) {
      let addedToLine = false;
      for (const group of lineGroups) {
        if (Math.abs(item.transform[5] - group[0].transform[5]) <= yTolerance) {
          group.push(item);
          addedToLine = true;
          break;
        }
      }
      if (!addedToLine) {
        lineGroups.push([item]);
      }
    }

    lineGroups.sort((a, b) => b[0].transform[5] - a[0].transform[5]);

    const processedLines = lineGroups.map(group => {
      group.sort((a, b) => a.transform[4] - b.transform[4]);
      let lineText = "";
      let lastX = -1;
      let lastWidth = 0;

      for (let i = 0; i < group.length; i++) {
        const item = group[i];
        const currentX = item.transform[4];

        if (i > 0) {
          const gap = currentX - (lastX + lastWidth);
          const avgCharWidth = lastWidth / (group[i - 1].str.length || 1);
          if (gap > avgCharWidth * 0.4) {
            lineText += " ";
          }
        }
        lineText += item.str;
        lastX = currentX;
        lastWidth = item.width;
      }
      return lineText;
    });

    fullText += processedLines.join('\n') + '\n';
  }

  return fullText;
}

function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  normalized = normalized.replace(/penenelitian/g, 'penelitian');
  return normalized
    .replace(/[\n\r\s]+/g, ' ')
    .replace(/\s*:\s*/g, ': ')
    .trim();
}

/**
 * [FUNGSI BARU] Normalisasi dan format string nama dan gelar akademik dengan cerdas.
 * Fungsi ini menangani berbagai format input, spasi, dan kapitalisasi
 * untuk menghasilkan output yang konsisten dan bersih.
 *
 * @param rawString - String mentah yang akan diformat, contoh: "  dr.   budi burhanudin  , s.hum.,m.hum. "
 * @returns String yang sudah diformat, contoh: "Dr. Budi Burhanudin, S.Hum., M.Hum."
 */
function normalizeNameAndTitle(rawString: string): string {
  if (!rawString || typeof rawString !== 'string') return '';

  // 1. Pembersihan Awal: hapus spasi berlebih, normalkan spasi di sekitar koma.
  let cleaned = rawString.replace(/\s+/g, ' ').trim();

  // 2. Pisahkan Nama dan Gelar Suffix (memisahkan hanya pada koma pertama)
  // const parts = cleaned.split(/,(.*)/s);
  // [PERBAIKAN UTAMA DI SINI] Mengganti /s flag dengan [\s\S]*
  const parts = cleaned.split(/,([\s\S]*)/);
  let namePart = parts[0].trim();
  const titlePart = (parts[1] || '').trim();

  // 3. Format Bagian Nama (termasuk gelar prefix seperti Dr. atau Prof.)
  const formattedName = namePart
    .split(' ')
    .map(word => {
      // Jika kata adalah gelar prefix (diakhiri titik), format dengan benar.
      if (word.toLowerCase() === 'dr.' || word.toLowerCase() === 'prof.') {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // Kapitalisasi setiap bagian nama biasa
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  if (!titlePart) {
    return formattedName;
  }

  // 4. Format Bagian Gelar Suffix
  const formattedTitles = titlePart
    .split(',')
    .map(degree => {
      // Untuk setiap gelar (e.g., "s.hum." atau "m.m.")
      return degree
        .trim()
        // Kapitalisasi setiap huruf yang diawali oleh titik atau awal string
        .replace(/(^|\.)\s*([a-z])/g, (_match, separator, char) => `${separator.trim()}${char.toUpperCase()}`);
    })
    .join(', ');

  return `${formattedName}, ${formattedTitles}`;
}


function extractInfo(normalizedText: string): ExtractedPdfData {
  const allKeywords = ['judul penelitian', 'bidang penelitian', 'dosen pembimbing 1', 'dosen pembimbing 2', 'mata kuliah pilihan'];

  const extractRawText = (currentKeyword: string): string => {
    const otherKeywords = allKeywords.filter(k => k !== currentKeyword).join('|');
    const pattern = new RegExp(`${currentKeyword}\\s*:\\s*(.*?)(?=\\s*(?:${otherKeywords})\\s*:|$)`);
    const match = normalizedText.match(pattern);
    return match && match[1] ? match[1].trim() : '';
  };

  // Fungsi sederhana untuk kapitalisasi judul
  const formatTitle = (text: string): string => {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // 1. Ekstrak teks mentah untuk setiap field
  const titleRaw = extractRawText('judul penelitian');
  const researchFieldRaw = extractRawText('bidang penelitian');
  const supervisor1Raw = extractRawText('dosen pembimbing 1');
  const supervisor2Raw = extractRawText('dosen pembimbing 2');

  console.log("Raw Extracted Values:", { titleRaw, researchFieldRaw, supervisor1Raw, supervisor2Raw });

  // 2. [FIX] Gunakan fungsi normalisasi baru yang lebih cerdas
  const title = formatTitle(titleRaw);
  const supervisor1 = normalizeNameAndTitle(supervisor1Raw);
  const supervisor2 = normalizeNameAndTitle(supervisor2Raw);

  // 3. Tentukan bidang penelitian
  const researchField: ResearchField | null =
    researchFieldRaw.toUpperCase() === 'NIC' ? 'NIC' :
      researchFieldRaw.toUpperCase() === 'AES' ? 'AES' :
        null;

  console.log("Final Extracted Data:", { title, researchField, supervisor1, supervisor2 });

  return { title, researchField, supervisor1, supervisor2 };
}

export async function processPdf(file: File): Promise<ExtractedPdfData> {
  const rawText = await getPdfText(file);
  const normalizedText = normalizeText(rawText);
  const extractedData = extractInfo(normalizedText);

  const errors: string[] = [];
  if (!extractedData.title) errors.push("Judul penelitian tidak dapat ditemukan.");
  if (!extractedData.researchField) errors.push("Bidang penelitian tidak dapat ditemukan atau tidak valid (harus AES atau NIC).");
  if (!extractedData.supervisor1) errors.push("Dosen Pembimbing 1 tidak dapat ditemukan.");
  if (!extractedData.supervisor2) errors.push("Dosen Pembimbing 2 tidak dapat ditemukan.");

  return { ...extractedData, errors };
}
